"""
Pydantic models for RAG API
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum


class DocumentType(str, Enum):
    ESTIMATE_PDF = "estimate_pdf"
    COST_PDF = "cost_pdf" 
    CONTRACT_PDF = "contract_pdf"
    INVENTORY_CSV = "inventory_csv"
    MANUAL_MD = "manual_md"


class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class RAGQuery(BaseModel):
    query: str = Field(..., description="User query text")
    filters: Optional[Dict[str, Any]] = Field(default={}, description="Query filters")
    max_results: Optional[int] = Field(default=5, description="Maximum results to return")
    include_sources: Optional[bool] = Field(default=True, description="Include source documents")


class DocumentChunk(BaseModel):
    chunk_index: int
    text: str
    page_number: Optional[int] = None
    confidence_score: float
    metadata: Dict[str, Any] = Field(default_factory=dict)


class RAGResponse(BaseModel):
    answer: str
    confidence: float
    sources: List[DocumentChunk] = Field(default_factory=list)
    retrieved_docs: List[str] = Field(default_factory=list)
    response_time_ms: int
    query_id: str


class DocumentUpload(BaseModel):
    file_name: str
    file_url: str
    file_size: int
    doc_type: DocumentType
    company_id: str
    store_id: Optional[str] = None
    project_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DocumentResponse(BaseModel):
    document_id: str
    status: ProcessingStatus
    message: str
    chunks_created: Optional[int] = None
    estimated_completion: Optional[datetime] = None


class EmbeddingRequest(BaseModel):
    text: str
    document_id: Optional[str] = None
    chunk_index: Optional[int] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class EmbeddingResponse(BaseModel):
    embedding_id: str
    vector_dimension: int
    created_at: datetime


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class UserContext(BaseModel):
    user_id: str
    company_id: str
    store_id: Optional[str] = None
    role: str
    permissions: List[str] = Field(default_factory=list)
    is_admin: bool = False


class QueryFilter(BaseModel):
    doc_types: Optional[List[DocumentType]] = None
    store_ids: Optional[List[str]] = None
    project_ids: Optional[List[str]] = None
    date_range: Optional[Dict[str, str]] = None  # {"start": "2024-01-01", "end": "2024-12-31"}


class MaskPolicy(BaseModel):
    mask_cost_data: bool = False
    mask_profit_data: bool = False
    mask_contractor_rates: bool = False
    allowed_doc_types: List[DocumentType] = Field(default_factory=list)