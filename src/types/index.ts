export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Venue {
  id: number;
  name: string;
  address: string;
  venue_type: string;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
}

export interface Event {
  id: number;
  title: string;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  source_url: string | null;
  start_date: string;
  end_date: string | null;
  is_featured: boolean;
  is_sleeper_pick: boolean;
  status: string;
  source: string | null;
  created_at: string;
  category: Category | null;
  venue: Venue | null;
}

export interface DigestSummary {
  id: number;
  subject: string;
  intro_text: string;
  event_count: number;
  sent_at: string;
}

export interface DigestDetail extends DigestSummary {
  html_content: string;
}
