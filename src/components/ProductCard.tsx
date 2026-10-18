import React from 'react';
import { Product } from '../types';
import { Plus, Check, Zap, Flame, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  isAdded?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onBuyNow,
  isAdded = false,
}) => {
  const stock = product.stock;
  const isLowStock = stock !== undefined && stock < 5 && stock > 0;
  const isOutOfStock = stock !== undefined && stock <= 0;

  return (
    <div className="bg-white rounded-xl border border-[#e6d8c8] hover:border-[#6b4226] overflow-hidden flex flex-col shadow-xs hover:shadow-md transition-all duration-200 group relative">
      {/* Product Image */}
      <div className="relative h-44 w-full bg-[#f7f0e8] overflow-hidden">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            isOutOfStock ? 'grayscale opacity-60' : ''
          }`}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80';
          }}
        />
        
        {/* Category Pill */}
        {product.category && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#6b4226]/90 text-white backdrop-blur-xs shadow-xs">
            {product.category}
          </span>
        )}

        {/* Instant Digital Delivery Badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-600/90 text-white backdrop-blur-xs shadow-2xs">
          <Zap className="w-2.5 h-2.5" />
          <span>Instant</span>
        </div>

        {/* Small 'Low Stock' Badge on Image */}
        {isLowStock && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-md backdrop-blur-xs animate-pulse">
            <Flame className="w-3 h-3 text-yellow-300 fill-yellow-300" />
            <span>Low Stock: {stock} ခုသာကျန်</span>
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-2xs flex items-center justify-center">
            <span className="px-3 py-1 bg-red-700 text-white text-xs font-bold rounded-full shadow flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              ပစ္စည်းပြတ် (Out of Stock)
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          <h3 className="font-bold text-[#2b1d12] text-sm sm:text-base leading-snug group-hover:text-[#6b4226] transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-[#735c49] line-clamp-2 leading-relaxed">
            {product.description || 'Digital Product လိုင်စင်နှင့် အကောင့် အသေးစိတ်'}
          </p>

          {/* Low Stock Urgency Alert in Card Body */}
          {isLowStock && (
            <div className="pt-1 flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/90 px-2 py-0.5 rounded-md w-fit">
              <Flame className="w-3 h-3 text-rose-600 fill-rose-600 shrink-0" />
              <span>လက်ကျန် {stock} ခုသာကျန်သည် (အမြန်မှာပါ)</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-[#f2e8dc] flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8d7159] block">ဈေးနှုန်း</span>
            <span className="text-base sm:text-lg font-extrabold text-[#6b4226]">
              {product.price.toLocaleString()} <span className="text-xs font-semibold">Ks</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className={`p-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                isAdded
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-[#f7f0e8] text-[#6b4226] hover:bg-[#ebdccd]'
              }`}
              title={isOutOfStock ? 'ပစ္စည်းပြတ်နေပါသည်' : 'ခြင်းတောင်းထဲထည့်မည်'}
            >
              {isAdded ? <Check className="w-4 h-4 text-emerald-700" /> : <Plus className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onBuyNow(product)}
              disabled={isOutOfStock}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-[#6b4226] hover:bg-[#53321d] text-white shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isOutOfStock ? 'ပစ္စည်းပြတ်' : 'ဝယ်မည်'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
