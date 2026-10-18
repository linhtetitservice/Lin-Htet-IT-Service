import React from 'react';
import { Product } from '../types';
import { Plus, Check, Zap } from 'lucide-react';

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
  return (
    <div className="bg-white rounded-xl border border-[#e6d8c8] hover:border-[#6b4226] overflow-hidden flex flex-col shadow-xs hover:shadow-md transition-all duration-200 group">
      {/* Product Image */}
      <div className="relative h-44 w-full bg-[#f7f0e8] overflow-hidden">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80';
          }}
        />
        {product.category && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#6b4226]/90 text-white backdrop-blur-xs shadow-xs">
            {product.category}
          </span>
        )}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-600/90 text-white backdrop-blur-xs">
          <Zap className="w-2.5 h-2.5" />
          <span>Instant</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3 className="font-bold text-[#2b1d12] text-sm sm:text-base leading-snug group-hover:text-[#6b4226] transition-colors">
            {product.name}
          </h3>
          <p className="mt-1.5 text-xs text-[#735c49] line-clamp-2 leading-relaxed">
            {product.description || 'Digital Product လိုင်စင်နှင့် အကောင့် အသေးစိတ်'}
          </p>
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
              className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                isAdded
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-[#f7f0e8] text-[#6b4226] hover:bg-[#ebdccd]'
              }`}
              title="ခြင်းတောင်းထဲထည့်မည်"
            >
              {isAdded ? <Check className="w-4 h-4 text-emerald-700" /> : <Plus className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onBuyNow(product)}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-[#6b4226] hover:bg-[#53321d] text-white shadow-xs transition-colors"
            >
              ဝယ်မည်
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
