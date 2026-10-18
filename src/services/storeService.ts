import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, OrderStatus, AppConfig } from '../types';
import { INITIAL_PRODUCTS, DEFAULT_PAYMENT_ACCOUNTS } from '../data/initialData';

const CONFIG_KEY = 'linhtet_config';
const PRODUCTS_KEY = 'linhtet_products';
const FILES_KEY = 'linhtet_product_files';
const ORDERS_KEY = 'linhtet_orders';

export class StoreService {
  private supabase: SupabaseClient | null = null;
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
    this.initSupabase();
    this.initLocalData();
  }

  public getConfig(): AppConfig {
    return { ...this.config };
  }

  public saveConfig(newConfig: Partial<AppConfig>) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
    this.initSupabase();
  }

  private loadConfig(): AppConfig {
    const defaultUrl = 'https://zowcleefrzjwhxwnqhvj.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvd2NsZWVmcnpqd2h4d25xaHZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjI5NDM5NiwiZXhwIjoyMTA3ODcwMzk2fQ.aHx5fKQTFaZ1CQhd78uH2gYIl2HP9uEA8oDUK5qJwMo';
    const defaultBot = '8963114762:AAF_8y-LM5Ww1JZYGMdMiOyuQsufXYyDeHw';

    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return {
          supabaseUrl: parsed.supabaseUrl || localStorage.getItem('LH_SUPABASE_URL') || defaultUrl,
          supabaseAnonKey: parsed.supabaseAnonKey || localStorage.getItem('LH_SUPABASE_KEY') || defaultKey,
          supabaseServiceKey: parsed.supabaseServiceKey || defaultKey,
          telegramBotToken: parsed.telegramBotToken || defaultBot,
          telegramChatId: parsed.telegramChatId || '',
          paymentAccounts: parsed.paymentAccounts || DEFAULT_PAYMENT_ACCOUNTS
        };
      } catch (e) {
        console.error('Failed to parse config:', e);
      }
    }
    return {
      supabaseUrl: localStorage.getItem('LH_SUPABASE_URL') || defaultUrl,
      supabaseAnonKey: localStorage.getItem('LH_SUPABASE_KEY') || defaultKey,
      supabaseServiceKey: defaultKey,
      telegramBotToken: defaultBot,
      telegramChatId: '',
      paymentAccounts: DEFAULT_PAYMENT_ACCOUNTS
    };
  }

  private initSupabase() {
    const { supabaseUrl, supabaseAnonKey } = this.config;
    if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('YOUR_SUPABASE_URL')) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // Listen to realtime updates on orders table
        this.supabase
          .channel('storefront_orders_realtime')
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
            const updated = payload.new as Order;
            const old = payload.old as any;
            window.dispatchEvent(
              new CustomEvent('linhtet_order_status_updated', {
                detail: { order: updated, previousStatus: old?.status }
              })
            );
          })
          .subscribe();
      } catch (e) {
        console.warn('Could not initialize Supabase client:', e);
        this.supabase = null;
      }
    } else {
      this.supabase = null;
    }
  }

  public isSupabaseConnected(): boolean {
    return this.supabase !== null;
  }

  private initLocalData() {
    if (!localStorage.getItem(PRODUCTS_KEY)) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
      const initialFiles: Record<string, string> = {};
      INITIAL_PRODUCTS.forEach(p => {
        if (p.download_link) {
          initialFiles[p.id] = p.download_link;
        }
      });
      localStorage.setItem(FILES_KEY, JSON.stringify(initialFiles));
    }

    if (!localStorage.getItem(ORDERS_KEY)) {
      // Sample seed orders to test the dashboard immediately
      const sampleOrders: Order[] = [
        {
          id: 'ord-1',
          no: 'LH88921045',
          customer_name: 'မောင်မင်းခန့်',
          contact: '09798112233',
          note: 'အကောင့် credentials ကို Viber မှလည်း ပို့ပေးပါ',
          items: [
            { id: INITIAL_PRODUCTS[0].id, name: INITIAL_PRODUCTS[0].name, price: INITIAL_PRODUCTS[0].price, qty: 1 }
          ],
          total: 18000,
          pay_method: 'KPay',
          slip: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
          status: 'paid',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: 'ord-2',
          no: 'LH88923012',
          customer_name: 'ဒေါ်သီတာဝင်း',
          contact: '09450098765',
          note: 'Canva Pro မိမိ Gmail ထဲသို့ invite ပို့ပေးပါ',
          items: [
            { id: INITIAL_PRODUCTS[1].id, name: INITIAL_PRODUCTS[1].name, price: INITIAL_PRODUCTS[1].price, qty: 1 },
            { id: INITIAL_PRODUCTS[2].id, name: INITIAL_PRODUCTS[2].name, price: INITIAL_PRODUCTS[2].price, qty: 1 }
          ],
          total: 27000,
          pay_method: 'WavePay',
          slip: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
          status: 'new',
          created_at: new Date(Date.now() - 1800000).toISOString()
        }
      ];
      localStorage.setItem(ORDERS_KEY, JSON.stringify(sampleOrders));
    }
  }

  // === PRODUCTS ===
  public async getProducts(): Promise<Product[]> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((p: any, idx: number) => ({
            ...p,
            stock: p.stock !== undefined ? p.stock : (INITIAL_PRODUCTS[idx % INITIAL_PRODUCTS.length]?.stock ?? 3)
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local:', err);
      }
    }
    const raw = localStorage.getItem(PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
  }

  public async getProductFile(productId: string): Promise<string | null> {
    if (this.supabase) {
      try {
        const { data } = await this.supabase
          .from('product_files')
          .select('url')
          .eq('product_id', productId)
          .maybeSingle();
        if (data?.url) return data.url;
      } catch (e) {
        console.warn('Supabase product_file fetch failed:', e);
      }
    }
    const rawFiles = localStorage.getItem(FILES_KEY);
    const files = rawFiles ? JSON.parse(rawFiles) : {};
    return files[productId] || null;
  }

  public async createProduct(product: Omit<Product, 'id' | 'created_at'>, downloadLink?: string): Promise<Product> {
    const id = crypto.randomUUID ? crypto.randomUUID() : 'prod-' + Date.now();
    const newProduct: Product = {
      ...product,
      id,
      created_at: new Date().toISOString()
    };

    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('products')
          .insert({
            name: product.name,
            price: product.price,
            category: product.category,
            image: product.image,
            description: product.description,
            active: product.active ?? true
          })
          .select()
          .single();
        if (error) throw error;
        if (downloadLink) {
          await this.supabase.from('product_files').upsert({
            product_id: data.id,
            url: downloadLink
          });
        }
        return data;
      } catch (e) {
        console.warn('Supabase insert failed, saving locally:', e);
      }
    }

    // Local save
    const current = await this.getProducts();
    const updated = [newProduct, ...current];
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));

    if (downloadLink) {
      const rawFiles = localStorage.getItem(FILES_KEY);
      const files = rawFiles ? JSON.parse(rawFiles) : {};
      files[newProduct.id] = downloadLink;
      localStorage.setItem(FILES_KEY, JSON.stringify(files));
    }
    return newProduct;
  }

  public async updateProduct(id: string, updates: Partial<Product>, downloadLink?: string): Promise<void> {
    if (this.supabase) {
      try {
        await this.supabase.from('products').update(updates).eq('id', id);
        if (downloadLink !== undefined) {
          await this.supabase.from('product_files').upsert({
            product_id: id,
            url: downloadLink
          });
        }
        return;
      } catch (e) {
        console.warn('Supabase update failed:', e);
      }
    }

    const current = await this.getProducts();
    const updated = current.map(p => (p.id === id ? { ...p, ...updates } : p));
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));

    if (downloadLink !== undefined) {
      const rawFiles = localStorage.getItem(FILES_KEY);
      const files = rawFiles ? JSON.parse(rawFiles) : {};
      files[id] = downloadLink;
      localStorage.setItem(FILES_KEY, JSON.stringify(files));
    }
  }

  public async deleteProduct(id: string): Promise<void> {
    if (this.supabase) {
      try {
        await this.supabase.from('products').delete().eq('id', id);
        return;
      } catch (e) {
        console.warn('Supabase delete failed:', e);
      }
    }

    const current = await this.getProducts();
    const updated = current.filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));

    const rawFiles = localStorage.getItem(FILES_KEY);
    if (rawFiles) {
      const files = JSON.parse(rawFiles);
      delete files[id];
      localStorage.setItem(FILES_KEY, JSON.stringify(files));
    }
  }

  // === ORDERS ===
  public async getOrders(): Promise<Order[]> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getOrders failed:', e);
      }
    }
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  public async updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    const orders = await this.getOrders();
    const existingOrder = orders.find(o => o.id === id);
    const previousStatus = existingOrder?.status;

    if (this.supabase) {
      try {
        await this.supabase.from('orders').update({ status }).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateOrderStatus failed:', e);
      }
    }

    const updated = orders.map(o => (o.id === id ? { ...o, status } : o));
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));

    if (existingOrder) {
      const updatedOrder = { ...existingOrder, status };
      window.dispatchEvent(
        new CustomEvent('linhtet_order_status_updated', {
          detail: { order: updatedOrder, previousStatus }
        })
      );
    }
  }

  public async deleteOrder(id: string): Promise<void> {
    if (this.supabase) {
      try {
        await this.supabase.from('orders').delete().eq('id', id);
        return;
      } catch (e) {
        console.warn('Supabase deleteOrder failed:', e);
      }
    }
    const orders = await this.getOrders();
    const updated = orders.filter(o => o.id !== id);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  }

  // === SUBMIT ORDER ===
  public async submitOrder(params: {
    customerName: string;
    contact: string;
    note: string;
    payMethod: string;
    slipDataUrl: string;
    items: { id: string; name: string; price: number; qty: number }[];
  }): Promise<{ ok: boolean; no: string; error?: string }> {
    const no = 'LH' + Date.now().toString().slice(-8);
    const total = params.items.reduce((sum, item) => sum + item.price * item.qty, 0);

    let slipUrl = params.slipDataUrl;

    // If Supabase Storage is available, attempt to upload slip
    if (this.supabase && params.slipDataUrl.startsWith('data:image')) {
      try {
        const base64Data = params.slipDataUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        const filePath = `${Date.now()}-${no}.jpg`;

        const { error: uploadError } = await this.supabase.storage
          .from('slips')
          .upload(filePath, blob, { contentType: 'image/jpeg' });

        if (!uploadError) {
          const { data } = this.supabase.storage.from('slips').getPublicUrl(filePath);
          if (data?.publicUrl) slipUrl = data.publicUrl;
        }
      } catch (err) {
        console.warn('Slip upload to Supabase storage skipped/failed:', err);
      }
    }

    const newOrder: Order = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'ord-' + Date.now(),
      no,
      customer_name: params.customerName,
      contact: params.contact,
      note: params.note,
      items: params.items,
      total,
      pay_method: params.payMethod,
      slip: slipUrl,
      status: 'new',
      created_at: new Date().toISOString()
    };

    // If Supabase connected, save to Supabase
    if (this.supabase) {
      try {
        await this.supabase.from('orders').insert({
          no,
          customer_name: params.customerName,
          contact: params.contact,
          note: params.note,
          items: params.items,
          total,
          pay_method: params.payMethod,
          slip: slipUrl,
          status: 'new'
        });
      } catch (err) {
        console.warn('Failed saving order to Supabase:', err);
      }
    }

    // Always save to local storage for immediate access
    const orders = await this.getOrders();
    localStorage.setItem(ORDERS_KEY, JSON.stringify([newOrder, ...orders]));

    // Send Telegram Notification if configured
    this.sendTelegramNotification(newOrder).catch(e => console.warn('Telegram notify error:', e));

    return { ok: true, no };
  }

  // === TRACK ORDER ===
  public async trackOrder(no: string, contact: string): Promise<{
    found: boolean;
    order?: Order;
    links?: { name: string; url: string }[];
  }> {
    const cleanNo = no.trim().toUpperCase();
    const cleanContact = contact.trim().toLowerCase();

    const orders = await this.getOrders();
    const order = orders.find(
      o => o.no.toUpperCase() === cleanNo && o.contact.toLowerCase().replace(/[\s-]/g, '') === cleanContact.replace(/[\s-]/g, '')
    );

    if (!order) {
      return { found: false };
    }

    let links: { name: string; url: string }[] = [];
    if (order.status === 'paid' || order.status === 'delivered') {
      for (const item of order.items) {
        const fileUrl = await this.getProductFile(item.id);
        if (fileUrl) {
          links.push({ name: item.name, url: fileUrl });
        }
      }
    }

    return {
      found: true,
      order,
      links
    };
  }

  // === TELEGRAM BOT NOTIFICATION ===
  public async sendTelegramNotification(order: Order): Promise<boolean> {
    const { telegramBotToken, telegramChatId } = this.config;
    if (!telegramBotToken || !telegramChatId) return false;

    const itemsText = order.items
      .map(i => `• ${i.name} x${i.qty} = ${(i.price * i.qty).toLocaleString()} Ks`)
      .join('\n');

    const message = `🛒 *အော်ဒါအသစ် ရောက်ရှိပါသည် (${order.no})*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *ဝယ်သူ*: ${order.customer_name}\n` +
      `📞 *ဖုန်း/Telegram*: \`${order.contact}\`\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `${itemsText}\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *စုစုပေါင်း*: *${order.total.toLocaleString()} Ks*\n` +
      `💳 *ငွေပေးချေမှု*: ${order.pay_method}\n` +
      (order.note ? `📝 *မှတ်ချက်*: ${order.note}\n` : '') +
      `🧾 *ပြေစာ*: ${order.slip && order.slip.startsWith('http') ? `[ကြည့်ရှုရန်](${order.slip})` : 'Slip ပူးတွဲထားပါသည်'}`;

    try {
      const res = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to notify Telegram:', e);
      return false;
    }
  }

  public resetToDefaultData() {
    localStorage.removeItem(PRODUCTS_KEY);
    localStorage.removeItem(FILES_KEY);
    localStorage.removeItem(ORDERS_KEY);
    this.initLocalData();
  }
}

export const storeService = new StoreService();
