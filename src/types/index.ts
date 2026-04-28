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
