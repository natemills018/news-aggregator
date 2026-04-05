import type { Event, Venue, Category, DigestSummary, DigestDetail } from "../types";

const API_BASE = "http://localhost:8000";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getEvents(params?: {
  search?: string;
  category_id?: number;
  venue_id?: number;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}): Promise<Event[]> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value));
    });
  }
  const query = searchParams.toString();
  return fetchJson<Event[]>(`${API_BASE}/events${query ? `?${query}` : ""}`);
}

export async function getEvent(id: number): Promise<Event> {
  return fetchJson<Event>(`${API_BASE}/events/${id}`);
}

export async function getVenues(venue_type?: string): Promise<Venue[]> {
  const query = venue_type ? `?venue_type=${venue_type}` : "";
  return fetchJson<Venue[]>(`${API_BASE}/venues${query}`);
}

export async function getCategories(): Promise<Category[]> {
  return fetchJson<Category[]>(`${API_BASE}/categories`);
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

// Admin endpoints

function adminHeaders(apiKey: string) {
  return { "X-Admin-Key": apiKey };
}

export async function getSubscribers(apiKey: string) {
  const res = await fetch(`${API_BASE}/subscribers/`, {
    headers: adminHeaders(apiKey),
  });
  if (res.status === 403) throw new Error("invalid_key");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getDigestPreview(apiKey: string): Promise<string> {
  const res = await fetch(`${API_BASE}/newsletter/preview`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.text();
}

export async function sendDigest(apiKey: string): Promise<{
  sent: number;
  total_subscribers: number;
  events_included: number;
  errors: { email: string; error: string }[];
}> {
  const res = await fetch(`${API_BASE}/newsletter/send`, {
    method: "POST",
    headers: adminHeaders(apiKey),
  });
  if (res.status === 403) throw new Error("invalid_key");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
