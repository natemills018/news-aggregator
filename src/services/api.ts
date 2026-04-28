import type { DigestSummary, DigestDetail, Subscriber } from "../types";

const API_BASE = "http://localhost:8000";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getDigests(): Promise<DigestSummary[]> {
  return fetchJson<DigestSummary[]>(`${API_BASE}/digests/`);
}

export async function getDigest(id: number): Promise<DigestDetail> {
  return fetchJson<DigestDetail>(`${API_BASE}/digests/${id}`);
}

export async function subscribe(email: string, name?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/subscribers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  });
  if (res.status === 409) throw new Error("already_subscribed");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

function adminHeaders(apiKey: string) {
  return { "X-Admin-Key": apiKey };
}

export async function getSubscribers(apiKey: string): Promise<Subscriber[]> {
  const res = await fetch(`${API_BASE}/subscribers/`, {
    headers: adminHeaders(apiKey),
  });
  if (res.status === 403) throw new Error("invalid_key");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
