import os
import time
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from .parser import parse_transcript_text
from .vector_store import ingest_chunks
from .analyzer import analyze_single_expert, generate_synthesis
from .qa import answer_query
from .schemas import ExpertReport, CrossExpertSynthesis, QARequest, QAResponse

STATE = {
    "reports": {},
    "synthesis": None
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    market_map = {
        "france.txt": "France",
        "germany.txt": "Germany",
        "uk.txt": "United Kingdom"
    }
    
    print("[INFO] Checking data folder for transcripts...")
    for filename, market in market_map.items():
        file_path = os.path.join(data_dir, filename)
        if os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                parsed = parse_transcript_text(content, default_market=market)
                ingest_chunks(parsed["chunks"])
                
                print(f"[INFO] Analyzing transcript for {market}...")
                report = analyze_single_expert(parsed)
                STATE["reports"][report.market] = report
                time.sleep(1)
            except Exception as e:
                print(f"[WARNING] Could not process {market} on startup: {e}")

    if len(STATE["reports"]) >= 2:
        try:
            print("[INFO] Generating cross-market synthesis...")
            STATE["synthesis"] = generate_synthesis(list(STATE["reports"].values()))
        except Exception as e:
            print(f"[WARNING] Could not generate synthesis on startup: {e}")

    print("[SUCCESS] Backend startup complete. Ready on http://localhost:8000")
    yield

app = FastAPI(title="Hasamex Expert Call Transcript Analyzer", lifespan=lifespan)


origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://assignment-hass-fqb3.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://assignment-hass-.*\.vercel\.app",  # Matches preview & branch deployments on Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/upload")
async def upload_transcript(file: UploadFile = File(...), market: str = "Unknown"):
    content = await file.read()
    text = content.decode("utf-8")
    parsed = parse_transcript_text(text, default_market=market)
    
    ingest_chunks(parsed["chunks"])
    report = analyze_single_expert(parsed)
    STATE["reports"][report.market] = report
    
    if len(STATE["reports"]) >= 2:
        STATE["synthesis"] = generate_synthesis(list(STATE["reports"].values()))
        
    return {"status": "success", "market": report.market, "expert": report.expert_name}

@app.get("/api/reports", response_model=List[ExpertReport])
def get_reports():
    return list(STATE["reports"].values())

@app.get("/api/synthesis", response_model=Optional[CrossExpertSynthesis])
def get_synthesis():
    global STATE
    # If synthesis is already computed, return it directly
    if STATE.get("synthesis"):
        return STATE["synthesis"]

    reports_list = list(STATE.get("reports", {}).values())
    
    # If fewer than 2 reports are loaded, return null safely without throwing 500
    if len(reports_list) < 2:
        return None

    try:
        synthesis = generate_synthesis(reports_list)
        STATE["synthesis"] = synthesis
        return synthesis
    except Exception as e:
        print(f"[ERROR] Failed to dynamically generate synthesis: {e}")
        return None

@app.post("/api/qa", response_model=QAResponse)
def ask_question(request: QARequest):
    return answer_query(query=request.query, market_filter=request.market_filter)