import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  MessageCircle, 
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Clock,
  RotateCcw
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'delivery' | 'payment' | 'usage';
  question: string;
  questionMy: string;
  answer: string;
  highlights?: string[];
  actionLabel?: string;
  actionType?: 'track' | 'history' | 'support';
}

interface FAQProps {
  onOpenTrack?: () => void;
  onOpenHistory?: () => void;
  supportTelegram?: string;
  supportPhone?: string;
}

const FAQ_DATA: FAQItem[] = [
  // 1. Digital Product Delivery
  {
    id: 'faq-1',
    category: 'delivery',
    questionMy: 'ငွေလွှဲပြီးပါက Digital Product (Download Link / Key) ကို ဘယ်အချိန်မှာ ရရှိမှာပါလဲ?',
    question: 'How fast is digital product delivery after payment?',
    answer: 'ငွေလွှဲစလစ် (Slip) ပေးပို့ပြီး Admin ဘက်မှ စစ်ဆေးအတည်ပြုပြီးသည်နှင့် ၅ မိနစ်မှ ၁၅ မိနစ်အတွင်း အမြန်ဆုံး ပို့ဆောင်ပေးပါသည်။ ဝဘ်ဆိုက်၏ "အော်ဒါစစ်ရန်" သို့မဟုတ် "ဝယ်ယူမှုမှတ်တမ်း" စာမျက်နှာတွင် မိမိ၏ ဖုန်းနံပါတ် သို့မဟုတ် အော်ဒါနံပါတ်ဖြင့် စစ်ဆေးကာ Download Link နှင့် Credentials များကို ချက်ချင်း ရယူနိုင်ပါသည်။',
    highlights: ['၅ မိနစ်မှ ၁၅ မိနစ်အတွင်း အမြန်ဆုံး ပို့ဆောင်မှု', 'ဝဘ်ဆိုက်ပေါ်တွင် တိုက်ရိုက် Download Link ရယူနိုင်ခြင်း'],
    actionLabel: 'အော်ဒါအခြေအနေ စစ်ဆေးရန်',
    actionType: 'track'
  },
  {
    id: 'faq-2',
    category: 'delivery',
    questionMy: 'ဝယ်ယူပြီးသား Download Link သို့မဟုတ် Account အချက်အလက်များ ပျောက်သွားပါက ဘယ်လိုလုပ်ရမလဲ?',
    question: 'What if I lose my download link or license credentials?',
    answer: 'လုံးဝ စိတ်ပူစရာမလိုပါ။ အပေါ်ဘားရှိ "ဝယ်ယူမှုမှတ်တမ်း (Order History)" ကို နှိပ်ပြီး ဝယ်ယူစဉ်က အသုံးပြုခဲ့သော ဖုန်းနံပါတ် သို့မဟုတ် Telegram ID ရိုက်ထည့်လိုက်ပါက ယခင်ဝယ်ယူခဲ့သော အော်ဒါအားလုံးနှင့်တကွ Download Link များကို အချိန်မရွေး အကန့်အသတ်မရှိ ပြန်လည်ထုတ်ယူနိုင်ပါသည်။',
    highlights: ['ဖုန်းနံပါတ်ဖြင့် အချိန်မရွေး ပြန်လည်ရှာဖွေနိုင်ခြင်း', 'Lifetime Access မှတ်တမ်းစနစ်'],
    actionLabel: 'ဝယ်ယူမှုမှတ်တမ်း စစ်ဆေးရန်',
    actionType: 'history'
  },
  {
    id: 'faq-3',
    category: 'delivery',
    questionMy: 'Software Setup & Installation Guide အသုံးပြုနည်း လမ်းညွှန်များ ပါဝင်ပါသလား?',
    question: 'Are setup guides and tutorials included with purchases?',
    answer: 'ဟုတ်ကဲ့၊ Product တိုင်းအတွက် အသေးစိတ် တပ်ဆင်အသုံးပြုနည်း လမ်းညွှန် (Text / Video Guide) နှင့် တရားဝင် Official Download Link များ အပြည့်အစုံ ပါဝင်ပါသည်။ အကယ်၍ ကိုယ်တိုင်တပ်ဆင်ရာတွင် အခက်အခဲရှိပါက Lin Htet IT Service Telegram Support မှတစ်ဆင့် Remote Support (AnyDesk / TeamViewer) ဖြင့် အခမဲ့ ကူညီပေးပါသည်။',
    highlights: ['အသေးစိတ် မြန်မာဘာသာဖြင့် တပ်ဆင်နည်းလမ်းညွှန်', 'လိုအပ်ပါက AnyDesk အခမဲ့ Remote Support']
  },

  // 2. Payment Methods
  {
    id: 'faq-4',
    category: 'payment',
    questionMy: 'ဘယ်လို Payment နည်းလမ်းများဖြင့် ငွေလွှဲပေးချေနိုင်ပါသလဲ?',
    question: 'What payment methods are supported?',
    answer: 'မြန်မာနိုင်ငံတွင်း အသုံးအများဆုံးဖြစ်သော KBZPay (KPay), WavePay, CB Pay, နှင့် AYAPay တို့ဖြင့် အပို % ဝန်ဆောင်ခ (0% fee) မပါဝင်ဘဲ ကိန်းဂဏန်းအတိအကျ ငွေလွှဲဝယ်ယူနိုင်ပါသည်။ နိုင်ငံတကာမှ ဝယ်ယူလိုသူများအတွက် USDT (TRC-20) ဖြင့်လည်း ပေးချေနိုင်ပါသည်။',
    highlights: ['KBZPay & WavePay တိုက်ရိုက်ငွေလွှဲ', 'အပို ရာခိုင်နှုန်း ဝန်ဆောင်ခ မရှိပါ']
  },
  {
    id: 'faq-5',
    category: 'payment',
    questionMy: 'ငွေလွှဲပြီး Screenshot (Slip) တင်ရာတွင် ဘာတွေ သတိပြုရမလဲ?',
    question: 'What should I keep in mind when uploading payment slips?',
    answer: 'ငွေလွှဲ Screenshot တွင် ငွေလွှဲချိန်၊ ငွေပမာဏ နှင့် Transaction ID / ပြေစာနံပါတ်တို့ ရှင်းလင်းစွာ မြင်သာရပါမည်။ ဖြတ်ညှပ်ထားသော ပုံများ သို့မဟုတ် မရှင်းလင်းသော ပုံများဖြစ်ပါက စစ်ဆေးရန် ကြန့်ကြာနိုင်ပါသည်။ မမှန်ကန်သော slip များအား စနစ်မှ လက်ခံမည်မဟုတ်ပါ။',
    highlights: ['Transaction ID / ရက်စွဲနှင့် အချိန် ရှင်းလင်းစွာ ပါဝင်ရန်', 'ငွေလွှဲပြီးလျှင် Slip ကို ချက်ချင်း ပူးတွဲတင်ရန်']
  },
  {
    id: 'faq-6',
    category: 'payment',
    questionMy: 'ငွေပြန်အမ်းပေးခြင်း (Refund Policy) ရှိပါသလား?',
    question: 'What is your refund and return policy?',
    answer: 'ကျွန်ုပ်တို့ထံမှ ဝယ်ယူထားသော digital product သို့မဟုတ် license key တွင် နည်းပညာပိုင်းဆိုင်ရာ ချို့ယွင်းချက်ရှိပြီး အစားထိုးလဲလှယ်၍ မရရှိနိုင်ပါက ၁၀၀% ငွေအပြည့်အဝ ပြန်လည်အမ်းပေးပါသည် (100% Money-back Guarantee)။ ဝယ်ယူသူ စိတ်ကျေနပ်မှုကို အဓိကထား ဆောင်ရွက်ပေးပါသည်။',
    highlights: ['၁၀၀% အာမခံငွေပြန်အမ်းစနစ်', 'အမြန်ဆုံး ဖြေရှင်းပေးမှု']
  },

  // 3. Account Usage & Warranty
  {
    id: 'faq-7',
    category: 'usage',
    questionMy: 'Canva Pro၊ VPN နှင့် AI Account များသည် ကိုယ်ပိုင် Gmail ဖြင့် သုံးရမှာလား (သို့မဟုတ်) Shared Account လား?',
    question: 'Do products use personal Gmail or shared credentials?',
    answer: 'Product တစ်ခုချင်းစီ၏ Specifications တွင် ရှင်းလင်းစွာ ဖော်ပြထားပါသည်။ ဥပမာ - Canva Pro Lifetime သည် လူကြီးမင်း၏ ကိုယ်ပိုင် Gmail သို့ Brand Kit Invite တိုက်ရိုက် ပို့ပေးသဖြင့် Password ပေးစရာမလိုဘဲ ကိုယ်ပိုင်အကောင့်ဖြင့် စိတ်ချလက်ချ သုံးနိုင်ပါသည်။ NordVPN နှင့် ChatGPT ကဲ့သို့ tools များတွင် Private (သီးသန့်) နှင့် Shared (မျှဝေ) အလိုက် စိတ်ကြိုက် ရွေးချယ်နိုင်ပါသည်။',
    highlights: ['Canva Pro သည် ကိုယ်ပိုင် Gmail သို့ တိုက်ရိုက် Invite ရရှိ', 'Private နှင့် Shared စိတ်ကြိုက် ရွေးချယ်နိုင်']
  },
  {
    id: 'faq-8',
    category: 'usage',
    questionMy: 'အသုံးပြုနေစဉ် အကောင့် Error တက်ခြင်း သို့မဟုတ် Key ပြဿနာဖြစ်ပါက အာမခံပေးပါသလား?',
    question: 'What warranty is provided if account issues arise?',
    answer: 'ဝယ်ယူသည့် သက်တမ်းကာလတစ်ခုလုံး (Full Warranty) အတွက် ၁၀၀% တာဝန်ယူ အာမခံပေးပါသည်။ အကောင့် Logout ဖြစ်ခြင်း သို့မဟုတ် Issue တစ်ခုခု ဖြစ်ပေါ်ပါက Lin Htet IT Service Telegram Support သို့ ဆက်သွယ်လိုက်ရုံဖြင့် အမြန်ဆုံး စစ်ဆေးကာ Replacement အကောင့်အသစ် လဲလှယ်ပေးပါသည်။',
    highlights: ['ဝယ်ယူသည့် ကာလအပြည့် Full Replacement Warranty', 'Telegram မှတစ်ဆင့် အမြန်ဆုံး ဝန်ဆောင်မှု']
  },
  {
    id: 'faq-9',
    category: 'usage',
    questionMy: 'Telegram Price Alert (ဈေးနှုန်းကျဆင်းမှု သတိပေးချက်) စနစ်က ဘယ်လို အလုပ်လုပ်သလဲ?',
    question: 'How does the Telegram Price Alert feature work?',
    answer: 'မိမိ စောင့်ကြည့်လိုသော Digital Product ၏ ကတ်ပေါ်တွင် ခေါင်းလောင်းပုံ (🔔) ကိုနှိပ်ပြီး မိမိ၏ Telegram Username (@username) ရိုက်ထည့်ထားရုံဖြင့် ထို Product ဈေးနှုန်း လျှော့ချသည့်အခါ Telegram ထံသို့ သတိပေးချက် message အလိုအလျောက် ပေးပို့ပေးမည့် အခမဲ့ Feature ဖြစ်ပါသည်။',
    highlights: ['အခမဲ့ စောင့်ကြည့်နိုင်ခြင်း', 'ဈေးကျသည်နှင့် Telegram သို့ တိုက်ရိုက် သတိပေးခြင်း']
  }
];

export const FAQ: React.FC<FAQProps> = ({
  onOpenTrack,
  onOpenHistory,
  supportTelegram = 'https://t.me/linhtetit',
  supportPhone = '09-777123456'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'delivery' | 'payment' | 'usage'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<string[]>(['faq-1']); // default open first FAQ

  const toggleAccordion = (id: string) => {
    setOpenIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        item.questionMy.toLowerCase().includes(q) ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        (item.highlights && item.highlights.some(h => h.toLowerCase().includes(q)));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleActionClick = (type?: 'track' | 'history' | 'support') => {
    if (type === 'track' && onOpenTrack) {
      onOpenTrack();
    } else if (type === 'history' && onOpenHistory) {
      onOpenHistory();
    } else {
      window.open(supportTelegram, '_blank');
    }
  };

  return (
    <section className="bg-white border-t border-[#ebdccd] py-14 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f7f0e8] border border-[#d9c4b3] text-[#6b4226] text-xs font-bold mb-3 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-[#6b4226]" />
            <span>Frequently Asked Questions (မကြာခဏ မေးလေ့ရှိသော မေးခွန်းများ)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#2b1d12] tracking-tight">
            သိရှိလိုသည်များကို အလွယ်တကူ ရှာဖွေပါ
          </h2>
          <p className="text-xs sm:text-sm text-[#735c49] mt-2 max-w-xl mx-auto leading-relaxed">
            Digital product များ ဝယ်ယူမှု၊ ငွေပေးချေခြင်း၊ ပို့ဆောင်ချိန်နှင့် အကောင့်အာမခံချက်ဆိုင်ရာ မေးခွန်းများကို ဤနေရာတွင် လေ့လာနိုင်ပါသည်
          </p>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="bg-[#fcfaf7] p-3 sm:p-4 rounded-2xl border border-[#e6d8c8] shadow-2xs mb-8 space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="မေးခွန်းများ ရှာဖွေရန်... (Delivery, KPay, Canva, Refund, Telegram...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-9 py-2 rounded-xl border border-[#d9c4b3] bg-white outline-none focus:border-[#6b4226] focus:ring-1 focus:ring-[#6b4226] shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#6b4226] text-white shadow-2xs'
                  : 'bg-white text-stone-600 border border-[#e6d8c8] hover:bg-[#f7f0e8]'
              }`}
            >
              အားလုံး ({FAQ_DATA.length})
            </button>
            <button
              onClick={() => setSelectedCategory('delivery')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'delivery'
                  ? 'bg-[#6b4226] text-white shadow-2xs'
                  : 'bg-white text-stone-600 border border-[#e6d8c8] hover:bg-[#f7f0e8]'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>ပို့ဆောင်ခြင်း (Delivery)</span>
            </button>
            <button
              onClick={() => setSelectedCategory('payment')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'payment'
                  ? 'bg-[#6b4226] text-white shadow-2xs'
                  : 'bg-white text-stone-600 border border-[#e6d8c8] hover:bg-[#f7f0e8]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>ငွေပေးချေမှု (Payment)</span>
            </button>
            <button
              onClick={() => setSelectedCategory('usage')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'usage'
                  ? 'bg-[#6b4226] text-white shadow-2xs'
                  : 'bg-white text-stone-600 border border-[#e6d8c8] hover:bg-[#f7f0e8]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>အကောင့်နှင့် အာမခံ (Usage & Warranty)</span>
            </button>
          </div>
        </div>

        {/* Accordion Items List */}
        {filteredFaqs.length === 0 ? (
          <div className="p-10 text-center bg-[#fcfaf7] rounded-2xl border border-[#e6d8c8]">
            <HelpCircle className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-stone-700">ရှာဖွေမှုနှင့် ကိုက်ညီသော မေးခွန်းမတွေ့ပါ</h4>
            <p className="text-xs text-stone-500 mt-1">အခြား စကားလုံးဖြင့် ရှာဖွေပါ သို့မဟုတ် Category အားလုံးကို ရွေးပါ</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#6b4226] text-white hover:bg-[#53321d]"
            >
              အားလုံး ပြန်ကြည့်မည်
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIds.includes(faq.id);

              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen 
                      ? 'bg-white border-[#6b4226] shadow-sm ring-1 ring-[#6b4226]/10' 
                      : 'bg-[#fcfaf7] border-[#e6d8c8] hover:border-[#b89578]'
                  }`}
                >
                  {/* Accordion Header / Trigger Button */}
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 select-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 sm:mt-0 transition-colors ${
                        isOpen
                          ? 'bg-[#6b4226] text-white'
                          : 'bg-[#f7f0e8] text-[#6b4226]'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <h3 className={`font-bold text-xs sm:text-sm transition-colors ${
                          isOpen ? 'text-[#2b1d12]' : 'text-stone-800 hover:text-[#6b4226]'
                        }`}>
                          {faq.questionMy}
                        </h3>
                        <span className="text-[11px] text-stone-500 font-medium block mt-0.5">
                          {faq.question}
                        </span>
                      </div>
                    </div>

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-[#f7f0e8] text-[#6b4226]' : 'text-stone-400 hover:text-stone-700'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Accordion Collapsible Content */}
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 text-xs sm:text-sm text-stone-700 border-t border-[#f2e7dc] space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="leading-relaxed text-[#3d2b1f]">
                        {faq.answer}
                      </p>

                      {/* Highlights Pill Badges */}
                      {faq.highlights && faq.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {faq.highlights.map((hl, i) => (
                            <span 
                              key={i}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f7f0e8] border border-[#ebdccd] text-[11px] font-semibold text-[#6b4226]"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{hl}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Optional Action Button */}
                      {faq.actionLabel && (
                        <div className="pt-2">
                          <button
                            onClick={() => handleActionClick(faq.actionType)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6b4226] hover:bg-[#53321d] text-white text-xs font-bold transition-all shadow-2xs active:scale-95"
                          >
                            <span>{faq.actionLabel}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Still Have Questions? Direct Contact Support Box */}
        <div className="mt-10 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#f7f0e8] via-[#fcfaf7] to-[#f7f0e8] border border-[#ebdccd] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#6b4226] text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-[#2b1d12]">
                အခြား သိရှိလိုသော အချက်များ ရှိပါသလား?
              </h4>
              <p className="text-xs text-[#735c49] mt-0.5">
                Lin Htet IT Service Customer Care မှ နေ့စဉ် နံနက် ၉:၀၀ မှ ည ၁၁:၀၀ ထိ အမြန်ဆုံး အကူအညီပေးနေပါသည်
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={supportTelegram}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6b4226] hover:bg-[#53321d] text-white flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Telegram Chat မေးမည်</span>
            </a>
            <a
              href={`tel:${supportPhone}`}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-stone-50 text-[#6b4226] border border-[#d9c4b3] shadow-2xs transition-colors"
            >
              <span>{supportPhone}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
