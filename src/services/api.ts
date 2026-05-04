import type {
  DigestSummary,
  DigestDetail,
  Subscriber,
  Recipe,
  RecipeRegion,
  FetchResult,
} from "../types";

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

async function adminJson<T>(url: string, apiKey: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...adminHeaders(apiKey),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getRegions(apiKey: string): Promise<RecipeRegion[]> {
  return adminJson<RecipeRegion[]>(`${API_BASE}/admin/regions`, apiKey);
}

export async function fetchRecipes(
  apiKey: string,
  region: string,
  count = 10,
): Promise<FetchResult> {
  return adminJson<FetchResult>(
    `${API_BASE}/admin/fetch-recipes?region=${encodeURIComponent(region)}&count=${count}`,
    apiKey,
    { method: "POST" },
  );
}

export async function getRecipeDrafts(apiKey: string): Promise<Recipe[]> {
  return adminJson<Recipe[]>(`${API_BASE}/admin/drafts`, apiKey);
}

export async function getRecipes(apiKey: string, status?: string): Promise<Recipe[]> {
  const url = status
    ? `${API_BASE}/admin/recipes?status=${encodeURIComponent(status)}`
    : `${API_BASE}/admin/recipes`;
  return adminJson<Recipe[]>(url, apiKey);
}

export async function updateRecipe(
  apiKey: string,
  id: number,
  patch: Partial<Pick<Recipe, "status" | "is_featured" | "title" | "short_description" | "region" | "cuisine">>,
): Promise<Recipe> {
  return adminJson<Recipe>(`${API_BASE}/admin/recipes/${id}`, apiKey, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteRecipe(apiKey: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/recipes/${id}`, {
    method: "DELETE",
    headers: adminHeaders(apiKey),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}
