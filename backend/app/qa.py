import json
import re
from google.genai import types

from .llm import get_gemini_client, GEMINI_MODEL
from .vector_store import query_transcripts
from .schemas import QAResponse

client = get_gemini_client()

def answer_query(query: str, market_filter: str = None) -> QAResponse:
    results = query_transcripts(query=query, market=market_filter, n_results=6)

    retrieved_contexts = []
    if results and "documents" in results and results["documents"]:
        for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
            retrieved_contexts.append({
                "context": doc,
                "timestamp": meta["timestamp"],
                "speaker": meta["speaker"],
                "market": meta["market"],
                "raw_text": meta["raw_text"]
            })

    prompt = f"""
You are an expert market analyst assistant. Answer the user query using ONLY the retrieved transcript snippets.
If the information is not in the context, say "The provided transcripts do not contain this information."

Return ONLY valid JSON matching:
{{
  "answer": "<grounded response>",
  "citations": [
    {{
      "quote": "<exact quote substring from snippet>",
      "timestamp": "<timestamp>",
      "speaker": "<speaker>",
      "market": "<market>"
    }}
  ]
}}

User Query: {query}
Snippets: {json.dumps(retrieved_contexts, indent=2)}
"""

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.0
        )
    )

    text = response.text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()

    return QAResponse(**json.loads(text))