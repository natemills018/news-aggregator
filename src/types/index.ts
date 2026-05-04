export interface DigestSummary {
  id: number;
  subject: string;
  intro_text: string;
  item_count: number;
  sent_at: string;
}

export interface DigestDetail extends DigestSummary {
  html_content: string;
}

export interface Subscriber {
  id: number;
  email: string;
  name: string | null;
  is_active: boolean;
  verified: boolean;
  subscribed_at: string;
}

export interface Recipe {
  id: number;
  external_id: string;
  source: string;
  title: string;
  short_description: string | null;
  summary: string | null;
  ingredients: string[] | null;
  image_url: string | null;
  source_url: string;
  source_attribution: string | null;
  cuisine: string | null;
  region: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  difficulty: string | null;
  rating: number | null;
  status: string;
  is_featured: boolean;
  created_at: string;
}

export interface RecipeRegion {
  name: string;
  cuisines: string[];
}

export interface FetchResult {
  region: string;
  fetched: number;
  duplicates: number;
}
