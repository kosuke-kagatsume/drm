"""
RAG Service Implementation
Handles retrieval and generation using LangChain + OpenAI/Claude
"""

import asyncio
import time
import uuid
from typing import Dict, List, Any, Optional
import logging
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import PGVector
from langchain_community.chat_models import ChatAnthropic
from langchain.schema import Document
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
import tiktoken

from ..core.database import get_database
from ..models.schemas import UserContext, QueryFilter, MaskPolicy
from .mask_service import MaskPolicyService
from .monitoring_service import MonitoringService

logger = logging.getLogger(__name__)


class RAGService:
    def __init__(self):
        self.openai_llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.1,
            max_tokens=1000
        )
        
        self.claude_llm = ChatAnthropic(
            model="claude-3-haiku-20240307",
            temperature=0.1,
            max_tokens=2000
        )
        
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
        self.mask_service = MaskPolicyService()
        self.monitoring = MonitoringService()
        
        # Token counter for OpenAI
        self.tokenizer = tiktoken.get_encoding("cl100k_base")

    async def retrieve_and_generate(
        self, 
        query: str,
        tenant_id: str,
        filters: Optional[Dict[str, Any]] = None,
        user_context: Optional[UserContext] = None
    ) -> Dict[str, Any]:
        """
        Main RAG function: retrieve relevant documents and generate answer
        """
        start_time = time.time()
        query_id = str(uuid.uuid4())
        
        try:
            logger.info(f"Processing RAG query: {query_id}")
            
            # 1. Get mask policy for user
            mask_policy = await self.mask_service.get_mask_policy(user_context)
            
            # 2. Retrieve relevant documents
            retrieved_docs = await self._retrieve_documents(
                query=query,
                tenant_id=tenant_id,
                filters=filters,
                mask_policy=mask_policy
            )
            
            if not retrieved_docs:
                return await self._handle_no_results(query, query_id, start_time)
            
            # 3. Choose LLM based on context length
            total_tokens = self._count_tokens(query + " ".join([doc.page_content for doc in retrieved_docs]))
            llm = self.claude_llm if total_tokens > 3000 else self.openai_llm
            
            # 4. Generate answer with context
            answer = await self._generate_answer(
                query=query,
                documents=retrieved_docs,
                llm=llm,
                mask_policy=mask_policy
            )
            
            # 5. Apply masking to final answer
            masked_answer = await self.mask_service.apply_masking(answer, mask_policy)
            
            # 6. Calculate confidence and response time
            response_time_ms = int((time.time() - start_time) * 1000)
            confidence = self._calculate_confidence(retrieved_docs, answer)
            
            # 7. Log query for monitoring
            await self._log_query(
                query_id=query_id,
                user_id=user_context.user_id if user_context else None,
                query=query,
                answer=masked_answer,
                retrieved_docs=[doc.metadata.get("document_id", "") for doc in retrieved_docs],
                confidence=confidence,
                response_time=response_time_ms
            )
            
            # 8. Update metrics
            await self.monitoring.record_query_metrics(
                response_time_ms=response_time_ms,
                confidence=confidence,
                doc_count=len(retrieved_docs)
            )
            
            return {
                "answer": masked_answer,
                "confidence": confidence,
                "sources": [
                    {
                        "chunk_index": doc.metadata.get("chunk_index", 0),
                        "text": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                        "page_number": doc.metadata.get("page_number"),
                        "confidence_score": doc.metadata.get("score", 0.0),
                        "metadata": {
                            "document_id": doc.metadata.get("document_id"),
                            "file_name": doc.metadata.get("file_name"),
                            "doc_type": doc.metadata.get("doc_type")
                        }
                    }
                    for doc in retrieved_docs
                ],
                "retrieved_docs": [doc.metadata.get("document_id", "") for doc in retrieved_docs],
                "response_time_ms": response_time_ms,
                "query_id": query_id
            }
            
        except Exception as e:
            logger.error(f"RAG service error for query {query_id}: {str(e)}")
            await self.monitoring.record_error(str(e))
            raise

    async def _retrieve_documents(
        self,
        query: str,
        tenant_id: str,
        filters: Optional[Dict[str, Any]] = None,
        mask_policy: Optional[MaskPolicy] = None
    ) -> List[Document]:
        """Retrieve relevant documents from vector database"""
        
        try:
            # Build search filter with RLS (Row-Level Security)
            search_filter = {"company_id": tenant_id}
            
            if filters:
                if "doc_types" in filters:
                    search_filter["doc_type"] = {"$in": filters["doc_types"]}
                if "store_ids" in filters:
                    search_filter["store_id"] = {"$in": filters["store_ids"]}
                if "project_ids" in filters:
                    search_filter["project_id"] = {"$in": filters["project_ids"]}
            
            # Apply mask policy filters
            if mask_policy and mask_policy.allowed_doc_types:
                search_filter["doc_type"] = {"$in": mask_policy.allowed_doc_types}
            
            # Create vector store connection
            vector_store = PGVector(
                collection_name="rag_embeddings",
                embedding_function=self.embeddings,
                connection_string=await get_database().get_connection_string(),
                pre_delete_collection=False
            )
            
            # Perform similarity search
            docs = await vector_store.asimilarity_search_with_score(
                query=query,
                k=5,
                filter=search_filter
            )
            
            # Convert to Document objects with scores
            retrieved_docs = []
            for doc, score in docs:
                doc.metadata["score"] = float(score)
                retrieved_docs.append(doc)
            
            logger.info(f"Retrieved {len(retrieved_docs)} documents for tenant {tenant_id}")
            return retrieved_docs
            
        except Exception as e:
            logger.error(f"Document retrieval error: {str(e)}")
            return []

    async def _generate_answer(
        self,
        query: str,
        documents: List[Document],
        llm,
        mask_policy: Optional[MaskPolicy] = None
    ) -> str:
        """Generate answer using LangChain conversation chain"""
        
        try:
            # Prepare context from retrieved documents
            context_texts = []
            for doc in documents:
                context = f"[出典: {doc.metadata.get('file_name', '不明')}]\\n{doc.page_content}"
                context_texts.append(context)
            
            combined_context = "\\n\\n".join(context_texts)
            
            # Create conversation chain
            memory = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True,
                output_key="answer"
            )
            
            # Japanese prompt template
            prompt_template = f"""あなたは建設・リフォーム業界のプロフェッショナルアシスタントです。
            提供された情報を基に、正確で分かりやすい回答をしてください。

            コンテキスト:
            {combined_context}

            質問: {query}

            回答の際は以下を心がけてください:
            1. 提供された情報のみを使用する
            2. 確実でない場合は「情報が不十分です」と伝える
            3. 可能であれば出典を明記する
            4. 日本語で回答する
            5. 専門用語は分かりやすく説明する

            回答:"""
            
            # Generate response
            response = await llm.ainvoke(prompt_template)
            answer = response.content if hasattr(response, 'content') else str(response)
            
            return answer
            
        except Exception as e:
            logger.error(f"Answer generation error: {str(e)}")
            return "申し訳ございませんが、回答の生成中にエラーが発生しました。"

    async def _handle_no_results(self, query: str, query_id: str, start_time: float) -> Dict[str, Any]:
        """Handle case when no documents are retrieved"""
        
        response_time_ms = int((time.time() - start_time) * 1000)
        
        # TODO: Implement similar Q&A template suggestions
        fallback_answer = "該当する情報が見つかりませんでした。より具体的なキーワードで検索してみてください。"
        
        return {
            "answer": fallback_answer,
            "confidence": 0.0,
            "sources": [],
            "retrieved_docs": [],
            "response_time_ms": response_time_ms,
            "query_id": query_id
        }

    def _count_tokens(self, text: str) -> int:
        """Count tokens in text using OpenAI tokenizer"""
        return len(self.tokenizer.encode(text))

    def _calculate_confidence(self, documents: List[Document], answer: str) -> float:
        """Calculate confidence score based on document similarity scores"""
        if not documents:
            return 0.0
        
        scores = [doc.metadata.get("score", 0.0) for doc in documents]
        avg_score = sum(scores) / len(scores)
        
        # Normalize score to 0-1 range (assuming similarity scores are 0-1)
        confidence = min(max(avg_score, 0.0), 1.0)
        
        return confidence

    async def _log_query(
        self,
        query_id: str,
        user_id: Optional[str],
        query: str,
        answer: str,
        retrieved_docs: List[str],
        confidence: float,
        response_time: int
    ) -> None:
        """Log query for audit and monitoring"""
        
        try:
            db = await get_database()
            await db.execute(
                """
                INSERT INTO rag_query_logs (id, user_id, query, answer, retrieved_docs, confidence, response_time, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                """,
                query_id, user_id, query, answer, retrieved_docs, confidence, response_time
            )
        except Exception as e:
            logger.error(f"Query logging error: {str(e)}")
            # Don't fail the main request due to logging errors