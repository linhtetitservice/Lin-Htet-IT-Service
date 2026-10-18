import React, { useState, useEffect, useCallback } from 'react';
import { Product, Order, OrderStatus, AppConfig } from './types';
import { storeService } from './services/storeService';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { CartModal } from './components/CartModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { CustomerOrderHistoryModal } from './components/CustomerOrderHistoryModal';
import { PriceAlertModal } from './components/PriceAlertModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { TestimonialSlider } from './components/TestimonialSlider';
import { FAQ } from './components/FAQ';
import { ContactChannels } from './components/ContactChannels';
import { AdminDashboard } from './components/AdminDashboard';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer, ToastNotification } from './components/Toast';
import { AdminAuthGuard } from './components/AdminAuthGuard';
import { Search, ShoppingBag, Filter, ShieldCheck, Phone, Send, Info } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('အားလုံး');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPriceAlertOpen, setIsPriceAlertOpen] = useState(false);
  const [priceAlertProduct, setPriceAlertProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [detailInitialTab, setDetailInitialTab] = useState<'details' | 'reviews'>('details');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [trackInitialNo, setTrackInitialNo] = useState('');
  const [trackInitialContact, setTrackInitialContact] = useState('');
  const [historyInitialContact, setHistoryInitialContact] = useState('');

  // Config & Status
  const [config, setConfig] = useState<AppConfig>(storeService.getConfig());
  const [isSupabaseLive, setIsSupabaseLive] = useState(storeService.isSupabaseConnected());
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  // Toast Handlers
  const addToast = useCallback((toast: ToastNotification) => {
    setToasts(prev => [toast, ...prev.filter(t => t.id !== toast.id).slice(0, 4)]);
  }, []);

  const handleDismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleViewToastOrder = useCallback((orderNo: string, contact?: string) => {
    setTrackInitialNo(orderNo);
    setTrackInitialContact(contact || '');
    setIsTrackOpen(true);
  }, []);

  // Fetch initial data
  const loadData = async () => {
    const fetchedProducts = await storeService.getProducts();
    const fetchedOrders = await storeService.getOrders();
    setProducts(fetchedProducts);
    setOrders(fetchedOrders);
    setConfig(storeService.getConfig());
    setIsSupabaseLive(storeService.isSupabaseConnected());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Listen for Order Status Updates (Realtime or Admin updates)
  useEffect(() => {
    const handleStatusUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ order: Order; previousStatus?: OrderStatus }>;
      const { order, previousStatus } = customEvent.detail || {};
      if (!order) return;

      // Trigger toast when status changes to 'paid' (Processing) or 'delivered' (Completed)
      if (order.status === 'paid' && previousStatus !== 'paid') {
        addToast({
          id: `toast-${order.no}-${Date.now()}`,
          orderNo: order.no,
          contact: order.contact,
          status: 'processing',
          title: `✨ အော်ဒါ #${order.no} ငွေလွှဲစစ်ပြီး (Processing)`,
          message: `မင်္ဂလာပါ ${order.customer_name}၊ ငွေလွှဲပြေစာ အတည်ပြုပြီးဖြစ်၍ Download Link အသုံးပြုနိုင်ပါပြီ!`,
          timestamp: Date.now(),
        });
      } else if (order.status === 'delivered' && previousStatus !== 'delivered') {
        addToast({
          id: `toast-${order.no}-${Date.now()}`,
          orderNo: order.no,
          contact: order.contact,
          status: 'completed',
          title: `✅ အော်ဒါ #${order.no} ပြီးစီးပါပြီ (Completed)`,
          message: `မင်္ဂလာပါ ${order.customer_name}၊ လူကြီးမင်း၏ ဒစ်ဂျစ်တယ်ပစ္စည်း အောင်မြင်စွာ ပို့ဆောင်ပြီးပါပြီ!`,
          timestamp: Date.now(),
        });
      }
    };

    window.addEventListener('linhtet_order_status_updated', handleStatusUpdate);
    return () => {
      window.removeEventListener('linhtet_order_status_updated', handleStatusUpdate);
    };
  }, [addToast]);

  // Cart operations
  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const handleAddToCart = (product: Product) => {
    setCart(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1,
    }));
    setLastAddedId(product.id);
    setTimeout(() => setLastAddedId(null), 1500);
  };

  const handleBuyNow = (product: Product) => {
    setCart(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1,
    }));
    setIsCartOpen(true);
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: next };
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => {
      const { [productId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleClearCart = () => {
    setCart({});
  };

  // Order Submission
  const handleSubmitOrder = async (orderData: {
    customerName: string;
    contact: string;
    note: string;
    payMethod: string;
    slipDataUrl: string;
    items: { id: string; name: string; price: number; qty: number }[];
  }) => {
    const res = await storeService.submitOrder(orderData);
    if (res.ok) {
      await loadData();
    }
    return res;
  };

  // Order Tracking & Purchase History
  const handleTrackOrder = async (no: string, contact: string) => {
    return await storeService.trackOrder(no, contact);
  };

  const handleOpenHistory = (contact?: string) => {
    if (contact) {
      setHistoryInitialContact(contact);
    }
    setIsHistoryOpen(true);
  };

  const handleOpenPriceAlert = (product: Product) => {
    setPriceAlertProduct(product);
    setIsPriceAlertOpen(true);
  };

  const handleOpenProductDetail = (product: Product, initialTab: 'details' | 'reviews' = 'details') => {
    setDetailProduct(product);
    setDetailInitialTab(initialTab);
    setIsDetailOpen(true);
  };

  // Admin Actions
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await storeService.updateOrderStatus(orderId, status);
    await loadData();
  };

  const handleDeleteOrder = async (orderId: string) => {
    await storeService.deleteOrder(orderId);
    await loadData();
  };

  const handleAddProduct = async (
    productData: Omit<Product, 'id' | 'created_at'>,
    downloadLink?: string
  ) => {
    await storeService.createProduct(productData, downloadLink);
    await loadData();
  };

  const handleUpdateProduct = async (
    productId: string,
    updates: Partial<Product>,
    downloadLink?: string
  ) => {
    const res = await storeService.updateProduct(productId, updates, downloadLink);
    await loadData();
    return res;
  };

  const handleDeleteProduct = async (productId: string) => {
    await storeService.deleteProduct(productId);
    await loadData();
  };

  const handleSaveConfig = (newConfig: Partial<AppConfig>) => {
    storeService.saveConfig(newConfig);
    setConfig(storeService.getConfig());
    setIsSupabaseLive(storeService.isSupabaseConnected());
  };

  const handleResetData = () => {
    storeService.resetToDefaultData();
    loadData();
    setCart({});
  };

  // Categories list
  const activeProducts = products.filter(p => p.active);
  const categories = ['အားလုံး', ...Array.from(new Set(activeProducts.map(p => p.category).filter(Boolean)))];

  const filteredProducts = activeProducts.filter(p => {
    const matchesCategory = selectedCategory === 'အားလုံး' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfaf7] text-[#2b1d12]">
      {/* Top Navigation Bar */}
      <Header
        cartCount={cartItemCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTrack={() => {
          setTrackInitialNo('');
          setTrackInitialContact('');
          setIsTrackOpen(true);
        }}
        onOpenHistory={() => handleOpenHistory()}
        onOpenAdmin={() => setIsAdminView(true)}
        isAdminView={isAdminView}
        onToggleAdminView={() => setIsAdminView(prev => !prev)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSupabaseLive={isSupabaseLive}
      />

      {/* Main Body */}
      {isAdminView ? (
        /* ADMIN DASHBOARD VIEW PROTECTED BY FIREBASE */
        <main className="flex-1">
          <AdminAuthGuard onBackToStore={() => setIsAdminView(false)}>
            {(_adminUser, _onLogout) => (
              <AdminDashboard
                products={products}
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onDeleteOrder={handleDeleteOrder}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onRefreshData={loadData}
                onOpenSettings={() => setIsSettingsOpen(true)}
                isSupabaseLive={isSupabaseLive}
              />
            )}
          </AdminAuthGuard>
        </main>
      ) : (
        /* CUSTOMER STOREFRONT VIEW */
        <main className="flex-1">
          <Hero 
            onOpenTrack={() => {
              setTrackInitialNo('');
              setTrackInitialContact('');
              setIsTrackOpen(true);
            }}
            onOpenHistory={() => handleOpenHistory()}
          />

          {/* Search & Category Filter Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-6 border-b border-[#ebdccd]">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#6b4226] text-white shadow-xs'
                        : 'bg-white text-[#5c4738] border border-[#e6d8c8] hover:bg-[#f7f0e8]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[260px] sm:min-w-[320px]">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#8d7159]" />
                <input
                  type="text"
                  placeholder="ရှာရန်... (VPN, Canva, Windows, etc.)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl border border-[#d9c4b3] bg-white placeholder-[#9c8471] focus:border-[#6b4226] focus:ring-1 focus:ring-[#6b4226] outline-none shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Results Count & Current Filter Info */}
            <div className="mt-4 flex items-center justify-between text-xs text-[#735c49]">
              <span>
                ရလဒ် <b>{filteredProducts.length}</b> ခု ပြသထားပါသည်
                {selectedCategory !== 'အားလုံး' && ` (${selectedCategory})`}
              </span>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Stock အသင့်ရှိသော Digital Items များ</span>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-[#e6d8c8] mt-6">
                <ShoppingBag className="w-12 h-12 text-[#d9c4b3] mx-auto mb-3" />
                <h3 className="font-bold text-stone-700 text-base">ရှာဖွေမှုနှင့် ကိုက်ညီသော Product မရှိပါ</h3>
                <p className="text-xs text-stone-500 mt-1">
                  အခြား စာလုံး သို့မဟုတ် Category အားလုံးကို ရွေးချယ်ကြည့်ပါ
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('အားလုံး');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#6b4226] text-white hover:bg-[#53321d]"
                >
                  မူလအတိုင်း ပြန်ကြည့်မည်
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    onOpenPriceAlert={handleOpenPriceAlert}
                    onOpenDetail={handleOpenProductDetail}
                    isAdded={lastAddedId === product.id}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Customer Testimonial Slider / Carousel Section */}
          <TestimonialSlider
            products={products}
            onSelectProduct={(prod, tab) => handleOpenProductDetail(prod, tab || 'details')}
          />

          {/* How to Order / Guide Section */}
          <section className="bg-[#f7f0e8] border-t border-[#ebdccd] py-12 px-4 sm:px-6 lg:px-8 mt-12">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-lg sm:text-xl font-extrabold text-[#6b4226]">
                  ဝယ်ယူပုံ အဆင့်ဆင့်
                </h3>
                <p className="text-xs sm:text-sm text-[#735c49] mt-1">
                  မိနစ်ပိုင်းအတွင်း အလွယ်တကူ ဝယ်ယူပြီး ဒေါင်းလုဒ်ရယူနိုင်ပါသည်
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-[#e6d8c8] shadow-xs text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#f7f0e8] text-[#6b4226] font-extrabold flex items-center justify-center mx-auto text-base">
                    ၁
                  </div>
                  <h4 className="font-bold text-sm text-[#2b1d12]">ပစ္စည်းရွေးချယ်ပါ</h4>
                  <p className="text-xs text-[#5c4738] leading-relaxed">
                    လိုချင်သော Digital Product ကို ခြင်းတောင်းထဲထည့်ပြီး ဝယ်ယူသူ အချက်အလက်ဖြည့်ပါ။
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#e6d8c8] shadow-xs text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#f7f0e8] text-[#6b4226] font-extrabold flex items-center justify-center mx-auto text-base">
                    ၂
                  </div>
                  <h4 className="font-bold text-sm text-[#2b1d12]">KPay / WavePay ငွေလွှဲပါ</h4>
                  <p className="text-xs text-[#5c4738] leading-relaxed">
                    ဖော်ပြထားသော နံပါတ်သို့ ငွေလွှဲပြီး Screenshot (Slip) ပုံကို ပူးတွဲတင်ပေးပါ။
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#e6d8c8] shadow-xs text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#f7f0e8] text-[#6b4226] font-extrabold flex items-center justify-center mx-auto text-base">
                    ၃
                  </div>
                  <h4 className="font-bold text-sm text-[#2b1d12]">Download Link ရယူပါ</h4>
                  <p className="text-xs text-[#5c4738] leading-relaxed">
                    ငွေစစ်ပြီးသည်နှင့် "အော်ဒါစစ်ရန်" မှတစ်ဆင့် Download Link / Credentials ကို ချက်ချင်း ရယူပါ။
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Accordion Section */}
          <FAQ
            onOpenTrack={() => {
              setTrackInitialNo('');
              setTrackInitialContact('');
              setIsTrackOpen(true);
            }}
            onOpenHistory={() => handleOpenHistory()}
            supportTelegram="https://t.me/+959675663660"
            supportPhone={config.paymentAccounts?.KPay?.number || '09970340032'}
          />

          {/* Dedicated Imo, Telegram, Viber, WhatsApp Contact Channels */}
          <ContactChannels />
        </main>
      )}

      {/* Footer */}
      <footer className="bg-[#6b4226] text-[#f7f0e8] border-t border-[#53321d] py-10 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div>
            <h4 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#f7f0e8] text-[#6b4226] flex items-center justify-center text-xs font-black">
                LH
              </span>
              Lin Htet IT Service
            </h4>
            <p className="text-xs text-[#d9c4b3] mt-1 max-w-md">
              လူကြီးမင်းတို့၏ Digital လိုအပ်ချက်များအတွက် စိတ်ချရသော Software၊ VPN၊ Canva Pro နှင့် Premium အကောင့်များ
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2 text-xs text-[#d9c4b3]">
            {/* Payment Numbers */}
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end">
              <span className="bg-[#53321d] px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white">
                KBZPay: <b className="text-amber-300 font-mono">{config.paymentAccounts?.KPay?.number || '09970340032'}</b>
              </span>
              <span className="bg-[#53321d] px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white">
                WavePay: <b className="text-amber-300 font-mono">{config.paymentAccounts?.WavePay?.number || '09970340032'}</b>
              </span>
            </div>

            {/* Official Contact Channels Bar */}
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end text-[11px] pt-1">
              <a
                href="https://t.me/+959675663660"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#2AABEE]/20 hover:bg-[#2AABEE]/30 text-sky-200 border border-sky-400/30 px-2 py-0.5 rounded-md font-semibold transition-colors flex items-center gap-1"
              >
                <span>Telegram: 09675663660</span>
              </a>
              <a
                href="viber://chat?number=%2B959970340032"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#7360f2]/20 hover:bg-[#7360f2]/30 text-purple-200 border border-purple-400/30 px-2 py-0.5 rounded-md font-semibold transition-colors flex items-center gap-1"
              >
                <span>Viber: 09970340032</span>
              </a>
              <a
                href="https://wa.me/959970340032"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366]/20 hover:bg-[#25D366]/30 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-md font-semibold transition-colors flex items-center gap-1"
              >
                <span>WhatsApp: 09970340032</span>
              </a>
              <a
                href="tel:09970340032"
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-md font-semibold transition-colors flex items-center gap-1"
              >
                <span>Imo / Call: 09970340032</span>
              </a>
            </div>

            <p className="text-[11px] text-[#c7b29e] mt-1">
              © {new Date().getFullYear()} Lin Htet IT Service. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Cart & Checkout Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        products={products}
        paymentAccounts={config.paymentAccounts}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onSubmitOrder={handleSubmitOrder}
        onOpenTrackWithNo={(no, contact) => {
          setTrackInitialNo(no);
          setTrackInitialContact(contact);
          setIsTrackOpen(true);
        }}
      />

      {/* 2. Order Tracking Modal */}
      <TrackOrderModal
        isOpen={isTrackOpen}
        onClose={() => setIsTrackOpen(false)}
        initialOrderNo={trackInitialNo}
        initialContact={trackInitialContact}
        onOpenHistory={(contact) => {
          setIsTrackOpen(false);
          handleOpenHistory(contact);
        }}
        onTrack={handleTrackOrder}
      />

      {/* 3. Customer Purchase History Modal */}
      <CustomerOrderHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        initialContact={historyInitialContact}
        onFetchHistory={c => storeService.getCustomerOrderHistory(c)}
        onOpenTrackOrder={(no, contact) => {
          setIsHistoryOpen(false);
          setTrackInitialNo(no);
          setTrackInitialContact(contact);
          setIsTrackOpen(true);
        }}
      />

      {/* 4. Product Price Alert Modal */}
      <PriceAlertModal
        isOpen={isPriceAlertOpen}
        onClose={() => setIsPriceAlertOpen(false)}
        product={priceAlertProduct}
        onAlertCreated={() => {
          // Alert registered
        }}
      />

      {/* 4.5 Product Detail View & Reviews Modal */}
      <ProductDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        product={detailProduct}
        initialTab={detailInitialTab}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onOpenPriceAlert={handleOpenPriceAlert}
      />

      {/* 5. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        onResetData={handleResetData}
        isSupabaseLive={isSupabaseLive}
      />

      {/* Toast Notification Container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
        onViewOrder={handleViewToastOrder}
      />
    </div>
  );
}
