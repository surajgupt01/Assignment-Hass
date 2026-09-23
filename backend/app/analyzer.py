import json
import re
from typing import List
from google.genai import types

from .llm import get_gemini_client, GEMINI_MODEL
from .schemas import ExpertReport, CrossExpertSynthesis

client = get_gemini_client()

GUIDE_QUESTIONS = [
    {"id": 1, "q": "How would you describe current adoption of robotic surgery in your market?"},
    {"id": 2, "q": "What are the main barriers to adoption?"},
    {"id": 3, "q": "How important are hospital budgets and ROI in purchasing decisions?"},
    {"id": 4, "q": "How important are surgeon training and clinical outcomes?"},
    {"id": 5, "q": "What adoption trend do you expect over the next 3–5 years?"},
    {"id": 6, "q": "What is the typical hospital decision-making timeline for purchasing a new robotic system?"}
]

def clean_json_response(raw_text: str) -> dict:
    text = raw_text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()
    return json.loads(text)

def analyze_single_expert(transcript_data: dict) -> ExpertReport:
    header = transcript_data["header"]
    chunks = transcript_data["chunks"]

    transcript_text = "\n".join([
        f"[{c['timestamp']}] {c['speaker']}: {c['text']}" for c in chunks
    ])

    prompt = f"""
You are an expert healthcare market analyst. Analyze the following interview transcript and answer the 6 guide questions.
Output must conform to this schema:
{{
  "expert_id": "{header['market'].lower()}",
  "expert_name": "{header['expert_name']}",
  "role": "{header['role']}",
  "market": "{header['market']}",
  "answers": [
    {{
      "question_id": 1,
      "question": "question text",
      "answer": "factual answer based strictly on transcript",
      "citations": [
        {{
          "quote": "exact verbatim quote from transcript",
          "timestamp": "MM:SS",
          "speaker": "Speaker Name",
          "market": "{header['market']}"
        }}
      ]
    }}
  ]
}}

CRITICAL GROUNDING RULES:
1. Every quote MUST be an exact verbatim substring from the transcript.
2. The timestamp MUST match the marker immediately preceding the statement.
3. If no information is found for a question, output "Not discussed" for answer and empty citations.

Transcript:
{transcript_text}

Questions:
{json.dumps(GUIDE_QUESTIONS, indent=2)}
"""

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.0
        )
    )

    data = clean_json_response(response.text)

    # Hallucination Guard: Ensure quoted text exists verbatim
    full_raw = " ".join([c["text"] for c in chunks])
    for ans in data.get("answers", []):
        valid = []
        for c in ans.get("citations", []):
            q = c.get("quote", "").strip().strip('"').strip("'")
            if q and (q in full_raw or q in transcript_text):
                valid.append(c)
        ans["citations"] = valid

    return ExpertReport(**data)
def generate_synthesis(reports: List[ExpertReport]) -> CrossExpertSynthesis:
    reports_dump = [r.model_dump() for r in reports]
    prompt = f"""
Compare the expert reports across France, Germany, and the UK.
Synthesize:
1. Common Themes (points where 2 or more experts align).
2. Disagreements (variations in economics, adoption pace, timeline, or ROI criteria).

Output schema:
{{
  "common_themes": [
    {{
      "topic": "topic name",
      "finding": "summary of common ground",
      "type": "agreement",
      "supporting_citations": [
        {{"quote": "...", "timestamp": "...", "speaker": "...", "market": "..."}}
      ]
    }}
  ],
  "disagreements": [
    {{
      "topic": "topic name",
      "finding": "divergence description",
      "type": "disagreement",
      "supporting_citations": [
        {{"quote": "...", "timestamp": "...", "speaker": "...", "market": "..."}}
      ]
    }}
  ]
}}

Data:
{json.dumps(reports_dump, indent=2)}
"""

    raw_response = call_gemini_with_fallback(prompt)
    data = clean_json(raw_response)

    # Alias normalization safeguard
    if "agreements" in data and "common_themes" not in data:
        data["common_themes"] = data.pop("agreements")

    for section in ["common_themes", "disagreements"]:
        for item in data.get(section, []):
            if "citations" in item and "supporting_citations" not in item:
                item["supporting_citations"] = item.pop("citations")

    return CrossExpertSynthesis(**data)