import re
from typing import List, Dict

def parse_transcript_text(raw_text: str, default_market: str = "Unknown") -> Dict:
    """
    Parses transcripts into header metadata and timestamped dialogue turns.
    """
    lines = [line.strip() for line in raw_text.strip().split("\n") if line.strip()]
    
    header = {"expert_name": "Unknown", "role": "Unknown", "market": default_market}
    dialogue_lines = []
    
   
    for line in lines:
        if line.startswith("Expert"):
            parts = line.split("–") if "–" in line else line.split("-")
            if len(parts) > 1:
                header["expert_name"] = parts[1].strip()
        elif line.lower().startswith("role:"):
            header["role"] = line.split(":", 1)[1].strip()
        elif line.lower().startswith("market:"):
            header["market"] = line.split(":", 1)[1].strip()
        else:
            dialogue_lines.append(line)
            
   
    timestamp_pattern = re.compile(r"^(\d{2}:\d{2}(?::\d{2})?)$")
    chunks = []
    current_timestamp = "00:00"
    buffer = []
    
    for line in dialogue_lines:
        match = timestamp_pattern.match(line)
        if match:
            if buffer:
                combined_turn = " ".join(buffer)
                speaker, _, text = combined_turn.partition(":")
                chunks.append({
                    "timestamp": current_timestamp,
                    "speaker": speaker.strip() if text else "Unknown",
                    "text": text.strip() if text else combined_turn.strip(),
                    "market": header["market"],
                    "expert_name": header["expert_name"]
                })
                buffer = []
            current_timestamp = match.group(1)
        else:
            buffer.append(line)
            
    if buffer:
        combined_turn = " ".join(buffer)
        speaker, _, text = combined_turn.partition(":")
        chunks.append({
            "timestamp": current_timestamp,
            "speaker": speaker.strip() if text else "Unknown",
            "text": text.strip() if text else combined_turn.strip(),
            "market": header["market"],
            "expert_name": header["expert_name"]
        })
        
    return {"header": header, "chunks": chunks}