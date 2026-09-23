import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()

def get_gemini_client() -> genai.Client:
    """Initializes and returns the Google GenAI SDK client."""
    if not GEMINI_API_KEY:
        raise ValueError(
            "GEMINI_API_KEY is not set. Please add a valid Gemini API key to your .env file."
        )
    return genai.Client(api_key=GEMINI_API_KEY)