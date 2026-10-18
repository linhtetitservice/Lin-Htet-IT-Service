import React, { useState, useEffect } from 'react';
import { CustomerHistoryOrder, OrderStatus } from '../types';
import { 
  X, 
  Search, 
  History, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  ShoppingBag, 
  Calendar, 
  CreditCard, 
  ChevronRight,
  Eye,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Phone
} from 'lucide-react';

interface CustomerOrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContact?: string;
  onFetchHistory: (contact: string) => Promise<CustomerHistoryOrder[]>;
  onOpenTrackOrder?: (orderNo: string, contact: string) => void;
}

export const CustomerOrderHistoryModal: React.FC<CustomerOrderHistoryModalProps> = ({
  isOpen,
  onClose,
  initialContact = '',
  onFetchHistory,
  onOpenTrackOrder,
}) => {
  const [contact, setContact] = useState(initialContact);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [orders, setOrders] = useState<CustomerHistoryOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'processing'>('all');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [previewSlip, setPreviewSlip] = useState<string | null>(null);
  const [lastSavedContact, setLastSavedContact] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('LH_LAST_CONTACT') || '';
    setLastSavedContact(saved);
    if (initialContact) {
      setContact(initialContact);
      triggerSearch(initialContact);
    } else if (saved && !contact) {
      setContact(saved);
    }
  }, [isOpen, initialContact]);

  if (!isOpen) return null;

  const triggerSearch = async (targetContact: string) => {
    if (!targetContact.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await onFetchHistory(targetContact.trim());
      setOrders(data);
      // Remember contact for future convenience
      localStorage.setItem('LH_LAST_CONTACT', targetContact.trim());
      setLastSavedContact(targetContact.trim());
    } catch (err) {
      console.error('Failed to fetch customer history:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(contact);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3" />
            ငွေလွှဲစစ်ဆေးဆဲ (New)
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            အတည်ပြုပြီး (Paid)
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle2 className="w-3 h-3" />
            ပို့ဆောင်ပြီး (Delivered)
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-300">
            <AlertTriangle className="w-3 h-3" />
            ပယ်ဖျက်ထားသည်
          </span>
        );
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'completed') {
      return order.status === 'paid' || order.status === 'delivered';
    }
    if (filterStatus === 'processing') {
      return order.status === 'new';
    }
    return true;
  });

  const totalSpent = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const completedCount = orders.filter(o => o.status === 'paid' || o.status === 'delivered').length;
  const pendingCount = orders.filter(o => o.status === 'new').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#e6d8c8] overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#f2e8dc] flex items-center justify-between bg-[#fcfaf7] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#6b4226] text-white flex items-center justify-center shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#2b1d12] flex items-center gap-2">
                ဝယ်ယူမှု မှတ်တမ်း (Purchase History)
              </h3>
              <p className="text-xs text-[#735c49]">
                မိမိ၏ ဖုန်းနံပါတ် သို့မဟုတ် Telegram ဖြင့် အော်ဒါမှတ်တမ်းများနှင့် ဒေါင်းလုဒ်လင့်ခ်များကို ပြန်လည်ရယူပါ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            title="ပိတ်မည်"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar / Input Area */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-[#fcfaf7] to-white border-b border-[#ebdccd] shrink-0 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-[#8d7159]" />
              <input
                type="text"
                required
                placeholder="ဖုန်းနံပါတ် (09XXXXXXXXX) သို့မဟုတ် Telegram (@username)"
                value={contact}
                onChange={e => setContact(e.target.value)}
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-[#d9c4b3] bg-white text-stone-800 placeholder-[#9c8471] focus:border-[#6b4226] focus:ring-1 focus:ring-[#6b4226] outline-none shadow-2xs font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#6b4226] hover:bg-[#53321d] text-white shadow-xs transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ရှာနေသည်...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>မှတ်တမ်းရှာမည်</span>
                </>
              )}
            </button>
          </form>

          {/* Quick chips if last saved contact exists */}
          {lastSavedContact && (
            <div className="flex items-center gap-2 flex-wrap text-xs text-[#735c49]">
              <span className="text-[11px] font-medium text-stone-500">အမြန်ရွေးချယ်ရန်:</span>
              <button
                type="button"
                onClick={() => {
                  setContact(lastSavedContact);
                  triggerSearch(lastSavedContact);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f7f0e8] hover:bg-[#ebdccd] text-[#6b4226] font-semibold text-[11px] transition-colors border border-[#e6d8c8]"
              >
                📱 {lastSavedContact} (နောက်ဆုံးသုံးခဲ့သော နံပါတ်)
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {loading && (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#6b4226] animate-spin mx-auto" />
              <p className="text-xs sm:text-sm font-medium text-stone-600">
                ဝယ်ယူမှုမှတ်တမ်း ရှာဖွေနေပါသည်...
              </p>
            </div>
          )}

          {!loading && !searched && (
            /* Intro / Call to action */
            <div className="space-y-4 py-4">
              <div className="p-5 rounded-2xl bg-[#fcfaf7] border border-[#ebdccd] space-y-3 text-center sm:text-left sm:flex sm:items-center sm:gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f7f0e8] text-[#6b4226] flex items-center justify-center shrink-0 mx-auto sm:mx-0 shadow-inner">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#2b1d12]">
                    ဝယ်ယူခဲ့သော ဒစ်ဂျစ်တယ် ပစ္စည်းအားလုံးကို တစ်နေရာတည်းတွင် ကြည့်ပါ
                  </h4>
                  <p className="text-xs text-[#5c4738] leading-relaxed">
                    လူကြီးမင်း ယခင်က မှာယူခဲ့သော Software Key များ၊ VPN အကောင့်များနှင့် ဒေါင်းလုဒ်လင့်ခ်များကို အချိန်မရွေး ပြန်လည်ရယူနိုင်ပါသည်။
                  </p>
                </div>
              </div>

              {/* Sample demo buttons for instant test */}
              <div className="p-4 rounded-xl border border-dashed border-[#d9c4b3] bg-white text-xs space-y-2">
                <span className="font-semibold text-stone-600 block">
                  💡 စမ်းသပ်ကြည့်ရှုရန် နမူနာဖုန်းနံပါတ်များ:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setContact('09798112233');
                      triggerSearch('09798112233');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#f7f0e8] hover:bg-[#ebdccd] text-[#6b4226] font-mono font-medium border border-[#e6d8c8]"
                  >
                    09798112233 (NordVPN - Paid)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setContact('09450098765');
                      triggerSearch('09450098765');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#f7f0e8] hover:bg-[#ebdccd] text-[#6b4226] font-mono font-medium border border-[#e6d8c8]"
                  >
                    09450098765 (Canva Pro - New)
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && searched && orders.length === 0 && (
            /* No Orders Found State */
            <div className="py-12 text-center bg-white rounded-2xl border border-[#e6d8c8] p-6 space-y-3">
              <ShoppingBag className="w-12 h-12 text-[#d9c4b3] mx-auto" />
              <h4 className="font-bold text-base text-stone-800">
                အော်ဒါမှတ်တမ်း ရှာမတွေ့ပါ
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                ထည့်သွင်းထားသော ဖုန်းနံပါတ် (<b>{contact}</b>) ဖြင့် မှာယူထားသော အော်ဒါမှတ်တမ်း မရှိသေးပါ။ နံပါတ် မှန်ကန်မှု ရှိမရှိ သို့မဟုတ် Telegram username ဖြစ်ပါက @ ထည့်၍ ပြန်လည် စမ်းသပ်ပါ။
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6b4226] text-white hover:bg-[#53321d] transition-colors"
                >
                  ဆိုင်ရှေ့သို့ ပြန်သွားပြီး ပစ္စည်းဝယ်ယူမည်
                </button>
              </div>
            </div>
          )}

          {!loading && searched && orders.length > 0 && (
            /* Results with summary cards & order list */
            <div className="space-y-4">
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-[#fcfaf7] p-3 rounded-xl border border-[#ebdccd]">
                  <span className="text-[11px] text-stone-500 block">အော်ဒါ စုစုပေါင်း</span>
                  <span className="text-base sm:text-lg font-black text-[#6b4226]">
                    {orders.length} <span className="text-xs font-normal text-stone-600">ခု</span>
                  </span>
                </div>

                <div className="bg-[#fcfaf7] p-3 rounded-xl border border-[#ebdccd]">
                  <span className="text-[11px] text-stone-500 block">စုစုပေါင်း သုံးစွဲမှု</span>
                  <span className="text-base sm:text-lg font-black text-[#6b4226]">
                    {totalSpent.toLocaleString()} <span className="text-xs font-normal text-stone-600">Ks</span>
                  </span>
                </div>

                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                  <span className="text-[11px] text-emerald-800 block">ရရှိပြီးသော အော်ဒါ</span>
                  <span className="text-base sm:text-lg font-black text-emerald-700">
                    {completedCount} <span className="text-xs font-normal text-emerald-800">ခု</span>
                  </span>
                </div>

                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                  <span className="text-[11px] text-amber-800 block">စစ်ဆေးဆဲ အော်ဒါ</span>
                  <span className="text-base sm:text-lg font-black text-amber-700">
                    {pendingCount} <span className="text-xs font-normal text-amber-800">ခု</span>
                  </span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center justify-between border-b border-[#f2e8dc] pb-2 pt-1 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                      filterStatus === 'all'
                        ? 'bg-[#6b4226] text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    အားလုံး ({orders.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('completed')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                      filterStatus === 'completed'
                        ? 'bg-[#6b4226] text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    ရရှိပြီး ({completedCount})
                  </button>
                  <button
                    onClick={() => setFilterStatus('processing')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                      filterStatus === 'processing'
                        ? 'bg-[#6b4226] text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    စစ်ဆေးဆဲ ({pendingCount})
                  </button>
                </div>

                <span className="text-[11px] text-stone-500">
                  {filteredOrders.length} ခု ပြသထားသည်
                </span>
              </div>

              {/* Order Cards */}
              <div className="space-y-3.5">
                {filteredOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-[#ebdccd] bg-white hover:border-[#6b4226]/40 transition-all shadow-2xs space-y-3"
                  >
                    {/* Top Row: Order No, Date, Status */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-[#f2e8dc]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#6b4226]">
                          #{order.no}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(order.no)}
                          className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors"
                          title="အော်ဒါနံပါတ် ကူးယူမည်"
                        >
                          {copiedText === order.no ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-stone-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.created_at).toLocaleDateString('my-MM')}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Customer & Price Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-600 gap-1.5">
                      <div>
                        ဝယ်သူ: <b className="text-stone-800">{order.customer_name}</b> ({order.contact})
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-stone-900">
                          {order.total.toLocaleString()} Ks
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#f7f0e8] text-[#6b4226] text-[11px] font-semibold">
                          {order.pay_method}
                        </span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="p-2.5 rounded-lg bg-[#fcfaf7] border border-[#ebdccd]/60 text-xs space-y-1">
                      <span className="font-semibold text-stone-700 block text-[11px]">
                        မှာယူခဲ့သော ပစ္စည်းများ:
                      </span>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-stone-600">
                          <span>• {item.name} <span className="text-stone-400">x{item.qty}</span></span>
                          <span className="font-medium text-stone-800">
                            {(item.price * item.qty).toLocaleString()} Ks
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Unlocked Links if paid or delivered */}
                    {order.unlockedLinks && order.unlockedLinks.length > 0 ? (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                          <Download className="w-3.5 h-3.5 text-emerald-700" />
                          <span>ဒေါင်းလုဒ်လင့်ခ် & လိုင်စင်ကုတ်များ (Unlocked):</span>
                        </div>

                        <div className="space-y-2">
                          {order.unlockedLinks.map((link, idx) => {
                            const isUrl = link.url.startsWith('http');
                            return (
                              <div
                                key={idx}
                                className="p-2.5 bg-white rounded-lg border border-emerald-300 space-y-1.5 shadow-2xs"
                              >
                                <div className="font-bold text-[11px] text-stone-800">
                                  📦 {link.name}
                                </div>
                                <div className="bg-[#fcfaf7] p-2 rounded text-xs font-mono text-stone-800 break-all select-all border border-stone-200 whitespace-pre-wrap max-h-24 overflow-y-auto">
                                  {link.url}
                                </div>
                                <div className="flex items-center gap-2 pt-0.5">
                                  {isUrl && (
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-1 py-1 px-2.5 rounded text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-1"
                                    >
                                      <span>လင့်ခ်ဖွင့်ရန်</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(link.url)}
                                    className="py-1 px-2.5 rounded text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center gap-1 border border-stone-300"
                                  >
                                    {copiedText === link.url ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-emerald-700">ကူးယူပြီး</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy ကူးမည်</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : order.status === 'new' ? (
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          ငွေလွှဲပြေစာ စစ်ဆေးဆဲ ဖြစ်ပါသည်။ Admin အတည်ပြုပြီးပါက Download link ဤနေရာတွင် ပေါ်လာပါမည်။
                        </span>
                      </div>
                    ) : null}

                    {/* Bottom Actions Row */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      {order.slip ? (
                        <button
                          type="button"
                          onClick={() => setPreviewSlip(order.slip || null)}
                          className="inline-flex items-center gap-1 text-[11px] text-[#6b4226] hover:underline font-medium"
                        >
                          <Eye className="w-3 h-3" />
                          <span>ငွေလွှဲပြေစာ (Slip) ကြည့်မည်</span>
                        </button>
                      ) : <span />}

                      {onOpenTrackOrder && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenTrackOrder(order.no, order.contact);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6b4226] hover:text-[#53321d] hover:underline"
                        >
                          <span>အော်ဒါအသေးစိတ် စစ်ဆေးရန်</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#f2e8dc] bg-[#fcfaf7] flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>Lin Htet IT Service • Digital Product Orders</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-stone-200 hover:bg-stone-300 text-stone-700 transition-colors"
          >
            ပိတ်မည်
          </button>
        </div>
      </div>

      {/* Slip Preview Modal */}
      {previewSlip && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewSlip(null)}
        >
          <div className="bg-white p-3 rounded-2xl max-w-sm w-full space-y-2 relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-stone-800">ငွေလွှဲပြေစာ (Payment Slip)</h4>
              <button onClick={() => setPreviewSlip(null)} className="p-1 text-stone-500 hover:text-stone-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <img src={previewSlip} alt="Payment Slip" className="w-full max-h-[70vh] object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
};
