import React, { useState } from 'react';
import { 
  Send, 
  MessageSquare, 
  Phone, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { OFFICIAL_CONTACTS } from '../data/initialData';

export const ContactChannels: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const channels = [
    {
      id: 'telegram',
      name: 'Telegram',
      nameMy: 'တယ်လီဂရမ်',
      number: OFFICIAL_CONTACTS.telegram, // 09675663660
      actionUrl: OFFICIAL_CONTACTS.telegramLink,
      actionLabel: 'Telegram ဖြင့် မေးမည်',
      bgColor: 'bg-sky-500',
      lightBg: 'bg-sky-50',
      border: 'border-sky-200',
      textColor: 'text-sky-700',
      icon: (
        <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      )
    },
    {
      id: 'viber',
      name: 'Viber',
      nameMy: 'ဗိုက်ဘာ',
      number: OFFICIAL_CONTACTS.viber, // 09970340032
      actionUrl: OFFICIAL_CONTACTS.viberLink,
      actionLabel: 'Viber ဖြင့် မေးမည်',
      bgColor: 'bg-[#7360f2]',
      lightBg: 'bg-[#f4f2ff]',
      border: 'border-purple-200',
      textColor: 'text-[#614dd9]',
      icon: (
        <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
          <path d="M19.467 15.659c-.496-.46-1.077-.852-1.673-1.19-.748-.426-1.325-.262-1.782.355-.383.518-.767.544-1.387.218-1.268-.667-2.316-1.602-3.136-2.781-.462-.663-.385-.99.19-1.488.423-.367.653-.82.464-1.428-.217-.696-.69-1.34-1.127-1.954-.424-.596-.913-.715-1.536-.37-.872.483-1.353 1.25-1.396 2.247-.075 1.745.549 3.313 1.579 4.697 1.637 2.198 3.738 3.655 6.388 4.298 1.173.284 2.302.138 3.232-.693.633-.566.967-1.27.767-2.148-.094-.41-.39-.775-.72-1.037z"/>
        </svg>
      )
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      nameMy: 'ဝှက်စ်အပ်',
      number: OFFICIAL_CONTACTS.whatsapp, // 09970340032
      actionUrl: OFFICIAL_CONTACTS.whatsappLink,
      actionLabel: 'WhatsApp ဖြင့် မေးမည်',
      bgColor: 'bg-[#25D366]',
      lightBg: 'bg-emerald-50',
      border: 'border-emerald-200',
      textColor: 'text-emerald-700',
      icon: (
        <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      )
    },
    {
      id: 'imo',
      name: 'Imo',
      nameMy: 'အီမို',
      number: OFFICIAL_CONTACTS.imo, // 09970340032
      actionUrl: `tel:${OFFICIAL_CONTACTS.imo}`,
      actionLabel: 'Imo ဖုန်းခေါ်မည်',
      bgColor: 'bg-[#188fff]',
      lightBg: 'bg-blue-50',
      border: 'border-blue-200',
      textColor: 'text-blue-700',
      icon: (
        <PhoneCall className="w-5 h-5 text-white" />
      )
    }
  ];

  return (
    <section className="bg-gradient-to-b from-[#fcfaf7] via-[#f7f0e8]/80 to-[#fcfaf7] border-t border-[#ebdccd] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#d9c4b3] text-[#6b4226] text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Customer Service & Help Desk</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#2b1d12] tracking-tight">
            တိုက်ရိုက် ဆက်သွယ်စုံစမ်းနိုင်သော လမ်းကြောင်းများ
          </h3>
          <p className="text-xs sm:text-sm text-[#735c49] mt-1.5 leading-relaxed">
            Digital Product ဝယ်ယူခြင်း၊ ငွေလွှဲအတည်ပြုခြင်းနှင့် နည်းပညာအကူအညီများအတွက် အောက်ပါ Social Chat များမှတစ်ဆင့် ချက်ချင်း ဆက်သွယ်နိုင်ပါသည်
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {channels.map(ch => (
            <div
              key={ch.id}
              className={`bg-white rounded-2xl p-5 border ${ch.border} shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:-translate-y-0.5`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-2xl ${ch.bgColor} flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform`}>
                    {ch.icon}
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${ch.lightBg} ${ch.textColor} border ${ch.border}`}>
                    Active 24/7
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-base text-[#2b1d12]">{ch.name}</h4>
                    <span className="text-xs text-stone-500">({ch.nameMy})</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#fcfaf7] border border-stone-200">
                    <span className="font-mono font-black text-sm text-[#2b1d12] tracking-wider">
                      {ch.number}
                    </span>
                    <button
                      onClick={() => handleCopy(ch.number, ch.id)}
                      className="p-1 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
                      title={`${ch.name} နံပါတ် ကူးယူမည်`}
                    >
                      {copiedKey === ch.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Link Button */}
              <div className="mt-4 pt-3 border-t border-stone-100">
                <a
                  href={ch.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-white ${ch.bgColor} hover:opacity-95 shadow-2xs transition-all flex items-center justify-center gap-1.5 active:scale-95`}
                >
                  <span>{ch.actionLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
