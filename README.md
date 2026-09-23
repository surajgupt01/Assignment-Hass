# Robotic Surgery Market – Expert Call Intelligence Platform

A full-stack qualitative diligence application designed to ingest, index, and analyze expert interview transcripts across European healthcare markets (France, Germany, and the United Kingdom). The platform maps qualitative insights to a standardized 6-question interview guide, extracts verbatim citations with source timestamps, generates cross-expert consensus and divergence synthesis, and supports grounded cross-transcript Q&A.

---

## Key Features

1. **Structured Interview Guide Matrix (Q1–Q6):** Normalizes answers across all transcripts into a single comparative grid covering current adoption, barriers, hospital budgets/ROI, surgeon training, 3–5 year trends, and procurement timelines.
2. **Deterministic Verbatim Citations & Timestamps:** Every insight links directly back to raw dialogue chunks with exact timestamp markers (`[MM:SS]`), speaker names, and verifiable quotes. An automated substring check discards ungrounded or paraphrased citations.
3. **Cross-Expert Synthesis (Consensus & Divergence):** Automatically compares transcripts across markets to surface unanimous industry themes (e.g., tier-1 academic hospital concentration, multi-surgeon training prerequisites) alongside regional divergences (e.g., strict ROI scrutiny in Germany vs. balanced capacity/recruitment models in the UK NHS).
4. **Cross-Transcript Grounded Q&A Assistant:** A Retrieval-Augmented Generation (RAG) assistant that allows users to ask open-ended natural-language queries across all transcripts or filtered by country, returning concise answers backed by source citations.

---

## Tech Stack & Architecture

- **Backend:** FastAPI (Python 3.11+), Uvicorn, Pydantic v2
- **Vector Store:** ChromaDB (local persistence for semantic turn-level dialogue retrieval)
- **LLM Engine:** Google Gemini Flash (`gemini-3.5-flash-lite` via official `google-genai` SDK) utilizing native structured JSON output
- **Frontend:** Next.js (App Router, TypeScript), Tailwind CSS, Lucide React
- **DevOps:** Docker, Docker Compose

```text
.
├── backend/
│   ├── app/
│   │   ├── analyzer.py       # LLM prompts, structured Gemini calls & citation validation
│   │   ├── config.py         # Application configuration & environment loader
│   │   ├── llm.py            # Google GenAI client initialization
│   │   ├── main.py           # FastAPI entrypoint, lifespan loader & REST routes
│   │   ├── parser.py         # Timestamped turn-based dialogue parser
│   │   ├── qa.py             # Vector similarity search & grounded RAG Q&A
│   │   ├── schemas.py        # Pydantic validation schemas
│   │   └── vector_store.py   # ChromaDB client & indexing operations
│   ├── data/                 # Raw transcripts (france.txt, germany.txt, uk.txt)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/                  # Next.js App Router components & pages
│   ├── lib/                  # Fetch client & API helpers
│   ├── types/                # TypeScript interface definitions
│   ├── Dockerfile
│   ├── package.json
│   └── tailwind.config.ts
├── docker-compose.yml
├── .gitignore
└── README.md
