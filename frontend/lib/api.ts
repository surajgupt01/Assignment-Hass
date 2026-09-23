import { ExpertReport, CrossExpertSynthesis, QAResponse } from "@/types/index";

// Support both common naming conventions and strip any trailing slash
const RAW_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_URL ||
  "http://localhost:8000";

const API_BASE = RAW_URL.replace(/\/+$/, "");

export async function uploadTranscriptFile(
  file: File,
  market: string,
): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `${API_BASE}/api/upload?market=${encodeURIComponent(market)}`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(
      `Failed to upload transcript (${res.status}): ${errorBody}`,
    );
  }
  return res.json();
}

export async function fetchReports(): Promise<ExpertReport[]> {
  try {
    const res = await fetch(`${API_BASE}/api/reports`, {
      cache: "no-store", // Ensures live data on every refresh
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn("Backend not reachable for /api/reports", err);
    return [];
  }
}

export async function fetchSynthesis(): Promise<CrossExpertSynthesis | null> {
  try {
    const res = await fetch(`${API_BASE}/api/synthesis`, {
      cache: "no-store", // Ensures live data on every refresh
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("Backend not reachable for /api/synthesis", err);
    return null;
  }
}

export async function askQuestion(
  query: string,
  marketFilter?: string,
): Promise<QAResponse> {
  const res = await fetch(`${API_BASE}/api/qa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, market_filter: marketFilter || null }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(
      `Failed to query transcripts (${res.status}): ${errorBody}`,
    );
  }
  return res.json();
}
