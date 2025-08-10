"""
DRM Suite RAG API Service
FastAPI + LangChain + pgvector implementation
"""

from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
import logging
from contextlib import asynccontextmanager

from src.services.rag_service import RAGService
from src.services.document_service import DocumentService
from src.services.embedding_service import EmbeddingService
from src.models.schemas import (
    RAGQuery,
    RAGResponse,
    DocumentUpload,
    DocumentResponse,
    HealthResponse
)
from src.core.database import init_db
from src.core.config import settings
from src.middleware.auth import verify_token
from src.middleware.metrics import setup_metrics

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize security
security = HTTPBearer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    logger.info("Starting RAG API service...")
    await init_db()
    setup_metrics(app)
    yield
    # Shutdown
    logger.info("Shutting down RAG API service...")


# Initialize FastAPI app
app = FastAPI(
    title="DRM Suite RAG API",
    description="Retrieval-Augmented Generation service for DRM Suite",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
rag_service = RAGService()
document_service = DocumentService()
embedding_service = EmbeddingService()


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="rag-api",
        version="1.0.0"
    )


@app.post("/rag/query", response_model=RAGResponse)
async def query_rag(
    query: RAGQuery,
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """Query RAG system with retrieval and generation"""
    try:
        # Verify token and get user context
        user_context = await verify_token(credentials.credentials)
        
        # Perform RAG query with user context for security filtering
        result = await rag_service.retrieve_and_generate(
            query=query.query,
            tenant_id=user_context.company_id,
            filters=query.filters,
            user_context=user_context
        )
        
        return RAGResponse(**result)
    
    except Exception as e:
        logger.error(f"RAG query error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/documents/upload", response_model=DocumentResponse)
async def upload_document(
    document: DocumentUpload,
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """Upload and process document for RAG"""
    try:
        user_context = await verify_token(credentials.credentials)
        
        # Process document
        result = await document_service.process_document(
            document=document,
            user_context=user_context
        )
        
        return DocumentResponse(**result)
    
    except Exception as e:
        logger.error(f"Document upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/documents/{document_id}/status")
async def get_document_status(
    document_id: str,
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """Get document processing status"""
    try:
        user_context = await verify_token(credentials.credentials)
        
        status = await document_service.get_processing_status(
            document_id=document_id,
            user_context=user_context
        )
        
        return status
    
    except Exception as e:
        logger.error(f"Document status error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/embeddings/reindex")
async def reindex_embeddings(
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """Trigger embedding reindexing"""
    try:
        user_context = await verify_token(credentials.credentials)
        
        # Only allow admin users to trigger reindexing
        if not user_context.is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        result = await embedding_service.reindex_all(user_context.company_id)
        
        return {"status": "started", "task_id": result}
    
    except Exception as e:
        logger.error(f"Reindex error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
    from fastapi import Response
    
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )