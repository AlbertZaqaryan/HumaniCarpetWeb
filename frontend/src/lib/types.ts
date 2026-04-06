export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  description: string;
  rug_count: number;
}

export interface Rug {
  id: string;
  title: string;
  slug: string;
  price: string;
  image: string;
  category: number | null;
  category_name: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface RugDetail extends Rug {
  description: string;
  images: RugImage[];
  updated_at: string;
}

export interface RugImage {
  id: number;
  image: string;
  order: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface OrderItem {
  id: number;
  rug: string | null;
  title: string;
  price: string;
  quantity: number;
  subtotal: string;
}

export interface Order {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: "pending" | "confirmed" | "cancelled";
  notes: string;
  total: string;
  items: OrderItem[];
  created_at: string;
}

export interface SiteSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_image: string | null;
  hero_cta_text: string;
  about_short: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface CartItem {
  rug: Rug;
  quantity: number;
}
