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

// Event curation endpoints

export async function fetchExternalEvents(apiKey: string): Promise<{
  ticketmaster: { fetched: number; duplicates: number; error?: string };
  eventbrite: { fetched: number; duplicates: number; error?: string };
}> {
  const res = await fetch(`${API_BASE}/admin/fetch-events`, {
    method: "POST",
    headers: adminHeaders(apiKey),
  });
  if (res.status === 403) throw new Error("invalid_key");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getDraftEvents(apiKey: string): Promise<Event[]> {
  const res = await fetch(`${API_BASE}/admin/drafts`, {
    headers: adminHeaders(apiKey),
  });
  if (res.status === 403) throw new Error("invalid_key");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getAdminEvents(apiKey: string, status?: string): Promise<Event[]> {
  const query = status ? `?status=${status}` : "";
  const res = await fetch(`${API_BASE}/admin/events${query}`, {
    headers: adminHeaders(apiKey),
  });
  if (res.status === 403) throw new Error("invalid_key");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function updateEvent(apiKey: string, eventId: number, data: Partial<Event>): Promise<Event> {
  const res = await fetch(`${API_BASE}/admin/events/${eventId}`, {
    method: "PATCH",
    headers: { ...adminHeaders(apiKey), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (res.status === 403) throw new Error("invalid_key");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function createAdminEvent(apiKey: string, data: {
  title: string;
  description?: string;
  short_description?: string;
  image_url?: string;
  source_url?: string;
  start_date: string;
  end_date?: string;
  is_featured?: boolean;
  status?: string;
  category_id?: number;
}): Promise<Event> {
  const res = await fetch(`${API_BASE}/admin/events`, {
    method: "POST",
    headers: { ...adminHeaders(apiKey), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (res.status === 403) throw new Error("invalid_key");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function deleteEvent(apiKey: string, eventId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/events/${eventId}`, {
    method: "DELETE",
    headers: adminHeaders(apiKey),
  });
  if (res.status === 403) throw new Error("invalid_key");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

export async function getAdminCategories(apiKey: string): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/admin/categories`, {
    headers: adminHeaders(apiKey),
  });
  if (res.status === 403) throw new Error("invalid_key");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
