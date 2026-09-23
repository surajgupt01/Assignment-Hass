import chromadb
from app.config import CHROMA_PERSIST_DIR
from typing import List, Dict

client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)


collection = client.get_or_create_collection(name="expert_transcripts")

def ingest_chunks(chunks: List[Dict]):
    ids = []
    documents = []
    metadatas = []
    
    for i, c in enumerate(chunks):
        doc_id = f"{c['market']}_{c['timestamp']}_{i}"
        content = f"[{c['timestamp']}] {c['speaker']}: {c['text']}"
        ids.append(doc_id)
        documents.append(content)
        metadatas.append({
            "timestamp": c["timestamp"],
            "speaker": c["speaker"],
            "market": c["market"],
            "expert_name": c["expert_name"],
            "raw_text": c["text"]
        })
        
    collection.upsert(ids=ids, documents=documents, metadatas=metadatas)

def query_transcripts(query: str, market: str = None, n_results: int = 5):
    where_clause = {"market": market} if market else None
    return collection.query(
        query_texts=[query],
        n_results=n_results,
        where=where_clause
    )