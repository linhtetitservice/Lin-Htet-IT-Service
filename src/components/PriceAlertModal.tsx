import React, { useState, useEffect } from 'react';
import { Product, PriceAlert } from '../types';
import { storeService } from '../services/storeService';
import { 
  X, 
  Bell, 
  BellRing, 
  TrendingDown, 
  Send, 
  Check, 
  CheckCircle2, 
  Trash2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAlertCreated?: (alert: PriceAlert) => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  product,
  onAlertCreated,
}) => {
  const [telegramId, setTelegramId] = useState('');
  const [targetMode, setTargetMode] = useState<'any' | 'specific'>('any');
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState<PriceAlert | null>(null);
  const [existingAlerts, setExistingAlerts] = useState<PriceAlert[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'list'>('new');

  // Load saved Telegram ID and existing alerts when modal opens
  useEffect(() => {
    if (isOpen) {
      const saved = storeService.getSavedTelegramId();
      if (saved) {
        setTelegramId(saved);
      }
      setTargetMode('any');
      setTargetPrice('');
      setError(null);
      setTestResult(null);
      setSuccessAlert(null);
      setActiveTab('new');

      loadExistingAlerts(saved);
    }
  }, [isOpen, product]);

  const loadExistingAlerts = async (savedId?: string) => {
    try {
      const idToSearch = savedId || telegramId || undefined;
      const alerts = await storeService.getPriceAlerts(product?.id, idToSearch);
      setExistingAlerts(alerts);
    } catch {
      // ignore
    }
  };

  if (!isOpen || !product) return null;

  const currentPrice = product.price;

  const handlePresetPercentage = (percent: number) => {
    const discounted = Math.round(currentPrice * (1 - percent / 100));
    setTargetPrice(discounted.toString());
    setTargetMode('specific');
  };

  const handleTestAlert = async () => {
    if (!telegramId.trim()) {
      setError('စမ်းသပ်ရန် Telegram Username သို့မဟုတ် ID ထည့်သွင်းပေးပါ');
      return;
    }
    setError(null);
    setTesting(true);
    setTestResult(null);

    const res = await storeService.sendTestPriceAlert(product, telegramId.trim());
    setTestResult(res);
    setTesting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = telegramId.trim();
    if (!cleanId) {
      setError('Telegram ID သို့မဟုတ် Username (@username) ထည့်သွင်းပေးပါ');
      return;
    }

    let parsedTargetPrice: number | undefined = undefined;
    if (targetMode === 'specific') {
      const val = parseFloat(targetPrice);
      if (isNaN(val) || val <= 0) {
        setError('သတ်မှတ်ဈေးနှုန်း မှန်ကန်စွာ ထည့်သွင်းပေးပါ');
        return;
      }
      if (val >= currentPrice) {
        setError(`သတ်မှတ်ဈေးနှုန်းသည် လက်ရှိဈေး (${currentPrice.toLocaleString()} Ks) ထက် နည်းရပါမည်`);
        return;
      }
      parsedTargetPrice = val;
    }

    setError(null);
    setLoading(true);

    try {
      const newAlert = await storeService.createPriceAlert({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        telegramId: cleanId,
        currentPriceAtCreation: currentPrice,
        targetPrice: parsedTargetPrice,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setSuccessAlert(newAlert);
      onAlertCreated?.(newAlert);
      await loadExistingAlerts(cleanId);
    } catch (err: any) {
      setError(err?.message || 'Price Alert သတ်မှတ်ရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAlert = async (alertId: string) => {
    await storeService.cancelPriceAlert(alertId);
    await loadExistingAlerts();
  };

  const handleDeleteAlert = async (alertId: string) => {
    await storeService.deletePriceAlert(alertId);
    await loadExistingAlerts();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-[#e6d8c8] shadow-2xl max-w-lg w-full overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#6b4226] to-[#53321d] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md flex items-center justify-center text-yellow-300 shadow-inner shrink-0">
              <BellRing className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-white">
                  Price Drop Alert
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30">
                  Telegram Bot
                </span>
              </div>
              <p className="text-xs text-[#ebdccd] mt-0.5 leading-relaxed">
                ဈေးနှုန်း ကျဆင်းသွားပါက သင့် Telegram သို့ အလိုအလျောက် သတိပေးမည်
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          {existingAlerts.length > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
              <button
                onClick={() => {
                  setActiveTab('new');
                  setSuccessAlert(null);
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeTab === 'new'
                    ? 'bg-white text-[#6b4226] shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                + Alert အသစ် သတ်မှတ်မည်
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'list'
                    ? 'bg-white text-[#6b4226] shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>စောင့်ကြည့်နေသော စာရင်း ({existingAlerts.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Product Summary Box */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#fcfaf7] border border-[#ecdcd0]">
            <div className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200 shadow-inner">
              <img
                src={product.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ebdccd] text-[#6b4226]">
                  {product.category || 'Digital Product'}
                </span>
                {product.stock !== undefined && product.stock < 5 && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    Low Stock: {product.stock}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm text-[#2b1d12] truncate mt-1">
                {product.name}
              </h4>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xs text-stone-500">လက်ရှိဈေး:</span>
                <span className="text-base font-extrabold text-[#6b4226]">
                  {currentPrice.toLocaleString()} Ks
                </span>
              </div>
            </div>
          </div>

          {activeTab === 'list' ? (
            /* Existing Alerts List Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-xs text-stone-700 uppercase tracking-wide">
                  သင့် Price Alert စာရင်း
                </h5>
                <span className="text-xs text-stone-500">
                  စုစုပေါင်း: {existingAlerts.length} ခု
                </span>
              </div>

              {existingAlerts.length === 0 ? (
                <div className="text-center py-8 text-stone-500 text-xs">
                  စောင့်ကြည့်ထားသော Price Alert မရှိသေးပါ။
                </div>
              ) : (
                existingAlerts.map(alert => {
                  const isActive = alert.status === 'active';
                  const isNotified = alert.status === 'notified';
                  return (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isActive
                          ? 'bg-amber-50/50 border-amber-200'
                          : isNotified
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-stone-50 border-stone-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-[#2b1d12]">
                              {alert.productName}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isActive
                                  ? 'bg-amber-100 text-amber-800'
                                  : isNotified
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {isActive ? '● စောင့်ကြည့်ဆဲ' : isNotified ? '✓ အကြောင်းကြားပြီး' : 'ပယ်ဖျက်ပြီး'}
                            </span>
                          </div>

                          <div className="text-xs text-stone-600 flex items-center gap-2 flex-wrap">
                            <span>Telegram: <b className="font-mono text-[#6b4226]">{alert.telegramId}</b></span>
                            <span>•</span>
                            <span>စတင်ဈေး: <b>{alert.currentPriceAtCreation.toLocaleString()} Ks</b></span>
                            {alert.targetPrice && (
                              <>
                                <span>•</span>
                                <span className="text-rose-700 font-semibold">
                                  သတ်မှတ်ဈေး: ≤ {alert.targetPrice.toLocaleString()} Ks
                                </span>
                              </>
                            )}
                          </div>

                          {isNotified && alert.triggeredPrice && (
                            <div className="text-[11px] font-bold text-emerald-700 pt-1 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>
                                {alert.triggeredPrice.toLocaleString()} Ks သို့ ဈေးကျဆင်း၍ Telegram သို့ အကြောင်းကြားပြီးပါပြီ
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {isActive && (
                            <button
                              onClick={() => handleCancelAlert(alert.id)}
                              className="text-stone-400 hover:text-amber-700 p-1 rounded text-xs font-semibold"
                              title="သတိပေးချက် ရပ်တန့်မည်"
                            >
                              ရပ်မည်
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors"
                            title="ဖျက်မည်"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              <button
                onClick={() => {
                  setActiveTab('new');
                  setSuccessAlert(null);
                }}
                className="w-full py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold transition-colors mt-2"
              >
                + Product အသစ်အတွက် Alert ထည့်မည်
              </button>
            </div>
          ) : successAlert ? (
            /* Success State */
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>

              <div>
                <h4 className="font-extrabold text-base text-emerald-950">
                  Price Alert သတ်မှတ်ခြင်း အောင်မြင်ပါသည်!
                </h4>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  <b>"{product.name}"</b> ၏ ဈေးနှုန်း ကျဆင်းသွားပါက သင့် Telegram ID (<b>{successAlert.telegramId}</b>) သို့ အလိုအလျောက် သတိပေးချက် ပို့ပေးပါမည်။
                </p>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-left text-xs space-y-1 text-emerald-900">
                <div className="flex justify-between">
                  <span className="text-stone-500">လက်ရှိဈေး:</span>
                  <span className="font-bold">{currentPrice.toLocaleString()} Ks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">သတိပေးမည့် အခြေအနေ:</span>
                  <span className="font-bold text-[#6b4226]">
                    {successAlert.targetPrice
                      ? `≤ ${successAlert.targetPrice.toLocaleString()} Ks သို့ ကျဆင်းပါက`
                      : 'ဈေးနှုန်း မည်မျှပင် ကျဆင်းပါက'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Telegram:</span>
                  <span className="font-mono font-bold">{successAlert.telegramId}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setActiveTab('list')}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 transition-colors"
                >
                  စာရင်းကြည့်မည်
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-[#6b4226] hover:bg-[#53321d] text-white transition-colors"
                >
                  ပြီးပါပြီ
                </button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Telegram ID Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  Telegram Username သို့မဟုတ် ID <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={telegramId}
                    onChange={(e) => setTelegramId(e.target.value)}
                    placeholder="ဥပမာ - @linhtet_user သို့မဟုတ် 12345678"
                    className="w-full pl-3.5 pr-24 py-2.5 rounded-xl border border-[#d9c4b3] bg-[#fcfaf7] focus:bg-white text-xs sm:text-sm font-medium text-stone-900 outline-none focus:border-[#6b4226] focus:ring-1 focus:ring-[#6b4226] transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleTestAlert}
                    disabled={testing || !telegramId.trim()}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 rounded-lg text-[11px] font-bold bg-stone-200 hover:bg-[#6b4226] hover:text-white text-stone-700 transition-all disabled:opacity-40 flex items-center gap-1"
                    title="Telegram သို့ စမ်းသပ်သတိပေးချက် ပို့ကြည့်ရန်"
                  >
                    <Send className="w-3 h-3" />
                    <span>{testing ? 'ပို့နေ...' : 'Test Bot'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  သတိပေးချက်များကို Telegram Bot မှတစ်ဆင့် အလိုအလျောက် ပေးပို့ပေးပါမည်။
                </p>
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border border-amber-200 text-amber-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-snug">{testResult.message}</span>
                </div>
              )}

              {/* Target Price Strategy */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-stone-800">
                  သတိပေးမည့် အခြေအနေ (Condition)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetMode('any');
                      setTargetPrice('');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      targetMode === 'any'
                        ? 'border-[#6b4226] bg-[#f7f0e8] text-[#6b4226] ring-1 ring-[#6b4226]'
                        : 'border-[#ecdcd0] bg-white text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">မည်သည့် ဈေးကျဆင်းမှုမဆို</span>
                      <TrendingDown className="w-3.5 h-3.5 text-[#6b4226]" />
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-1">
                      (အကြံပြုထားသည်) ဈေး ၁ ကျပ်ကျရုံဖြင့် သတိပေးမည်
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetMode('specific');
                      if (!targetPrice) {
                        setTargetPrice(Math.round(currentPrice * 0.9).toString());
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      targetMode === 'specific'
                        ? 'border-[#6b4226] bg-[#f7f0e8] text-[#6b4226] ring-1 ring-[#6b4226]'
                        : 'border-[#ecdcd0] bg-white text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">သတ်မှတ်ဈေးနှုန်းသို့ ကျမှသာ</span>
                      <Sparkles className="w-3.5 h-3.5 text-[#6b4226]" />
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-1">
                      မိမိလိုချင်သော ဈေးနှုန်းသတ်မှတ်နိုင်သည်
                    </span>
                  </button>
                </div>

                {/* Specific Target Price Input and Quick Chips */}
                {targetMode === 'specific' && (
                  <div className="p-3.5 rounded-2xl bg-[#fcfaf7] border border-[#ebdccd] space-y-2.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-700">
                        လိုချင်သော ဈေးနှုန်း (Ks):
                      </span>
                      {/* Discount Chips */}
                      <div className="flex items-center gap-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => handlePresetPercentage(10)}
                          className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 border border-stone-200 text-stone-700 font-bold"
                        >
                          -10%
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePresetPercentage(20)}
                          className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 border border-stone-200 text-stone-700 font-bold"
                        >
                          -20%
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePresetPercentage(30)}
                          className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 border border-stone-200 text-stone-700 font-bold"
                        >
                          -30%
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max={currentPrice - 1}
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        placeholder="ဥပမာ - 15000"
                        className="w-full px-3 py-2 rounded-xl border border-[#d9c4b3] bg-white text-xs sm:text-sm font-bold text-[#6b4226] outline-none"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-stone-400 font-bold">
                        Ks ထက် နည်းပါက
                      </span>
                    </div>

                    {targetPrice && parseFloat(targetPrice) < currentPrice && (
                      <p className="text-[11px] text-emerald-700 font-medium">
                        လက်ရှိဈေးထက် {(currentPrice - parseFloat(targetPrice)).toLocaleString()} Ks သက်သာမှ သတိပေးမည်
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold bg-[#6b4226] hover:bg-[#53321d] text-white shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    <span>Price Alert သတ်မှတ်မည်</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#fcfaf7] border-t border-[#ebdccd] px-5 py-3 text-center flex items-center justify-between text-xs text-stone-500">
          <span>Lin Htet IT Service Bot Notifications</span>
          <button
            onClick={onClose}
            className="text-stone-600 hover:text-stone-900 font-semibold"
          >
            ပိတ်မည်
          </button>
        </div>
      </div>
    </div>
  );
};
