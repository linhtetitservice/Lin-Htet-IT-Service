import React, { useState } from 'react';
import { Product, Order, OrderStatus } from '../types';
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
  X
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  onAddProduct: (product: Omit<Product, 'id' | 'created_at'>, downloadLink?: string) => Promise<void>;
  onUpdateProduct: (productId: string, updates: Partial<Product>, downloadLink?: string) => Promise<void>;
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
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // New Product Modal State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pCategory, setPCategory] = useState('General');
  const [pImage, setPImage] = useState('');
  const [pLink, setPLink] = useState('');
  const [pDesc, setPDesc] = useState('');

  // Edit Link Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editLinkValue, setEditLinkValue] = useState('');

  // Slip Fullscreen Viewer
  const [viewingSlipUrl, setViewingSlipUrl] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefreshData();
    setRefreshing(false);
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
        active: true,
      },
      pLink.trim()
    );

    // Reset Form
    setPName('');
    setPPrice('');
    setPCategory('General');
    setPImage('');
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
      </div>

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
                <div className="flex items-center justify-between pt-2 border-t border-[#f2e8dc] text-xs">
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
                        <span>ဆိုင်မှ ဝှက်မည်</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category (အမျိုးအစား)
                  </label>
                  <input
                    type="text"
                    placeholder="VPN, Software, AI Tools..."
                    value={pCategory}
                    onChange={e => setPCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#d9c4b3] bg-[#fcfaf7] outline-none"
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
