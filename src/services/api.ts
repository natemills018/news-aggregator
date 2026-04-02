import type { Event, Venue, Category } from "../types";

const API_BASE = "http://localhost:8000";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getEvents(params?: {
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

export async function subscribe(email: string, name?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/subscribers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  });
  if (res.status === 409) throw new Error("already_subscribed");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}
