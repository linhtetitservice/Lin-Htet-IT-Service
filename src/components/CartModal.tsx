import React, { useState } from 'react';
import { Product, PaymentAccounts } from '../types';
import { X, Trash2, Plus, Minus, Upload, Copy, Check, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CartItem {
  product: Product;
  qty: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Record<string, number>;
  products: Product[];
  paymentAccounts: PaymentAccounts;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onSubmitOrder: (data: {
    customerName: string;
    contact: string;
    note: string;
    payMethod: string;
    slipDataUrl: string;
    items: { id: string; name: string; price: number; qty: number }[];
  }) => Promise<{ ok: boolean; no: string; error?: string }>;
  onOpenTrackWithNo?: (orderNo: string, contact: string) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cart,
  products,
  paymentAccounts,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onSubmitOrder,
  onOpenTrackWithNo,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [selectedPay, setSelectedPay] = useState<keyof PaymentAccounts>('KPay');
  const [slipDataUrl, setSlipDataUrl] = useState<string>('');
  const [slipFileName, setSlipFileName] = useState<string>('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrder, setCompletedOrder] = useState<{ no: string; contact: string } | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedOrderNo, setCopiedOrderNo] = useState(false);

  if (!isOpen) return null;

  const cartEntries = Object.entries(cart).filter(([_, qty]) => qty > 0);
  const cartItems: CartItem[] = cartEntries
    .map(([id, qty]) => {
      const product = products.find(p => p.id === id);
      return product ? { product, qty } : null;
    })
    .filter(Boolean) as CartItem[];

  const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const rawAccount = paymentAccounts[selectedPay];
  const activeAccount = (rawAccount && rawAccount.number && rawAccount.number !== '09-777123456') ? rawAccount : {
    name: 'Lin Htet (လင်းထက်)',
    number: '09970340032'
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(activeAccount.number);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCopyOrderNo = (no: string) => {
    navigator.clipboard.writeText(no);
    setCopiedOrderNo(true);
    setTimeout(() => setCopiedOrderNo(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('ပုံအရွယ်အစား 8MB ထက်မကျော်ရပါ');
      return;
    }

    setSlipFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSlipDataUrl(reader.result);
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('ကျေးဇူးပြု၍ ဝယ်ယူသူအမည် ထည့်သွင်းပေးပါ');
      return;
    }
    if (!contact.trim()) {
      setErrorMsg('ကျေးဇူးပြု၍ ဖုန်းနံပါတ် သို့မဟုတ် Telegram username ထည့်သွင်းပေးပါ');
      return;
    }
    if (!slipDataUrl) {
      setErrorMsg('ကျေးဇူးပြု၍ ငွေလွှဲပြေစာ (Slip) ဓာတ်ပုံ ထည့်သွင်းပေးပါ');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const itemsPayload = cartItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        qty: item.qty
      }));

      const res = await onSubmitOrder({
        customerName: customerName.trim(),
        contact: contact.trim(),
        note: note.trim(),
        payMethod: selectedPay,
        slipDataUrl,
        items: itemsPayload
      });

      if (res.ok) {
        localStorage.setItem('LH_LAST_CONTACT', contact.trim());
        onClearCart();
        setCompletedOrder({ no: res.no, contact: contact.trim() });
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setErrorMsg(res.error || 'အော်ဒါတင်မရပါ၊ ခေတ္တစောင့်ပြီး ထပ်မံကြိုးစားပါ');
      }
    } catch (err: any) {
      setErrorMsg('Error: ' + (err.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setCompletedOrder(null);
    setSlipDataUrl('');
    setSlipFileName('');
    setNote('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#e6d8c8] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#f2e8dc] flex items-center justify-between bg-[#fcfaf7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f7f0e8] flex items-center justify-center text-[#6b4226]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#2b1d12]">
                {completedOrder ? 'အော်ဒါအောင်မြင်ပါသည်' : 'ခြင်းတောင်း & အော်ဒါတင်ရန်'}
              </h3>
              {!completedOrder && (
                <p className="text-[11px] text-[#735c49]">ပစ္စည်းများကို စစ်ဆေးပြီး အော်ဒါတင်ပါ</p>
              )}
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {completedOrder ? (
            /* SUCCESS STATE */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner">
                ✓
              </div>
              <div>
                <h4 className="text-xl font-bold text-[#2b1d12]">အော်ဒါတင်ခြင်း အောင်မြင်ပါသည်!</h4>
                <p className="text-xs sm:text-sm text-[#5c4738] mt-1 max-w-sm mx-auto">
                  လူကြီးမင်း၏ အော်ဒါကို လက်ခံရရှိထားပြီး ငွေလွှဲပြေစာ စစ်ဆေးပြီးပါက Download link ကို ဖွင့်ပေးပါမည်။
                </p>
              </div>

              {/* Order Number Box */}
              <div className="bg-[#f7f0e8] border border-[#d9c4b3] rounded-xl p-4 max-w-xs mx-auto">
                <span className="text-xs text-[#735c49] font-medium block">အော်ဒါနံပါတ် (မှတ်ထားပေးပါ)</span>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-xl font-mono font-extrabold text-[#6b4226] tracking-wider">
                    {completedOrder.no}
                  </span>
                  <button
                    onClick={() => handleCopyOrderNo(completedOrder.no)}
                    className="p-1.5 rounded bg-white hover:bg-stone-50 border border-[#d9c4b3] text-[#6b4226] text-xs flex items-center gap-1"
                    title="Copy Order No"
                  >
                    {copiedOrderNo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs text-left leading-relaxed">
                💡 <b>အော်ဒါစစ်ဆေးရန်:</b> အထက်ပါ အော်ဒါနံပါတ် <b>{completedOrder.no}</b> နှင့် ဖုန်းနံပါတ် <b>{completedOrder.contact}</b> ကို အသုံးပြု၍ အချိန်မရွေး "အော်ဒါစစ်ရန်" ခလုတ်မှတစ်ဆင့် status စစ်ဆေးနိုင်ပြီး download link ရယူနိုင်ပါသည်။
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {onOpenTrackWithNo && (
                  <button
                    onClick={() => {
                      const no = completedOrder.no;
                      const cont = completedOrder.contact;
                      resetAndClose();
                      onOpenTrackWithNo(no, cont);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#6b4226] text-white hover:bg-[#53321d] flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>အော်ဒါအခြေအနေ ချက်ချင်းစစ်မည်</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={resetAndClose}
                  className="py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#f7f0e8] text-[#6b4226] hover:bg-[#ebdccd]"
                >
                  ပိတ်မည်
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            /* EMPTY CART */
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 bg-[#f7f0e8] text-[#6b4226] rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-stone-700">ခြင်းတောင်းထဲတွင် ပစ္စည်းမရှိသေးပါ</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                ဆိုင်မှ သင်ကြိုက်နှစ်သက်ရာ Digital Product များကို ရွေးချယ်ထည့်သွင်းပါ
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 rounded-xl text-xs font-bold bg-[#6b4226] text-white hover:bg-[#53321d]"
              >
                စျေးဝယ်ရန်
              </button>
            </div>
          ) : (
            /* ACTIVE CART ITEMS & CHECKOUT FORM */
            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Items List */}
              <div className="space-y-2.5 border-b border-[#f2e8dc] pb-4">
                <div className="flex justify-between items-center text-xs font-bold text-[#735c49]">
                  <span>ရွေးချယ်ထားသော ပစ္စည်းများ ({cartItems.length})</span>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-red-600 hover:text-red-700 text-xs font-medium"
                  >
                    အားလုံးဖျက်မည်
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cartItems.map(({ product, qty }) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#fcfaf7] border border-[#f0e4d7]"
                    >
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs sm:text-sm text-[#2b1d12] truncate">
                          {product.name}
                        </h5>
                        <span className="text-xs font-bold text-[#6b4226]">
                          {product.price.toLocaleString()} Ks
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-white border border-[#e6d8c8] rounded-lg px-2 py-1">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(product.id, -1)}
                          className="text-stone-500 hover:text-stone-800 p-0.5"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-xs min-w-[18px] text-center">{qty}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(product.id, 1)}
                          className="text-stone-500 hover:text-stone-800 p-0.5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <span className="font-bold text-xs sm:text-sm text-[#2b1d12]">
                          {(product.price * qty).toLocaleString()} Ks
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(product.id)}
                        className="text-stone-400 hover:text-red-600 p-1"
                        title="ဖယ်ထုတ်မည်"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Subtotal */}
                <div className="flex justify-between items-center pt-2 text-sm">
                  <span className="font-semibold text-stone-600">စုစုပေါင်း ကျသင့်ငွေ:</span>
                  <span className="text-lg font-extrabold text-[#6b4226]">
                    {totalAmount.toLocaleString()} Ks
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs text-[#6b4226] uppercase tracking-wider">
                  ဝယ်ယူသူ အချက်အလက်
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      အမည် <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ဥပမာ - မောင်မောင်"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-[#d9c4b3] focus:border-[#6b4226] focus:ring-1 focus:ring-[#6b4226] outline-none bg-[#fcfaf7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      ဖုန်း / Telegram <span className="text-red-500">*</span>
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
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-2.5">
                <h5 className="font-bold text-xs text-[#6b4226] uppercase tracking-wider">
                  ငွေပေးချေမှု ရွေးချယ်ရန်
                </h5>

                {/* Payment Option Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(paymentAccounts) as (keyof PaymentAccounts)[]).map(k => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setSelectedPay(k)}
                      className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all ${
                        selectedPay === k
                          ? 'bg-[#6b4226] text-white border-[#6b4226] shadow-xs'
                          : 'bg-[#fcfaf7] text-[#5c4738] border-[#e6d8c8] hover:bg-[#f7f0e8]'
                      }`}
                    >
                      {k === 'KPay' ? 'KBZPay (KPay)' : k === 'WavePay' ? 'WavePay' : k.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                {/* Payment Account Display Box */}
                <div className="bg-[#f7f0e8] border border-[#d9c4b3] rounded-xl p-3 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-[#735c49] font-medium block">
                      {selectedPay} ငွေလွှဲရန် အကောင့်:
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#2b1d12] block">
                      {activeAccount.name}
                    </span>
                    <span className="text-sm sm:text-base font-mono font-extrabold text-[#6b4226] tracking-wide">
                      {activeAccount.number}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white hover:bg-stone-50 border border-[#d9c4b3] text-[#6b4226] text-xs font-bold transition-all shadow-2xs"
                  >
                    {copiedAccount ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy နံပါတ်</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Slip Upload & Note */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    ငွေလွှဲ Screenshot (Slip) <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 border-dashed border-[#d9c4b3] hover:border-[#6b4226] bg-[#fcfaf7] cursor-pointer transition-colors text-xs text-[#5c4738] font-medium">
                      <Upload className="w-4 h-4 text-[#6b4226]" />
                      <span>{slipFileName ? slipFileName : 'ငွေလွှဲပြေစာ ပုံတင်ရန် နှိပ်ပါ'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>

                    {slipDataUrl && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#d9c4b3] shrink-0">
                        <img
                          src={slipDataUrl}
                          alt="Slip Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    မှတ်ချက် (မဖြစ်မနေ မလိုပါ)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="ဥပမာ - မိမိ Gmail သို့ Invite ပို့ပေးပါ (abc@gmail.com)"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-[#d9c4b3] focus:border-[#6b4226] outline-none bg-[#fcfaf7]"
                  />
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#f7f0e8] text-[#6b4226] hover:bg-[#ebdccd] transition-colors"
                >
                  ပိတ်မည်
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#6b4226] hover:bg-[#53321d] text-white shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>အော်ဒါတင်နေပါသည်...</span>
                  ) : (
                    <>
                      <span>အော်ဒါတင်မည် ({totalAmount.toLocaleString()} Ks)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
