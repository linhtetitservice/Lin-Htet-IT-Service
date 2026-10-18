import React from 'react';
import { ShieldCheck, Zap, CreditCard, Sparkles } from 'lucide-react';

interface HeroProps {
  onOpenHistory?: () => void;
  onOpenTrack?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenHistory, onOpenTrack }) => {
  return (
    <section className="bg-gradient-to-b from-[#f7f0e8] to-[#fcfaf7] border-b border-[#ebdccd] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ebdccd] text-[#6b4226] text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#6b4226]" />
          <span>ယုံကြည်စိတ်ချရသော မြန်မာ့ Digital Products ဝန်ဆောင်မှု</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#6b4226] tracking-tight">
          Digital Product ဆိုင်
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#5c4738] max-w-2xl mx-auto leading-relaxed">
          လိုအပ်သော VPN၊ Canva Pro၊ Windows License၊ Telegram Premium နှင့် AI Tools များကို
          KPay / WavePay ဖြင့် အလွယ်တကူ ဝယ်ယူလိုက်ပါ။
        </p>

        {/* Quick customer action shortcuts */}
        <div className="mt-5 flex items-center justify-center gap-2.5 flex-wrap">
          {onOpenTrack && (
            <button
              onClick={onOpenTrack}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#f7f0e8] text-[#6b4226] text-xs font-bold border border-[#d9c4b3] shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <span>🔍 အော်ဒါစစ်ဆေးရန်</span>
            </button>
          )}
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="px-3.5 py-1.5 rounded-xl bg-[#6b4226] hover:bg-[#53321d] text-white text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <span>📜 မိမိ၏ ဝယ်ယူမှုမှတ်တမ်း ကြည့်မည်</span>
            </button>
          )}
        </div>

        {/* Feature Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-[#4a3424]">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-[#e6d8c8] shadow-xs">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>ငွေလွှဲစစ်ပြီး မိနစ်ပိုင်းအတွင်း Link ရယူနိုင်ခြင်း</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-[#e6d8c8] shadow-xs">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>KPay / WavePay / KBZ Bank လက်ခံခြင်း</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-[#e6d8c8] shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Genuine & အာမခံပါဝင်ခြင်း</span>
          </div>
        </div>
      </div>
    </section>
  );
};
