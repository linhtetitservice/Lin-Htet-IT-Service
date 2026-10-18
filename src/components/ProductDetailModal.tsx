import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ProductReviews } from './ProductReviews';
import { storeService } from '../services/storeService';
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Zap, 
  Flame, 
  AlertCircle, 
  Bell, 
  Check, 
  Star, 
  ShieldCheck, 
  Clock, 
  FileText, 
  MessageSquare,
  HelpCircle,
  Share2
} from 'lucide-react';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onOpenPriceAlert: (product: Product) => void;
  initialTab?: 'details' | 'reviews';
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onBuyNow,
  onOpenPriceAlert,
  initialTab = 'details'
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [ratingSummary, setRatingSummary] = useState<{ average: number; count: number }>({
    average: 5.0,
    count: 0
  });
  const [isCopied, setIsCopied] = useState(false);
  const [isAddedToast, setIsAddedToast] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, product?.id]);

  useEffect(() => {
    if (product?.id) {
      storeService.getProductRatingSummary(product.id).then(res => {
        setRatingSummary({ average: res.average, count: res.count });
      });
    }
  }, [product?.id]);

  if (!isOpen || !product) return null;

  const stock = product.stock;
  const isOutOfStock = stock !== undefined && stock <= 0;
  const isLowStock = stock !== undefined && stock < 5 && stock > 0;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Lin Htet IT Service - ${product.name} (${product.price.toLocaleString()} Ks)\nအသေးစိတ်ကြည့်ရန် ဆက်သွယ်ပါ`
      );
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleAddCartClick = () => {
    onAddToCart(product);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#ebdccd] overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-[#fcfaf7] border-b border-[#ebdccd] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#6b4226] text-white shrink-0">
              {product.category || 'Digital'}
            </span>
            <h2 className="text-base sm:text-lg font-black text-[#2b1d12] truncate">
              {product.name}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl text-stone-500 hover:text-[#6b4226] hover:bg-[#ebdccd] transition-colors"
              title="Share Product"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#ebdccd] bg-white px-5 shrink-0 text-xs sm:text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'details'
                ? 'border-[#6b4226] text-[#6b4226]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>အသေးစိတ် အချက်အလက် (Overview)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'reviews'
                ? 'border-[#6b4226] text-[#6b4226]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>သုံးသပ်ချက်များ (Reviews & Ratings)</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold">
              ★ {ratingSummary.average.toFixed(1)} ({ratingSummary.count})
            </span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-7 flex-1 space-y-6">
          {activeTab === 'details' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
              {/* Product Image & Badges (5 cols) */}
              <div className="md:col-span-5 space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-[#f7f0e8] border border-[#e6d8c8] aspect-4/3 group">
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Digital Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-md">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Instant Delivery</span>
                  </div>

                  {/* Out of stock */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-2xs flex items-center justify-center">
                      <span className="px-3.5 py-1.5 bg-red-700 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        ပစ္စည်းပြတ် (Out of Stock)
                      </span>
                    </div>
                  )}
                </div>

                {/* Rating Badge Quick Click */}
                <div 
                  onClick={() => setActiveTab('reviews')}
                  className="bg-[#fcfaf7] border border-[#ebdccd] hover:border-amber-400 p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-500" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-stone-800">
                      {ratingSummary.average.toFixed(1)} / 5.0
                    </span>
                  </div>
                  <span className="text-xs text-[#6b4226] font-bold hover:underline flex items-center gap-1">
                    {ratingSummary.count} Reviews ကြည့်မည် →
                  </span>
                </div>

                {/* Trust Highlights */}
                <div className="bg-[#f7f0e8]/80 rounded-2xl p-4 border border-[#ebdccd] space-y-2.5 text-xs text-[#5c4738]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">၁၀၀% စစ်မှန်သော ဒစ်ဂျစ်တယ် လိုင်စင်/အကောင့်</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-semibold">ငွေစစ်ပြီးသည်နှင့် ချက်ချင်း Download Link ရရှိမည်</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-semibold">တပ်ဆင်အသုံးပြုရာတွင် အခက်အခဲရှိပါက ကူညီပေးပါသည်</span>
                  </div>
                </div>
              </div>

              {/* Product Details & Actions (7 cols) */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#2b1d12] leading-tight">
                    {product.name}
                  </h1>
                  
                  {/* Price Banner */}
                  <div className="mt-3 p-4 bg-gradient-to-r from-[#f7f0e8] to-[#fcfaf7] border border-[#ebdccd] rounded-2xl flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#8d7159] uppercase block">
                        ဈေးနှုန်း (Price)
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-2xl sm:text-3xl font-black text-[#6b4226]">
                          {product.price.toLocaleString()}
                        </span>
                        <span className="text-sm font-extrabold text-[#6b4226]">Ks (MMK)</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-stone-500 font-semibold block">Stock လက်ကျန်</span>
                      {isOutOfStock ? (
                        <span className="text-xs font-bold text-red-600">ပစ္စည်းပြတ်</span>
                      ) : isLowStock ? (
                        <span className="text-xs font-extrabold text-rose-600 flex items-center gap-1 justify-end">
                          <Flame className="w-3.5 h-3.5 fill-rose-600" />
                          {stock} ခုသာကျန်သည်
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600">Stock အသင့်ရှိ</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="font-extrabold text-sm text-[#2b1d12]">
                    ပစ္စည်းအကြောင်း အသေးစိတ် (Product Description)
                  </h3>
                  <div className="text-xs sm:text-sm text-[#4a3b2c] leading-relaxed whitespace-pre-line bg-[#fcfaf7] p-4 rounded-2xl border border-[#ebdccd]">
                    {product.description || 'Lin Htet IT Service မှ တိုက်ရိုက်ရောင်းချပေးသော စစ်မှန်သည့် ဒစ်ဂျစ်တယ်ဆော့ဖ်ဝဲလ် လိုင်စင်နှင့် အကောင့်ဖြစ်ပါသည်။'}
                  </div>
                </div>

                {/* Specs breakdown */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#f7f0e8] rounded-xl border border-[#ebdccd]">
                    <span className="text-stone-500 font-medium block">အမျိုးအစား (Category)</span>
                    <span className="font-bold text-[#2b1d12] mt-0.5 block">{product.category}</span>
                  </div>
                  <div className="p-3 bg-[#f7f0e8] rounded-xl border border-[#ebdccd]">
                    <span className="text-stone-500 font-medium block">ပို့ဆောင်မှု ပုံစံ</span>
                    <span className="font-bold text-emerald-700 mt-0.5 block">Instant Download Link</span>
                  </div>
                  <div className="p-3 bg-[#f7f0e8] rounded-xl border border-[#ebdccd]">
                    <span className="text-stone-500 font-medium block">ငွေပေးချေမှု</span>
                    <span className="font-bold text-[#2b1d12] mt-0.5 block">KBZPay / WavePay</span>
                  </div>
                  <div className="p-3 bg-[#f7f0e8] rounded-xl border border-[#ebdccd]">
                    <span className="text-stone-500 font-medium block">ဝယ်ယူပြီးစစ်ဆေးရန်</span>
                    <span className="font-bold text-[#6b4226] mt-0.5 block">အော်ဒါစစ်ဆေးရန်မှ ရယူနိုင်</span>
                  </div>
                </div>

                {/* CTA Action Buttons */}
                <div className="pt-3 border-t border-[#ebdccd] space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                    {/* Add to Cart */}
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={handleAddCartClick}
                      className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#f7f0e8] hover:bg-[#ebdccd] text-[#6b4226] border border-[#d9c4b3] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isAddedToast ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700 font-extrabold">ခြင်းတောင်းထဲ ထည့်ပြီးပါပြီ!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>ခြင်းတောင်းထဲ ထည့်မည်</span>
                        </>
                      )}
                    </button>

                    {/* Buy Now */}
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => {
                        onBuyNow(product);
                        onClose();
                      }}
                      className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#6b4226] hover:bg-[#53321d] text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{isOutOfStock ? 'ပစ္စည်းပြတ်နေပါသည်' : 'ချက်ချင်း ဝယ်ယူမည် (Buy Now)'}</span>
                    </button>
                  </div>

                  {/* Price Alert button */}
                  <button
                    type="button"
                    onClick={() => {
                      onOpenPriceAlert(product);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-[#6b4226] bg-[#fcfaf7] hover:bg-amber-50 border border-amber-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <Bell className="w-4 h-4 text-amber-600" />
                    <span>ဈေးနှုန်းကျပါက Telegram သို့ သတိပေးချက်ရယူမည် (Price Alert)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Reviews Tab */
            <div className="space-y-4">
              <ProductReviews
                product={product}
                onReviewSubmitted={() => {
                  storeService.getProductRatingSummary(product.id).then(res => {
                    setRatingSummary({ average: res.average, count: res.count });
                  });
                }}
              />
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-5 py-3.5 bg-[#fcfaf7] border-t border-[#ebdccd] flex items-center justify-between text-xs text-stone-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#6b4226]">Lin Htet IT Service</span>
            <span>•</span>
            <span>Customer Satisfaction Guaranteed</span>
          </div>

          {isCopied && (
            <span className="text-emerald-700 font-bold animate-fadeIn">
              Link ကူးယူပြီးပါပြီ!
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-[#d9c4b3] bg-white text-stone-700 font-bold hover:bg-[#f7f0e8] transition-colors"
          >
            ပိတ်မည်
          </button>
        </div>
      </div>
    </div>
  );
};
