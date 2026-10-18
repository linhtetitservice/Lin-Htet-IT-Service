import React from 'react';
import { ShoppingCart, Search, ShieldCheck, Settings, ExternalLink } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenTrack: () => void;
  onOpenAdmin: () => void;
  onOpenSettings: () => void;
  isAdminView: boolean;
  onToggleAdminView: () => void;
  isSupabaseLive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenTrack,
  isAdminView,
  onToggleAdminView,
  onOpenSettings,
  isSupabaseLive,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#6b4226] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div 
          onClick={() => { if (isAdminView) onToggleAdminView(); }}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#f7f0e8] flex items-center justify-center text-[#6b4226] shadow-inner font-bold text-lg transition-transform group-hover:scale-105">
            LH
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight flex items-center gap-2">
              Lin Htet IT Service
              {isSupabaseLive ? (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-500/30">
                  Supabase Live
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#8a5835] text-[#f7f0e8] border border-[#a6744f]/40">
                  Demo Storage
                </span>
              )}
            </h1>
            <p className="text-xs text-[#d9c4b3] hidden xs:block">Digital Product & Software Store</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Switcher */}
          <button
            onClick={onToggleAdminView}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              isAdminView
                ? 'bg-amber-400 text-stone-900 font-semibold shadow'
                : 'bg-[#53321d] hover:bg-[#432715] text-[#f7f0e8]'
            }`}
            title="Admin Dashboard သို့ ပြောင်းမည်"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden md:inline">{isAdminView ? 'ဆိုင်ရှေ့သို့' : 'Admin Panel'}</span>
            <span className="md:hidden">{isAdminView ? 'Shop' : 'Admin'}</span>
          </button>

          {!isAdminView && (
            <>
              {/* Track Order Button */}
              <button
                onClick={onOpenTrack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-[#53321d] hover:bg-[#432715] text-[#f7f0e8] transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">အော်ဒါစစ်ရန်</span>
                <span className="sm:hidden">စစ်ရန်</span>
              </button>

              {/* Cart Button */}
              <button
                onClick={onOpenCart}
                className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-[#f7f0e8] text-[#6b4226] hover:bg-white shadow transition-transform active:scale-95"
              >
                <ShoppingCart className="w-4 h-4 text-[#6b4226]" />
                <span className="hidden sm:inline">ခြင်းတောင်း</span>
                <span className="bg-[#6b4226] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartCount}
                </span>
              </button>
            </>
          )}

          {/* Standalone admin.html direct link */}
          <a
            href="/admin.html"
            target="_blank"
            rel="noopener noreferrer"
            title="သီးသန့် admin.html ဖိုင်ကို Tab အသစ်ဖြင့် ဖွင့်ရန်"
            className="hidden lg:flex items-center gap-1 text-xs text-[#e6d3c3] hover:text-white px-2 py-1.5 rounded hover:bg-[#53321d]"
          >
            admin.html
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium bg-[#53321d] hover:bg-[#432715] text-[#d9c4b3] hover:text-white transition-colors"
            title="Setup & Supabase/Telegram Configuration"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
