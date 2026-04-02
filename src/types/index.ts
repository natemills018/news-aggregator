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
  image_url: string | null;
  source_url: string | null;
  start_date: string;
  end_date: string | null;
  created_at: string;
  category: Category | null;
  venue: Venue | null;
}
