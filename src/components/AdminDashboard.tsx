import React, { useState, useEffect } from 'react';
import { Product, Order, OrderStatus, PriceAlert, ProductReview } from '../types';
import { storeService } from '../services/storeService';
import { 
  Package, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Link as LinkIcon, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  Search, 
  Check, 
  X, 
  BarChart3, 
  Bell, 
  TrendingDown, 
  Sparkles, 
  Send, 
  Edit3, 
  AlertTriangle,
  Star,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';
import { OrderTrendsChart } from './OrderTrendsChart';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  onAddProduct: (product: Omit<Product, 'id' | 'created_at'>, downloadLink?: string) => Promise<void>;
  onUpdateProduct: (productId: string, updates: Partial<Product>, downloadLink?: string) => Promise<{ notifiedCount?: number } | void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onRefreshData: () => Promise<void>;
  onOpenSettings: () => void;
  isSupabaseLive: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  onUpdateOrderStatus,
  onDeleteOrder,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRefreshData,
  onOpenSettings,
  isSupabaseLive,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'trends' | 'products' | 'price_alerts' | 'reviews'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Price Alerts State
  const [adminAlerts, setAdminAlerts] = useState<PriceAlert[]>([]);
  const [priceAlertSearch, setPriceAlertSearch] = useState('');
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  // Reviews State
  const [adminReviews, setAdminReviews] = useState<ProductReview[]>([]);
  const [reviewsSearch, setReviewsSearch] = useState('');
  const [reviewProductFilter, setReviewProductFilter] = useState('all');

  // Edit Product Details Modal State
  const [editingProductDetails, setEditingProductDetails] = useState<Product | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [editPriceValue, setEditPriceValue] = useState('');
  const [editCategoryValue, setEditCategoryValue] = useState('');
  const [editStockValue, setEditStockValue] = useState('');
  const [editImageValue, setEditImageValue] = useState('');
  const [editDescValue, setEditDescValue] = useState('');
  const [editProductLinkValue, setEditProductLinkValue] = useState('');
  const [updatingProduct, setUpdatingProduct] = useState(false);

  // New Product Modal State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pCategory, setPCategory] = useState('General');
  const [pImage, setPImage] = useState('');
  const [pStock, setPStock] = useState('5');
  const [pLink, setPLink] = useState('');
  const [pDesc, setPDesc] = useState('');

  // Edit Link Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editLinkValue, setEditLinkValue] = useState('');

  // Slip Fullscreen Viewer
  const [viewingSlipUrl, setViewingSlipUrl] = useState<string | null>(null);

  const loadAdminAlerts = async () => {
    try {
      const res = await storeService.getPriceAlerts();
      setAdminAlerts(res);
    } catch {
      // ignore
    }
  };

  const loadAdminReviews = async () => {
    try {
      const res = await storeService.getReviews();
      setAdminReviews(res);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadAdminAlerts();
    loadAdminReviews();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefreshData();
    await loadAdminAlerts();
    await loadAdminReviews();
    setRefreshing(false);
  };

  const handleDeleteAdminReview = async (reviewId: string) => {
    if (window.confirm('ဤသုံးသပ်ချက်ကို ပယ်ဖျက်ရန် သေချာပါသလား?')) {
      await storeService.deleteReview(reviewId);
      await loadAdminReviews();
      setAlertNotice('သုံးသပ်ချက်ကို အောင်မြင်စွာ ပယ်ဖျက်ပြီးပါပြီ');
      setTimeout(() => setAlertNotice(null), 3000);
    }
  };

  const handleSaveProductDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductDetails) return;
    const newPrice = parseFloat(editPriceValue);
    if (isNaN(newPrice) || newPrice < 0) return;

    setUpdatingProduct(true);
    const prevPrice = editingProductDetails.price;

    const res = await onUpdateProduct(
      editingProductDetails.id,
      {
        name: editNameValue.trim(),
        price: newPrice,
        category: editCategoryValue.trim(),
        stock: parseInt(editStockValue) || 0,
        image: editImageValue.trim(),
        description: editDescValue.trim(),
      },
      editProductLinkValue.trim()
    );

    await loadAdminAlerts();
    setUpdatingProduct(false);
    setEditingProductDetails(null);

    if (res && typeof res === 'object' && res.notifiedCount && res.notifiedCount > 0) {
      setAlertNotice(`🎉 ဈေးနှုန်းကျဆင်းမှုအတွက် စောင့်ကြည့်နေသူ ${res.notifiedCount} ဦးထံ Telegram Price Alert ပေးပို့ပြီးပါပြီ!`);
      setTimeout(() => setAlertNotice(null), 6000);
    } else if (newPrice < prevPrice) {
      setAlertNotice(`📉 ဈေးနှုန်းကို ${prevPrice.toLocaleString()} Ks မှ ${newPrice.toLocaleString()} Ks သို့ လျှော့ချပြင်ဆင်ပြီးပါပြီ!`);
      setTimeout(() => setAlertNotice(null), 5000);
    }
  };

  const handleSendManualAlert = async (alert: PriceAlert) => {
    const targetProduct = products.find(p => p.id === alert.productId);
    if (!targetProduct) return;
    const res = await storeService.sendPriceDropTelegramAlert(
      alert,
      targetProduct,
      alert.currentPriceAtCreation,
      targetProduct.price
    );
    if (res) {
      setAlertNotice(`✅ ${alert.telegramId} ထံသို့ Telegram သတိပေးချက် ပို့ဆောင်ပြီးပါပြီ!`);
    } else {
      setAlertNotice(`⚠️ Telegram သို့ မပို့ဆောင်နိုင်ပါ (Settings တွင် Bot Token သို့မဟုတ် Chat ID စစ်ဆေးပါ)`);
    }
    setTimeout(() => setAlertNotice(null), 5000);
  };

  const handleDeleteAdminAlert = async (alertId: string) => {
    await storeService.deletePriceAlert(alertId);
    await loadAdminAlerts();
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !pPrice) return;

    await onAddProduct(
      {
        name: pName.trim(),
        price: parseFloat(pPrice) || 0,
        category: pCategory.trim() || 'General',
        image: pImage.trim(),
        description: pDesc.trim(),
        stock: parseInt(pStock) || 5,
        active: true,
      },
      pLink.trim()
    );

    // Reset Form
    setPName('');
    setPPrice('');
    setPCategory('General');
    setPImage('');
    setPStock('5');
    setPLink('');
    setPDesc('');
    setIsAddingProduct(false);
  };

  const handleSaveEditLink = async () => {
    if (!editingProduct) return;
    await onUpdateProduct(editingProduct.id, {}, editLinkValue.trim());
    setEditingProduct(null);
  };

  const newOrdersCount = orders.filter(o => o.status === 'new').length;
  const activeAlertsCount = adminAlerts.filter(a => a.status === 'active').length;

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch = 
      o.no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.contact.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Title & Bar */}
      <div className="bg-white rounded-2xl border border-[#e6d8c8] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#6b4226]">
              Admin Control Panel
            </h2>
            {isSupabaseLive ? (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Connected to Supabase
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-300">
                Demo Storage Mode
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#735c49] mt-0.5">
            အော်ဒါများစစ်ဆေးခြင်း၊ ငွေလွှဲပြေစာ အတည်ပြုခြင်းနှင့် Digital Product များ စီမံခန့်ခွဲခြင်း
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#f7f0e8] hover:bg-[#ebdccd] text-[#6b4226] border border-[#d9c4b3] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              const testOrder: Order = orders[0] || {
                id: 'test-order-1',
                no: 'LH' + Math.floor(10000000 + Math.random() * 90000000),
                customer_name: 'စမ်းသပ်ဝယ်ယူသူ',
                contact: '09798112233',
                status: 'paid',
                items: [{ id: 'p1', name: 'Canva Pro Lifetime', price: 12000, qty: 1 }],
                total: 12000,
                pay_method: 'KPay',
                created_at: new Date().toISOString()
              };
              window.dispatchEvent(
                new CustomEvent('linhtet_order_status_updated', {
                  detail: { order: { ...testOrder, status: 'paid' }, previousStatus: 'new' }
                })
              );
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors"
            title="အော်ဒါ Status ပြောင်းလဲမှု Toast Notification ကို စမ်းသပ်ကြည့်ရှုရန်"
          >
            <span>🔔 Toast စမ်းသပ်ရန်</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#f7f0e8] hover:bg-[#ebdccd] text-[#6b4226] border border-[#d9c4b3] transition-colors"
          >
            ⚙️ Setup & Keys
          </button>

          <a
            href="/admin.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#6b4226] hover:bg-[#53321d] text-white shadow-xs transition-colors"
          >
            <span>သီးသန့် admin.html ဖွင့်ရန်</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e6d8c8] gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-[#6b4226] text-[#6b4226] bg-[#f7f0e8]/50'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>အော်ဒါများ (Orders)</span>
          {newOrdersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-red-600 text-white animate-pulse">
              {newOrdersCount} New
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('trends')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'trends'
              ? 'border-[#6b4226] text-[#6b4226] bg-[#f7f0e8]/50'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>အရောင်း Trends (Analytics)</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'products'
              ? 'border-[#6b4226] text-[#6b4226] bg-[#f7f0e8]/50'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Products စီမံရန် ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('price_alerts')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'price_alerts'
              ? 'border-[#6b4226] text-[#6b4226] bg-[#f7f0e8]/50'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-600" />
          <span>Price Alerts ({adminAlerts.length})</span>
          {activeAlertsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-white animate-pulse">
              {activeAlertsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'reviews'
              ? 'border-[#6b4226] text-[#6b4226] bg-[#f7f0e8]/50'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>Customer Reviews ({adminReviews.length})</span>
        </button>
      </div>

      {/* Alert Notice Toast */}
      {alertNotice && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{alertNotice}</span>
          </div>
          <button
            onClick={() => setAlertNotice(null)}
            className="text-stone-400 hover:text-stone-700 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ORDERS TAB CONTENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-xl border border-[#e6d8c8]">
            <div className="flex items-center gap-1.5 flex-wrap">
              {['all', 'new', 'paid', 'delivered', 'cancelled'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-[#6b4226] text-white shadow-2xs'
                      : 'bg-[#fcfaf7] text-stone-600 hover:bg-[#f7f0e8] border border-stone-200'
                  }`}
                >
                  {st === 'all'
                    ? 'အားလုံး'
                    : st === 'new'
                    ? 'အသစ် (New)'
                    : st === 'paid'
                    ? 'ငွေလက်ခံပြီး (Paid)'
                    : st === 'delivered'
                    ? 'Delivered'
                    : 'Cancelled'}
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="အော်ဒါနံပါတ် / ဖုန်း ရှာရန်..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-[#d9c4b3] bg-[#fcfaf7] outline-none focus:border-[#6b4226]"
              />
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e6d8c8] p-12 text-center text-stone-500">
              <Package className="w-10 h-10 mx-auto text-stone-300 mb-2" />
              <p className="font-semibold">လက်ရှိတွင် အော်ဒါမရှိသေးပါ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                    order.status === 'new'
                      ? 'border-l-8 border-l-red-500 border-red-200 bg-red-50/20'
                      : order.status === 'paid'
                      ? 'border-l-8 border-l-emerald-600 border-[#e6d8c8]'
                      : 'border-[#e6d8c8]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left: Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-extrabold text-base text-[#6b4226]">
                          #{order.no}
                        </span>
                        <span className="text-xs text-stone-400">•</span>
                        <span className="text-xs text-stone-500">
                          {new Date(order.created_at).toLocaleString('my-MM')}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            order.status === 'new'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : order.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : order.status === 'delivered'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="text-xs sm:text-sm text-stone-700 flex flex-wrap gap-x-4 gap-y-1">
                        <span>👤 ဝယ်သူ: <b>{order.customer_name}</b></span>
                        <span>
                          📞 ဖုန်း / Telegram: <a href={`tel:${order.contact}`} className="font-bold text-[#6b4226] underline">{order.contact}</a>
                        </span>
                      </div>

                      {/* Items */}
                      <div className="bg-[#fcfaf7] border border-[#f0e4d7] rounded-xl p-3 text-xs space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-stone-700">
                            <span>• {item.name} <b className="text-stone-900">x{item.qty}</b></span>
                            <span className="font-semibold text-stone-800">
                              {(item.price * item.qty).toLocaleString()} Ks
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="text-xs text-stone-600 flex items-center gap-3 flex-wrap">
                        <span>
                          💰 စုစုပေါင်း: <b className="text-base text-[#6b4226] font-extrabold">{order.total.toLocaleString()} Ks</b>
                        </span>
                        <span>•</span>
                        <span>💳 ငွေပေးချေမှု: <b className="text-stone-800">{order.pay_method}</b></span>
                        {order.note && (
                          <span className="italic text-stone-500">
                            📝 မှတ်ချက်: "{order.note}"
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Slip Thumbnail */}
                    {order.slip ? (
                      <div className="shrink-0 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-stone-500 mb-1">ငွေလွှဲပြေစာ (Slip)</span>
                        <div
                          onClick={() => setViewingSlipUrl(order.slip || null)}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-[#d9c4b3] hover:border-[#6b4226] overflow-hidden cursor-pointer group relative bg-stone-100 shadow-2xs"
                        >
                          <img
                            src={order.slip}
                            alt="Payment Slip"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                            ကြီးပြရန်
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="shrink-0 text-xs text-stone-400 italic p-3 border border-dashed rounded-xl">
                        Slip ပူးတွဲမပါပါ
                      </div>
                    )}

                    {/* Right: Actions */}
                    <div className="shrink-0 flex flex-col sm:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          Status ပြောင်းရန်:
                        </label>
                        <select
                          value={order.status}
                          onChange={e => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="text-xs font-bold py-1.5 px-3 rounded-lg border border-[#d9c4b3] bg-white text-[#2b1d12] outline-none focus:border-[#6b4226]"
                        >
                          <option value="new">🔴 new (စစ်ဆေးဆဲ)</option>
                          <option value="paid">🟢 paid (ငွေစစ်ပြီး - Link ပေးမည်)</option>
                          <option value="delivered">🔵 delivered (ပြီးစီး)</option>
                          <option value="cancelled">⚪ cancelled (ပယ်ဖျက်)</option>
                        </select>
                      </div>

                      {order.status === 'new' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'paid')}
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve & Set Paid</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`အော်ဒါ #${order.no} ကို ဖျက်ရန် သေချာပါသလား?`)) {
                            onDeleteOrder(order.id);
                          }
                        }}
                        className="text-xs text-stone-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>အော်ဒါဖျက်မည်</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TRENDS TAB CONTENT */}
      {activeTab === 'trends' && (
        <OrderTrendsChart orders={orders} />
      )}

      {/* PRODUCTS TAB CONTENT */}
      {activeTab === 'products' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-lg text-[#6b4226]">
              Products စာရင်း & ဒေါင်းလုဒ်လင့်ခ်များ
            </h3>
            <button
              onClick={() => setIsAddingProduct(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#6b4226] hover:bg-[#53321d] text-white shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Product အသစ်ထည့်မည်</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(product => (
              <div
                key={product.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between gap-3 ${
                  product.active ? 'border-[#e6d8c8]' : 'border-stone-200 opacity-60 bg-stone-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-[#2b1d12] truncate">
                        {product.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f7f0e8] text-[#6b4226]">
                        {product.category}
                      </span>
                      {!product.active && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-200 text-stone-600">
                          ဝှက်ထားသည်
                        </span>
                      )}
                      {product.stock !== undefined && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          product.stock < 5
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          Stock: {product.stock} {product.stock < 5 ? '⚠️' : ''}
                        </span>
                      )}
                      {(() => {
                        const alertCountForThis = adminAlerts.filter(a => a.productId === product.id && a.status === 'active').length;
                        if (alertCountForThis > 0) {
                          return (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <Bell className="w-3 h-3 text-amber-600" />
                              <span>{alertCountForThis} Price Alerts</span>
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <span className="text-sm font-extrabold text-[#6b4226] block mt-0.5">
                      {product.price.toLocaleString()} Ks
                    </span>
                    <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Secret Download Link Display */}
                <div className="bg-[#fcfaf7] border border-[#ebdccd] rounded-xl p-2.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#735c49] mb-1">
                    <span className="flex items-center gap-1">
                      <LinkIcon className="w-3 h-3 text-[#6b4226]" />
                      Download Link / Account Credentials
                    </span>
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setEditLinkValue(product.download_link || '');
                      }}
                      className="text-[#6b4226] hover:underline font-bold"
                    >
                      ပြင်မည်
                    </button>
                  </div>
                  <div className="font-mono text-stone-700 truncate bg-white p-1.5 rounded border border-stone-200">
                    {product.download_link ? product.download_link : '(လင့်ခ် မထည့်ရသေးပါ)'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-[#f2e8dc] text-xs gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => onUpdateProduct(product.id, { active: !product.active })}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                        product.active
                          ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                      }`}
                    >
                      {product.active ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>ဝှက်မည်</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>ပြန်ပြမည်</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setEditingProductDetails(product);
                        setEditPriceValue(product.price.toString());
                        setEditStockValue(product.stock !== undefined ? product.stock.toString() : '5');
                        setEditNameValue(product.name);
                        setEditCategoryValue(product.category || 'General');
                        setEditDescValue(product.description || '');
                        setEditImageValue(product.image || '');
                        setEditProductLinkValue(product.download_link || '');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold bg-[#f7f0e8] hover:bg-[#ebdccd] text-[#6b4226] transition-colors"
                      title="ဈေးနှုန်းနှင့် အချက်အလက်များ ပြင်ဆင်မည်"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>ဈေးနှုန်းပြင်မည်</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`"${product.name}" ကို ဖျက်ရန် သေချာပါသလား?`)) {
                        onDeleteProduct(product.id);
                      }
                    }}
                    className="text-stone-400 hover:text-red-600 p-1.5 transition-colors"
                    title="Product ဖျက်မည်"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRICE ALERTS TAB CONTENT */}
      {activeTab === 'price_alerts' && (
        <div className="space-y-6">
          {/* Header & Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#e6d8c8] shadow-xs">
              <span className="text-xs text-stone-500 font-semibold block">စုစုပေါင်း Price Alerts</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-[#6b4226]">{adminAlerts.length}</span>
                <span className="text-xs text-stone-400">ခု</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs">
              <span className="text-xs text-amber-800 font-semibold block">စောင့်ကြည့်ဆဲ (Active Subscriptions)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-amber-900">{activeAlertsCount}</span>
                <span className="text-xs text-amber-700">ဦး ဈေးကျစောင့်ဆိုင်းနေ</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs">
              <span className="text-xs text-emerald-800 font-semibold block">အကြောင်းကြားပြီး (Notified)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-emerald-900">
                  {adminAlerts.filter(a => a.status === 'notified').length}
                </span>
                <span className="text-xs text-emerald-700">စောင် ပို့ပြီး</span>
              </div>
            </div>
          </div>

          {/* Product Demand Overview (Products with most alerts) */}
          <div className="bg-white p-5 rounded-2xl border border-[#e6d8c8] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-[#6b4226]">
                  ဝယ်သူများ ဈေးကျစောင့်ကြည့်နေသော Products များ
                </h4>
                <p className="text-xs text-stone-500">
                  စောင့်ကြည့်သူများသော Product ကို ဈေးလျှော့ပေးပါက Telegram မှတစ်ဆင့် အလိုအလျောက် သတိပေးပါမည်
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {products.map(prod => {
                const count = adminAlerts.filter(a => a.productId === prod.id && a.status === 'active').length;
                return (
                  <div key={prod.id} className="p-3 rounded-xl border border-stone-200 bg-[#fcfaf7] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-[#2b1d12] truncate block">{prod.name}</span>
                      <span className="text-xs text-[#6b4226] font-semibold">{prod.price.toLocaleString()} Ks</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        count > 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-stone-100 text-stone-500'
                      }`}>
                        {count} စောင့်ဆိုင်း
                      </span>
                      <button
                        onClick={() => {
                          setEditingProductDetails(prod);
                          setEditPriceValue(prod.price.toString());
                          setEditStockValue(prod.stock !== undefined ? prod.stock.toString() : '5');
                          setEditNameValue(prod.name);
                          setEditCategoryValue(prod.category || 'General');
                          setEditDescValue(prod.description || '');
                          setEditImageValue(prod.image || '');
                          setEditProductLinkValue(prod.download_link || '');
                        }}
                        className="px-2 py-1 rounded-lg text-xs font-bold bg-[#6b4226] text-white hover:bg-[#53321d]"
                        title="ဈေးနှုန်းလျှော့ချပြင်ဆင်မည်"
                      >
                        ဈေးလျှော့မည်
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="bg-white rounded-2xl border border-[#e6d8c8] p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <h4 className="font-extrabold text-sm sm:text-base text-[#6b4226]">
                စောင့်ကြည့်စာရင်း အသေးစိတ် ({adminAlerts.length})
              </h4>
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Telegram ID သို့မဟုတ် Product ဖြင့် ရှာဖွေပါ..."
                  value={priceAlertSearch}
                  onChange={e => setPriceAlertSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-[#fcfaf7] outline-none"
                />
              </div>
            </div>

            {adminAlerts.filter(a => {
              if (!priceAlertSearch.trim()) return true;
              const q = priceAlertSearch.toLowerCase();
              return a.productName.toLowerCase().includes(q) || a.telegramId.toLowerCase().includes(q);
            }).length === 0 ? (
              <div className="text-center py-10 text-stone-500 text-xs">
                Price Alert စာရင်း မရှိသေးပါ။
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f7f0e8] text-[#6b4226] font-bold">
                    <tr>
                      <th className="p-3 rounded-l-xl">Product</th>
                      <th className="p-3">Telegram ID</th>
                      <th className="p-3">စတင်ဈေး</th>
                      <th className="p-3">သတ်မှတ်ချက်</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">နေ့စွဲ</th>
                      <th className="p-3 rounded-r-xl text-right">လုပ်ဆောင်ချက်</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {adminAlerts.filter(a => {
                      if (!priceAlertSearch.trim()) return true;
                      const q = priceAlertSearch.toLowerCase();
                      return a.productName.toLowerCase().includes(q) || a.telegramId.toLowerCase().includes(q);
                    }).map(alert => (
                      <tr key={alert.id} className="hover:bg-stone-50">
                        <td className="p-3 font-bold text-stone-800">{alert.productName}</td>
                        <td className="p-3 font-mono font-bold text-[#6b4226]">{alert.telegramId}</td>
                        <td className="p-3">{alert.currentPriceAtCreation.toLocaleString()} Ks</td>
                        <td className="p-3">
                          {alert.targetPrice ? `≤ ${alert.targetPrice.toLocaleString()} Ks` : 'Any drop'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            alert.status === 'active'
                              ? 'bg-amber-100 text-amber-800'
                              : alert.status === 'notified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-stone-600'
                          }`}>
                            {alert.status}
                          </span>
                        </td>
                        <td className="p-3 text-stone-500 text-[11px]">
                          {new Date(alert.createdAt).toLocaleDateString('my-MM')}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSendManualAlert(alert)}
                              className="px-2 py-1 rounded bg-[#f7f0e8] hover:bg-[#ebdccd] text-[#6b4226] font-bold text-[10px] flex items-center gap-1"
                              title="Telegram Alert တိုက်ရိုက်ပို့မည်"
                            >
                              <Send className="w-3 h-3" />
                              <span>Alert ပို့မည်</span>
                            </button>
                            <button
                              onClick={() => handleDeleteAdminAlert(alert.id)}
                              className="p-1 text-stone-400 hover:text-rose-600"
                              title="စာရင်းမှ ပယ်ဖျက်မည်"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REVIEWS TAB CONTENT */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* Reviews Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#e6d8c8] shadow-xs">
              <span className="text-xs text-stone-500 font-semibold block">စုစုပေါင်း သုံးသပ်ချက်များ</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#6b4226]">{adminReviews.length}</span>
                <span className="text-xs text-stone-500">ခု</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#e6d8c8] shadow-xs">
              <span className="text-xs text-stone-500 font-semibold block">ပျမ်းမျှ အဆင့်သတ်မှတ်ချက်</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                <span className="text-2xl font-black text-[#6b4226]">
                  {adminReviews.length > 0
                    ? (adminReviews.reduce((sum, r) => sum + r.rating, 0) / adminReviews.length).toFixed(1)
                    : '5.0'}
                </span>
                <span className="text-xs text-stone-500">/ 5.0</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#e6d8c8] shadow-xs">
              <span className="text-xs text-stone-500 font-semibold block">⭐⭐⭐⭐⭐ အဆင့် (5-Star)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-600">
                  {adminReviews.filter(r => r.rating === 5).length}
                </span>
                <span className="text-xs text-stone-500">ခု</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#e6d8c8] shadow-xs">
              <span className="text-xs text-stone-500 font-semibold block">ဝယ်ယူပြီးသူ (Verified Buyers)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-600">
                  {adminReviews.filter(r => r.verifiedPurchase).length}
                </span>
                <span className="text-xs text-stone-500">ဦး</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Header */}
          <div className="bg-white p-4 rounded-2xl border border-[#e6d8c8] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="ဝယ်ယူသူအမည်၊ Order No၊ သုံးသပ်ချက်စာ ရှာရန်..."
                value={reviewsSearch}
                onChange={e => setReviewsSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-[#d9c4b3] bg-[#fcfaf7] outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-semibold whitespace-nowrap">Product:</span>
              <select
                value={reviewProductFilter}
                onChange={e => setReviewProductFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-[#d9c4b3] bg-white outline-none font-semibold text-stone-700"
              >
                <option value="all">Product အားလုံး</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-2xl border border-[#e6d8c8] shadow-xs overflow-hidden">
            {adminReviews.length === 0 ? (
              <div className="p-12 text-center text-stone-500 text-xs">
                <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p>သုံးသပ်ချက် မရှိသေးပါ</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f7f0e8] text-stone-600 font-bold border-b border-[#ebdccd]">
                      <th className="p-3">Product</th>
                      <th className="p-3">ဝယ်ယူသူ (Customer)</th>
                      <th className="p-3">အဆင့် (Rating)</th>
                      <th className="p-3">သုံးသပ်ချက် (Comment)</th>
                      <th className="p-3">ရက်စွဲ</th>
                      <th className="p-3 text-right">လုပ်ဆောင်ချက်</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebdccd]">
                    {adminReviews
                      .filter(r => {
                        const matchesProd = reviewProductFilter === 'all' || r.productId === reviewProductFilter;
                        const q = reviewsSearch.toLowerCase();
                        const matchesQ =
                          !q ||
                          r.customerName.toLowerCase().includes(q) ||
                          r.comment.toLowerCase().includes(q) ||
                          (r.orderNo && r.orderNo.toLowerCase().includes(q));
                        return matchesProd && matchesQ;
                      })
                      .map(rev => {
                        const targetProd = products.find(p => p.id === rev.productId);
                        return (
                          <tr key={rev.id} className="hover:bg-[#fcfaf7] transition-colors">
                            <td className="p-3">
                              <div className="font-bold text-[#2b1d12] max-w-[180px] truncate" title={rev.productName || targetProd?.name}>
                                {rev.productName || targetProd?.name || 'Digital Product'}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-stone-800">{rev.customerName}</div>
                              {rev.verifiedPurchase && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  ✓ Verified Buyer
                                </span>
                              )}
                              {rev.orderNo && (
                                <div className="text-[10px] text-stone-400 font-mono">#{rev.orderNo}</div>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <div className="flex items-center text-amber-500">
                                  {[1, 2, 3, 4, 5].map(s => (
                                    <Star
                                      key={s}
                                      className={`w-3 h-3 ${
                                        s <= rev.rating ? 'fill-amber-400 text-amber-500' : 'text-stone-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="font-bold text-stone-700">{rev.rating}.0</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <p className="max-w-xs text-stone-700 whitespace-pre-line leading-relaxed">
                                {rev.comment}
                              </p>
                              {(rev.helpfulCount || 0) > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 mt-1">
                                  <ThumbsUp className="w-2.5 h-2.5" />
                                  <span>{rev.helpfulCount} helpful votes</span>
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-stone-500 whitespace-nowrap text-[11px]">
                              {new Date(rev.createdAt).toLocaleDateString('my-MM')}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteAdminReview(rev.id)}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="သုံးသပ်ချက်ကို ပယ်ဖျက်မည်"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE PRODUCT MODAL */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e6d8c8] animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-base text-[#6b4226]">
                Product အသစ် ထည့်သွင်းမည်
              </h4>
              <button
                onClick={() => setIsAddingProduct(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    အမည် (Product Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ဥပမာ - NordVPN 1 Year"
                    value={pName}
                    onChange={e => setPName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#d9c4b3] bg-[#fcfaf7] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    ဈေးနှုန်း (Ks) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="18000"
                    value={pPrice}
                    onChange={e => setPPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#d9c4b3] bg-[#fcfaf7] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category (အမျိုးအစား)
                  </label>
                  <input
                    type="text"
                    placeholder="VPN, Software, AI..."
                    value={pCategory}
                    onChange={e => setPCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#d9c4b3] bg-[#fcfaf7] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    လက်ကျန် Stock အရေအတွက် *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="5"
                    value={pStock}
                    onChange={e => setPStock(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#d9c4b3] bg-[#fcfaf7] outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    ပုံ Link (Image URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={pImage}
                    onChange={e => setPImage(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#d9c4b3] bg-[#fcfaf7] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Download Link သို့မဟုတ် Account Info (ဝယ်သူ ငွေလွှဲစစ်ပြီးမှ မြင်ရမည်)
                </label>
                <textarea
                  rows={2}
                  placeholder="Drive link, Key သို့မဟုတ် Login Credentials..."
                  value={pLink}
                  onChange={e => setPLink(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#6b4226] bg-[#fcfaf7] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  ဖော်ပြချက် (Description)
                </label>
                <textarea
                  rows={2}
                  placeholder="Product အသေးစိတ်..."
                  value={pDesc}
                  onChange={e => setPDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#d9c4b3] bg-[#fcfaf7] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-700"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6b4226] hover:bg-[#53321d] text-white"
                >
                  Product သိမ်းဆည်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LINK MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e6d8c8] animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-base text-[#6b4226]">
                Download Link ပြင်ဆင်ရန်
              </h4>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Product: <b>{editingProduct.name}</b>
            </p>

            <textarea
              rows={4}
              value={editLinkValue}
              onChange={e => setEditLinkValue(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-[#6b4226] bg-[#fcfaf7] outline-none font-mono"
              placeholder="Google Drive link, Mega link သို့မဟုတ် License Key ထည့်သွင်းပါ"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-700"
              >
                မလုပ်တော့ပါ
              </button>
              <button
                onClick={handleSaveEditLink}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6b4226] hover:bg-[#53321d] text-white"
              >
                သိမ်းဆည်းမည်
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT DETAILS & PRICE DROP MODAL */}
      {editingProductDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#e6d8c8] animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-[#6b4226]">
                    Product ဈေးနှုန်းနှင့် အချက်အလက်များ ပြင်ဆင်ရန်
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    ဈေးနှုန်းလျှော့ချပါက Telegram Price Alert အလိုအလျောက် ပေးပို့မည်
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingProductDetails(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Drop Detection Banner */}
            {(() => {
              const currentP = editingProductDetails.price;
              const inputP = parseFloat(editPriceValue);
              const subscriberCount = adminAlerts.filter(a => a.productId === editingProductDetails.id && a.status === 'active').length;
              if (!isNaN(inputP) && inputP < currentP) {
                const discount = currentP - inputP;
                const pct = Math.round((discount / currentP) * 100);
                return (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-950 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-extrabold text-amber-900">
                      <TrendingDown className="w-4 h-4 text-amber-700" />
                      <span>ဈေးနှုန်းကျဆင်းမှု တွေ့ရှိပါသည် (-{pct}% OFF)</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed">
                      ယခင်ဈေး <b>{currentP.toLocaleString()} Ks</b> မှ <b>{inputP.toLocaleString()} Ks</b> သို့ {discount.toLocaleString()} Ks လျှော့ချပါမည်။
                    </p>
                    <div className="pt-1 flex items-center gap-1.5 font-bold text-[#6b4226]">
                      <Bell className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                      <span>
                        ဤ Product ကို စောင့်ကြည့်နေသူ <b>{subscriberCount}</b> ဦးထံ Telegram သတိပေးချက် အလိုအလျောက် ပို့ပေးပါမည်!
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <form onSubmit={handleSaveProductDetails} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    အမည် (Product Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editNameValue}
                    onChange={e => setEditNameValue(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#d9c4b3] bg-[#fcfaf7] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    ဈေးနှုန်း (Ks) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editPriceValue}
                    onChange={e => setEditPriceValue(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#6b4226] bg-[#fcfaf7] outline-none font-bold text-[#6b4226]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category (အမျိုးအစား)
                  </label>
                  <input
                    type="text"
                    value={editCategoryValue}
                    onChange={e => setEditCategoryValue(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#d9c4b3] bg-[#fcfaf7] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    လက်ကျန် Stock အရေအတွက် *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editStockValue}
                    onChange={e => setEditStockValue(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#d9c4b3] bg-[#fcfaf7] outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  ပုံ Link (Image URL)
                </label>
                <input
                  type="url"
                  value={editImageValue}
                  onChange={e => setEditImageValue(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#d9c4b3] bg-[#fcfaf7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Download Link / Account Credentials
                </label>
                <textarea
                  rows={2}
                  value={editProductLinkValue}
                  onChange={e => setEditProductLinkValue(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#6b4226] bg-[#fcfaf7] outline-none font-mono"
                  placeholder="Drive link, Key သို့မဟုတ် Account Info..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  ဖော်ပြချက် (Description)
                </label>
                <textarea
                  rows={2}
                  value={editDescValue}
                  onChange={e => setEditDescValue(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#d9c4b3] bg-[#fcfaf7] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProductDetails(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  disabled={updatingProduct}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6b4226] hover:bg-[#53321d] text-white flex items-center gap-1.5 disabled:opacity-50"
                >
                  {updatingProduct ? <span>သိမ်းဆည်းနေပါသည်...</span> : <span>အပြောင်းအလဲ သိမ်းဆည်းမည်</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN SLIP VIEWER */}
      {viewingSlipUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2 flex flex-col items-center">
            <button
              onClick={() => setViewingSlipUrl(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="overflow-auto max-h-[82vh] w-full flex items-center justify-center p-2">
              <img
                src={viewingSlipUrl}
                alt="Payment Slip Full"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>
            <div className="p-2 text-center text-xs text-stone-600">
              ငွေလွှဲ Screenshot (စစ်ဆေးပြီးပါက Status ကို 'paid' ပြောင်းပေးပါ)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
