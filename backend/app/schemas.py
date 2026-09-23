from typing import List, Optional
from pydantic import BaseModel, Field

class QuoteCitation(BaseModel):
    quote: str = Field(description="Exact substring quote from the transcript")
    timestamp: str = Field(description="Timestamp in format MM:SS or HH:MM:SS")
    speaker: str = Field(description="Speaker who made the statement")

class QuestionAnalysis(BaseModel):
    question_id: int
    question: str
    answer: str = Field(description="Direct, grounded answer based strictly on the transcript")
    citations: List[QuoteCitation] = Field(description="List of exact quotes with timestamps")

class ExpertReport(BaseModel):
    expert_name: str
    role: str
    market: str
    answers: List[QuestionAnalysis]

class SynthesisItem(BaseModel):
    topic: str
    consensus: Optional[str] = Field(None, description="Agreed points across experts")
    divergence: Optional[str] = Field(None, description="Disagreements or market-specific differences")
    supporting_citations: List[QuoteCitation]

class CrossExpertSynthesis(BaseModel):
    common_themes: List[SynthesisItem]
    disagreements: List[SynthesisItem]

class QARequest(BaseModel):
    query: str
    market_filter: Optional[str] = None

class QAResponse(BaseModel):
    answer: str
    citations: List[QuoteCitation]