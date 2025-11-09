// Temporary types until Supabase types are regenerated
export interface AdminSettings {
  id: number;
  store_name: string;
  phone_number: string | null;
  whatsapp_number: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  telegram_token: string | null;
  telegram_chat_id: string | null;
  shipping_fee: number;
  default_currency: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name_ar: string;
  description_ar: string | null;
  price: number;
  currency: string;
  category: string;
  stock_quantity: number;
  images: string[];
  sizes: string[];
  colors: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  items: any;
  subtotal: number;
  shipping_fee: number;
  total: number;
  currency: string;
  shipping_address: any;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}
