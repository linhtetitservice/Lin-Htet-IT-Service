import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { X, Search, CheckCircle2, Clock, AlertTriangle, Download, Copy, Check, ExternalLink, History } from 'lucide-react';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNo?: string;
  initialContact?: string;
  onOpenHistory?: (contact?: string) => void;
  onTrack: (no: string, contact: string) => Promise<{
    found: boolean;
    order?: Order;
    links?: { name: string; url: string }[];
  }>;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  initialOrderNo = '',
  initialContact = '',
  onOpenHistory,
  onTrack,
}) => {
  const [orderNo, setOrderNo] = useState(initialOrderNo);
  const [contact, setContact] = useState(initialContact);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<{
    found: boolean;
    order?: Order;
    links?: { name: string; url: string }[];
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNo.trim() || !contact.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await onTrack(orderNo.trim(), contact.trim());
      setResult(res);
    } catch (e) {
      console.error(e);
      setResult({ found: false });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(text);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            ငွေလွှဲစစ်ဆေးဆဲ (New)
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ငွေလက်ခံရရှိပြီး (Paid)
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ပို့ဆောင်ပြီး (Delivered)
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            ပယ်ဖျက်ထားသည် (Cancelled)
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#e6d8c8] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#f2e8dc] flex items-center justify-between bg-[#fcfaf7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f7f0e8] flex items-center justify-center text-[#6b4226]">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#2b1d12]">အော်ဒါစစ်ဆေးရန် (Track Order)</h3>
              <p className="text-[11px] text-[#735c49]">အော်ဒါနံပါတ်နှင့် ဖုန်းနံပါတ်ဖြင့် စစ်ဆေးပါ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <form onSubmit={handleSearch} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                အော်ဒါနံပါတ် (Order No)
              </label>
              <input
                type="text"
                required
                placeholder="ဥပမာ - LH12345678"
                value={orderNo}
                onChange={e => setOrderNo(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-[#d9c4b3] focus:border-[#6b4226] focus:ring-1 focus:ring-[#6b4226] outline-none bg-[#fcfaf7] uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                အော်ဒါတင်ခဲ့သော ဖုန်း သို့မဟုတ် Telegram
              </label>
              <input
                type="text"
                required
                placeholder="09XXXXXXXXX သို့ @username"
                value={contact}
                onChange={e => setContact(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-[#d9c4b3] focus:border-[#6b4226] focus:ring-1 focus:ring-[#6b4226] outline-none bg-[#fcfaf7]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#6b4226] hover:bg-[#53321d] text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'စစ်ဆေးနေပါသည်...' : 'အော်ဒါစစ်မည်'}</span>
            </button>
          </form>

          {/* Quick jump to purchase history */}
          {onOpenHistory && (
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHistory(contact);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-[#6b4226] hover:text-[#53321d] font-semibold hover:underline"
              >
                <History className="w-3.5 h-3.5" />
                <span>ဖုန်းနံပါတ်ဖြင့် ဝယ်ယူမှုမှတ်တမ်းအားလုံး ကြည့်ရှုမည် 👉</span>
              </button>
            </div>
          )}

          {/* Results Area */}
          {searched && (
            <div className="pt-2 border-t border-[#f2e8dc]">
              {result && result.found && result.order ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#fcfaf7] border border-[#ebdccd] space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-mono font-bold text-sm text-[#6b4226]">
                        {result.order.no}
                      </span>
                      {getStatusBadge(result.order.status)}
                    </div>

                    <div className="text-xs text-[#5c4738] space-y-1">
                      <p>👤 ဝယ်သူ: <b>{result.order.customer_name}</b></p>
                      <p>📞 ဆက်သွယ်ရန်: <b>{result.order.contact}</b></p>
                      <p>💰 စုစုပေါင်း: <b>{result.order.total.toLocaleString()} Ks</b> ({result.order.pay_method})</p>
                      <p className="text-[11px] text-stone-500">
                        🕒 ရက်စွဲ: {new Date(result.order.created_at).toLocaleString('my-MM')}
                      </p>
                    </div>

                    {/* Order Items */}
                    <div className="mt-2 pt-2 border-t border-[#ebdccd] text-xs">
                      <span className="font-semibold text-stone-700 block mb-1">မှာယူထားသော ပစ္စည်းများ:</span>
                      <ul className="space-y-1 text-stone-600">
                        {result.order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span>• {item.name} x{item.qty}</span>
                            <span className="font-semibold">{(item.price * item.qty).toLocaleString()} Ks</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* UNLOCKED DOWNLOAD LINKS */}
                  {result.links && result.links.length > 0 ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2.5">
                      <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm">
                        <Download className="w-4 h-4 text-emerald-700" />
                        <span>ဒေါင်းလုဒ်လင့်ခ် & အကောင့် အချက်အလက်များ:</span>
                      </div>
                      <p className="text-xs text-emerald-800">
                        ငွေလွှဲပြေစာ အတည်ပြုပြီးဖြစ်သဖြင့် အောက်ပါလင့်ခ်များမှတစ်ဆင့် ရယူနိုင်ပါပြီ။
                      </p>

                      <div className="space-y-2 mt-2">
                        {result.links.map((link, idx) => {
                          const isUrl = link.url.startsWith('http');
                          return (
                            <div
                              key={idx}
                              className="p-3 bg-white rounded-lg border border-emerald-300 shadow-2xs space-y-2"
                            >
                              <div className="font-bold text-xs text-stone-800">
                                📦 {link.name}
                              </div>
                              <div className="bg-[#fcfaf7] p-2 rounded text-xs font-mono text-stone-800 break-all select-all border border-stone-200 whitespace-pre-wrap max-h-32 overflow-y-auto">
                                {link.url}
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                {isUrl && (
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-1.5 px-3 rounded text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-1"
                                  >
                                    <span>လင့်ခ်ဖွင့်ရန်</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleCopy(link.url)}
                                  className="py-1.5 px-3 rounded text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center gap-1 border border-stone-300"
                                >
                                  {copiedLink === link.url ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="text-emerald-700">Copied!</span>
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
                  ) : (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        Download link မပေါ်သေးပါ
                      </p>
                      <p className="leading-relaxed">
                        ငွေလွှဲပြေစာကို Admin မှ စစ်ဆေးဆဲ ဖြစ်ပါသည်။ စစ်ဆေးပြီးပါက Status သည် <b>paid</b> ပြောင်းသွားပြီး ဤနေရာတွင် Download link အလိုအလျောက် ပေါ်လာပါမည်။
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-center text-xs space-y-1">
                  <p className="font-bold">ရှာမတွေ့ပါ</p>
                  <p>အော်ဒါနံပါတ် သို့မဟုတ် ဖုန်းနံပါတ် မှန်ကန်မှု ရှိမရှိ ပြန်လည်စစ်ဆေးပေးပါ</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
