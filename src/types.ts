export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  active: boolean;
  download_link?: string;
  created_at?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export type OrderStatus = 'new' | 'paid' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  no: string;
  customer_name: string;
  contact: string;
  note?: string;
  items: OrderItem[];
  total: number;
  pay_method: string;
  slip?: string;
  status: OrderStatus;
  created_at: string;
}

export interface PaymentAccounts {
  KPay: { name: string; number: string };
  WavePay: { name: string; number: string };
  KBZ_Bank?: { name: string; number: string };
  AYAPay?: { name: string; number: string };
}

export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  paymentAccounts: PaymentAccounts;
}
