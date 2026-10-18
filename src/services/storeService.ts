import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, OrderStatus, AppConfig, CustomerHistoryOrder, PriceAlert, ProductReview } from '../types';
import { INITIAL_PRODUCTS, DEFAULT_PAYMENT_ACCOUNTS, INITIAL_REVIEWS } from '../data/initialData';
import { db } from './firebase';
import { doc, setDoc, getDocs, collection, updateDoc, deleteDoc } from 'firebase/firestore';

const CONFIG_KEY = 'linhtet_config';
const PRODUCTS_KEY = 'linhtet_products';
const FILES_KEY = 'linhtet_product_files';
const ORDERS_KEY = 'linhtet_orders';
const PRICE_ALERTS_KEY = 'linhtet_price_alerts';
const SAVED_TELEGRAM_KEY = 'LH_SAVED_TELEGRAM_ID';
const REVIEWS_KEY = 'linhtet_product_reviews';
const SAVED_REVIEWER_NAME_KEY = 'LH_SAVED_REVIEWER_NAME';

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
        const payments = parsed.paymentAccounts || { ...DEFAULT_PAYMENT_ACCOUNTS };
        // Auto-migrate any stale placeholder phone numbers from previous versions
        if (payments.KPay && (payments.KPay.number === '09-777123456' || !payments.KPay.number)) {
          payments.KPay.number = '09970340032';
        }
        if (payments.WavePay && (payments.WavePay.number === '09-777123456' || !payments.WavePay.number)) {
          payments.WavePay.number = '09970340032';
        }
        if (payments.AYAPay && (payments.AYAPay.number === '09-777123456' || !payments.AYAPay.number)) {
          payments.AYAPay.number = '09970340032';
        }
        return {
          supabaseUrl: parsed.supabaseUrl || localStorage.getItem('LH_SUPABASE_URL') || defaultUrl,
          supabaseAnonKey: parsed.supabaseAnonKey || localStorage.getItem('LH_SUPABASE_KEY') || defaultKey,
          supabaseServiceKey: parsed.supabaseServiceKey || defaultKey,
          telegramBotToken: parsed.telegramBotToken || defaultBot,
          telegramChatId: parsed.telegramChatId || '',
          paymentAccounts: payments
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
      paymentAccounts: { ...DEFAULT_PAYMENT_ACCOUNTS }
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

    if (!localStorage.getItem(REVIEWS_KEY)) {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(INITIAL_REVIEWS));
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

  public async updateProduct(id: string, updates: Partial<Product>, downloadLink?: string): Promise<{ notifiedCount: number }> {
    const current = await this.getProducts();
    const existing = current.find(p => p.id === id);
    const oldPrice = existing?.price;

    if (this.supabase) {
      try {
        await this.supabase.from('products').update(updates).eq('id', id);
        if (downloadLink !== undefined) {
          await this.supabase.from('product_files').upsert({
            product_id: id,
            url: downloadLink
          });
        }
      } catch (e) {
        console.warn('Supabase update failed:', e);
      }
    }

    const updated = current.map(p => (p.id === id ? { ...p, ...updates } : p));
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));

    if (downloadLink !== undefined) {
      const rawFiles = localStorage.getItem(FILES_KEY);
      const files = rawFiles ? JSON.parse(rawFiles) : {};
      files[id] = downloadLink;
      localStorage.setItem(FILES_KEY, JSON.stringify(files));
    }

    let notifiedCount = 0;
    if (existing && updates.price !== undefined && oldPrice !== undefined && updates.price < oldPrice) {
      const updatedProduct = { ...existing, ...updates, price: updates.price };
      const triggerRes = await this.checkAndTriggerPriceAlerts(updatedProduct, oldPrice, updates.price);
      notifiedCount = triggerRes.notifiedCount;
    }

    return { notifiedCount };
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

  // === CUSTOMER ORDER HISTORY ===
  public async getCustomerOrderHistory(contact: string): Promise<CustomerHistoryOrder[]> {
    const rawContact = contact.trim().toLowerCase();
    if (!rawContact) return [];

    const normalize = (val: string) => {
      let str = val.trim().toLowerCase().replace(/[\s-+]/g, '');
      if (str.startsWith('959')) str = '09' + str.slice(3);
      if (str.startsWith('9509')) str = '09' + str.slice(4);
      return str;
    };

    const target = normalize(rawContact);
    const orders = await this.getOrders();

    const matched = orders.filter(o => {
      const oContact = normalize(o.contact || '');
      // Match exact normalized, substring, or telegram username
      if (oContact === target) return true;
      if (oContact.includes(target) && target.length >= 6) return true;
      if (target.includes(oContact) && oContact.length >= 6) return true;
      return false;
    });

    // Populate unlocked download links for paid or delivered orders
    const historyOrders: CustomerHistoryOrder[] = await Promise.all(
      matched.map(async (order) => {
        let unlockedLinks: { name: string; url: string }[] = [];
        if (order.status === 'paid' || order.status === 'delivered') {
          for (const item of order.items) {
            const fileUrl = await this.getProductFile(item.id);
            if (fileUrl) {
              unlockedLinks.push({ name: item.name, url: fileUrl });
            }
          }
        }
        return {
          ...order,
          unlockedLinks
        };
      })
    );

    // Sort by created_at descending (newest first)
    return historyOrders.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
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

  // === PRICE ALERT METHODS ===

  public getSavedTelegramId(): string {
    return localStorage.getItem(SAVED_TELEGRAM_KEY) || '';
  }

  public saveTelegramId(telegramId: string): void {
    if (telegramId.trim()) {
      localStorage.setItem(SAVED_TELEGRAM_KEY, telegramId.trim());
    }
  }

  private getLocalPriceAlerts(): PriceAlert[] {
    const raw = localStorage.getItem(PRICE_ALERTS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private saveLocalPriceAlerts(alerts: PriceAlert[]): void {
    localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(alerts));
  }

  public async createPriceAlert(alertData: Omit<PriceAlert, 'id' | 'createdAt' | 'status'>): Promise<PriceAlert> {
    const id = 'pa_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newAlert: PriceAlert = {
      id,
      ...alertData,
      telegramId: alertData.telegramId.trim(),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    // Save locally
    const current = this.getLocalPriceAlerts();
    const updated = [
      newAlert,
      ...current.filter(a => !(a.productId === newAlert.productId && a.telegramId.toLowerCase() === newAlert.telegramId.toLowerCase() && a.status === 'active'))
    ];
    this.saveLocalPriceAlerts(updated);

    // Remember Telegram ID
    this.saveTelegramId(newAlert.telegramId);

    // Save to Firestore
    try {
      await setDoc(doc(db, 'price_alerts', id), {
        productId: newAlert.productId,
        productName: newAlert.productName,
        telegramId: newAlert.telegramId,
        currentPriceAtCreation: newAlert.currentPriceAtCreation,
        targetPrice: newAlert.targetPrice ?? null,
        status: newAlert.status,
        createdAt: newAlert.createdAt,
        productImage: newAlert.productImage || ''
      });
    } catch (e) {
      console.warn('Firestore price alert save fallback:', e);
    }

    return newAlert;
  }

  public async getPriceAlerts(productId?: string, telegramId?: string): Promise<PriceAlert[]> {
    let alerts = this.getLocalPriceAlerts();

    try {
      const snap = await getDocs(collection(db, 'price_alerts'));
      if (!snap.empty) {
        const firestoreAlerts: PriceAlert[] = [];
        snap.forEach(d => {
          const data = d.data();
          firestoreAlerts.push({
            id: d.id,
            productId: data.productId,
            productName: data.productName,
            telegramId: data.telegramId,
            currentPriceAtCreation: data.currentPriceAtCreation,
            targetPrice: data.targetPrice || undefined,
            status: data.status,
            createdAt: data.createdAt,
            productImage: data.productImage,
            notifiedAt: data.notifiedAt,
            triggeredPrice: data.triggeredPrice
          });
        });

        const mergedMap = new Map<string, PriceAlert>();
        alerts.forEach(a => mergedMap.set(a.id, a));
        firestoreAlerts.forEach(a => mergedMap.set(a.id, a));
        alerts = Array.from(mergedMap.values());
        this.saveLocalPriceAlerts(alerts);
      }
    } catch {
      // offline fallback
    }

    if (productId) {
      alerts = alerts.filter(a => a.productId === productId);
    }
    if (telegramId) {
      const cleanTelegram = telegramId.trim().toLowerCase().replace(/^@/, '');
      alerts = alerts.filter(a => {
        const t = a.telegramId.toLowerCase().replace(/^@/, '');
        return t === cleanTelegram;
      });
    }

    return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async cancelPriceAlert(alertId: string): Promise<void> {
    const alerts = this.getLocalPriceAlerts();
    const updated = alerts.map(a => a.id === alertId ? { ...a, status: 'cancelled' as const } : a);
    this.saveLocalPriceAlerts(updated);

    try {
      await updateDoc(doc(db, 'price_alerts', alertId), { status: 'cancelled' });
    } catch {
      // ignore
    }
  }

  public async deletePriceAlert(alertId: string): Promise<void> {
    const alerts = this.getLocalPriceAlerts();
    const updated = alerts.filter(a => a.id !== alertId);
    this.saveLocalPriceAlerts(updated);

    try {
      await deleteDoc(doc(db, 'price_alerts', alertId));
    } catch {
      // ignore
    }
  }

  public async sendPriceDropTelegramAlert(
    alert: PriceAlert,
    product: Product,
    oldPrice: number,
    newPrice: number
  ): Promise<boolean> {
    const { telegramBotToken, telegramChatId } = this.config;
    if (!telegramBotToken) {
      console.warn('Telegram Bot Token not configured in settings');
      return false;
    }

    const discountAmount = oldPrice - newPrice;
    const discountPercent = Math.round((discountAmount / oldPrice) * 100);

    const message = 
      `📉 *PRICE DROP ALERT! (ဈေးနှုန်းကျဆင်းမှု အထူးသတိပေးချက်)*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📦 *ပစ္စည်း*: *${product.name}*\n` +
      `🏷 *အမျိုးအစား*: ${product.category}\n` +
      `\n` +
      `💵 *ယခင်ဈေး*: ~${oldPrice.toLocaleString()} Ks~\n` +
      `🔥 *ယခုလျှော့ဈေး*: *${newPrice.toLocaleString()} Ks* (-${discountPercent}% OFF)\n` +
      `💰 *သက်သာသွားငွေ*: ${discountAmount.toLocaleString()} Ks\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *အကြောင်းကြားသူ*: \`${alert.telegramId}\`\n` +
      `💡 သင် စောင့်ကြည့်ထားသော ပစ္စည်း ဈေးနှုန်းကျဆင်းသွားပါပြီ! အခုပဲ အမြန် ဝယ်ယူနိုင်ပါပြီ။\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `🏪 *Lin Htet IT Service Store*`;

    let success = false;

    if (telegramChatId) {
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
        if (res.ok) success = true;
      } catch (e) {
        console.error('Failed to notify store channel:', e);
      }
    }

    const numericChatId = alert.telegramId.trim().replace(/^@/, '');
    if (/^-?\d+$/.test(numericChatId) && numericChatId !== telegramChatId) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: numericChatId,
            text: message,
            parse_mode: 'Markdown'
          })
        });
        if (res.ok) success = true;
      } catch (e) {
        console.error('Failed to notify subscriber chat ID:', e);
      }
    }

    return success;
  }

  public async checkAndTriggerPriceAlerts(
    product: Product,
    oldPrice: number,
    newPrice: number
  ): Promise<{ notifiedCount: number; alerts: PriceAlert[] }> {
    if (newPrice >= oldPrice) {
      return { notifiedCount: 0, alerts: [] };
    }

    const allAlerts = await this.getPriceAlerts(product.id);
    const matchingAlerts = allAlerts.filter(a => {
      if (a.status !== 'active') return false;
      if (a.targetPrice !== undefined && a.targetPrice > 0) {
        return newPrice <= a.targetPrice;
      }
      return true;
    });

    if (matchingAlerts.length === 0) {
      return { notifiedCount: 0, alerts: [] };
    }

    const now = new Date().toISOString();
    let notifiedCount = 0;

    for (const alert of matchingAlerts) {
      await this.sendPriceDropTelegramAlert(alert, product, oldPrice, newPrice);
      notifiedCount++;

      alert.status = 'notified';
      alert.notifiedAt = now;
      alert.triggeredPrice = newPrice;

      try {
        await updateDoc(doc(db, 'price_alerts', alert.id), {
          status: 'notified',
          notifiedAt: now,
          triggeredPrice: newPrice
        });
      } catch {
        // ignore
      }
    }

    const all = this.getLocalPriceAlerts();
    const updated = all.map(a => {
      const match = matchingAlerts.find(m => m.id === a.id);
      return match ? { ...a, status: 'notified' as const, notifiedAt: now, triggeredPrice: newPrice } : a;
    });
    this.saveLocalPriceAlerts(updated);

    return { notifiedCount, alerts: matchingAlerts };
  }

  public async sendTestPriceAlert(product: Product, telegramId: string): Promise<{ success: boolean; message: string }> {
    const { telegramBotToken, telegramChatId } = this.config;
    if (!telegramBotToken) {
      return {
        success: false,
        message: 'Telegram Bot Token မထည့်ရသေးပါ။ Settings (သို့မဟုတ် Admin) တွင် Bot Token ထည့်သွင်းပေးပါ။'
      };
    }

    const testMessage = 
      `🔔 *PRICE ALERT TEST (စမ်းသပ် သတိပေးချက်)*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📦 *ပစ္စည်း*: *${product.name}*\n` +
      `💵 *လက်ရှိဈေး*: ${product.price.toLocaleString()} Ks\n` +
      `👤 *Telegram User*: \`${telegramId}\`\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `✅ သင့် Price Alert စနစ် ကောင်းမွန်စွာ အလုပ်လုပ်နေပါသည်။ ဈေးနှုန်းကျဆင်းပါက အလိုအလျောက် သတိပေးပါမည်။`;

    try {
      const destId = /^-?\d+$/.test(telegramId.trim().replace(/^@/, '')) 
        ? telegramId.trim().replace(/^@/, '') 
        : telegramChatId;

      if (!destId) {
        return {
          success: false,
          message: 'Telegram Chat ID သို့မဟုတ် User ID မတွေ့ရှိပါ။'
        };
      }

      const res = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: destId,
          text: testMessage,
          parse_mode: 'Markdown'
        })
      });

      if (res.ok) {
        return { success: true, message: 'Telegram သို့ စမ်းသပ်သတိပေးချက် အောင်မြင်စွာ ပို့ဆောင်ပြီးပါပြီ!' };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { 
          success: false, 
          message: errData.description || 'Telegram Bot သို့ ပို့ဆောင်၍ မရပါ (Chat ID သို့မဟုတ် User ID မှန်ကန်မှု စစ်ဆေးပါ)' 
        };
      }
    } catch (e: any) {
      return { success: false, message: e.message || 'Telegram ဆက်သွယ်မှု မအောင်မြင်ပါ' };
    }
  }

  // === PRODUCT REVIEWS METHODS ===

  public getSavedReviewerName(): string {
    return localStorage.getItem(SAVED_REVIEWER_NAME_KEY) || '';
  }

  public saveReviewerName(name: string): void {
    if (name.trim()) {
      localStorage.setItem(SAVED_REVIEWER_NAME_KEY, name.trim());
    }
  }

  private getLocalReviews(): ProductReview[] {
    const raw = localStorage.getItem(REVIEWS_KEY);
    if (!raw) return INITIAL_REVIEWS;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_REVIEWS;
    }
  }

  private saveLocalReviews(reviews: ProductReview[]): void {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  }

  public async getReviews(productId?: string): Promise<ProductReview[]> {
    let reviews: ProductReview[] = this.getLocalReviews();

    // Attempt to fetch from Firestore
    try {
      const snap = await getDocs(collection(db, 'reviews'));
      if (!snap.empty) {
        const firestoreReviews: ProductReview[] = [];
        snap.forEach(docSnap => {
          const d = docSnap.data();
          firestoreReviews.push({
            id: docSnap.id,
            productId: d.productId,
            productName: d.productName,
            rating: Number(d.rating) || 5,
            customerName: d.customerName || 'Customer',
            comment: d.comment || '',
            createdAt: d.createdAt || new Date().toISOString(),
            verifiedPurchase: !!d.verifiedPurchase,
            orderNo: d.orderNo || undefined,
            helpfulCount: Number(d.helpfulCount) || 0
          });
        });

        // Merge firestore reviews with any local initial seed reviews not in firestore
        const existingIds = new Set(firestoreReviews.map(r => r.id));
        const merged = [...firestoreReviews];
        reviews.forEach(lr => {
          if (!existingIds.has(lr.id)) {
            merged.push(lr);
          }
        });
        reviews = merged;
        this.saveLocalReviews(reviews);
      }
    } catch (e) {
      // Local fallback
    }

    // Sort newest first
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (productId) {
      return reviews.filter(r => r.productId === productId);
    }
    return reviews;
  }

  public async addReview(reviewData: {
    productId: string;
    productName?: string;
    rating: number;
    customerName: string;
    comment: string;
    verifiedPurchase?: boolean;
    orderNo?: string;
  }): Promise<{ ok: boolean; review: ProductReview }> {
    const id = 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newReview: ProductReview = {
      id,
      productId: reviewData.productId,
      productName: reviewData.productName || '',
      rating: Math.min(5, Math.max(1, Math.round(reviewData.rating))),
      customerName: reviewData.customerName.trim() || 'ဧည့်သည်တော် (Customer)',
      comment: reviewData.comment.trim(),
      createdAt: new Date().toISOString(),
      verifiedPurchase: !!reviewData.verifiedPurchase,
      orderNo: reviewData.orderNo?.trim() || undefined,
      helpfulCount: 0
    };

    // Save locally
    const current = this.getLocalReviews();
    const updated = [newReview, ...current];
    this.saveLocalReviews(updated);

    // Save reviewer name for future convenience
    this.saveReviewerName(newReview.customerName);

    // Save to Firestore
    try {
      await setDoc(doc(db, 'reviews', id), {
        productId: newReview.productId,
        productName: newReview.productName || '',
        rating: newReview.rating,
        customerName: newReview.customerName,
        comment: newReview.comment,
        createdAt: newReview.createdAt,
        verifiedPurchase: newReview.verifiedPurchase,
        orderNo: newReview.orderNo || null,
        helpfulCount: 0
      });
    } catch (err) {
      console.warn('Firestore review save fallback:', err);
    }

    // Trigger local event
    window.dispatchEvent(
      new CustomEvent('linhtet_review_added', { detail: { review: newReview } })
    );

    return { ok: true, review: newReview };
  }

  public async voteReviewHelpful(reviewId: string): Promise<number> {
    const current = this.getLocalReviews();
    let newCount = 1;
    const updated = current.map(r => {
      if (r.id === reviewId) {
        newCount = (r.helpfulCount || 0) + 1;
        return { ...r, helpfulCount: newCount };
      }
      return r;
    });
    this.saveLocalReviews(updated);

    // Update in Firestore
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        helpfulCount: newCount
      });
    } catch (e) {
      // ignore
    }

    return newCount;
  }

  public async deleteReview(reviewId: string): Promise<boolean> {
    const current = this.getLocalReviews();
    this.saveLocalReviews(current.filter(r => r.id !== reviewId));

    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (e) {
      // ignore
    }

    return true;
  }

  public async getProductRatingSummary(productId: string): Promise<{
    average: number;
    count: number;
    countsByRating: Record<number, number>;
  }> {
    const reviews = await this.getReviews(productId);
    const countsByRating: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (reviews.length === 0) {
      return { average: 5.0, count: 0, countsByRating };
    }

    let sum = 0;
    reviews.forEach(r => {
      sum += r.rating;
      countsByRating[r.rating] = (countsByRating[r.rating] || 0) + 1;
    });

    const average = Number((sum / reviews.length).toFixed(1));
    return { average, count: reviews.length, countsByRating };
  }

  public resetToDefaultData() {
    localStorage.removeItem(PRODUCTS_KEY);
    localStorage.removeItem(FILES_KEY);
    localStorage.removeItem(ORDERS_KEY);
    localStorage.removeItem(PRICE_ALERTS_KEY);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(INITIAL_REVIEWS));
    this.initLocalData();
  }
}

export const storeService = new StoreService();
