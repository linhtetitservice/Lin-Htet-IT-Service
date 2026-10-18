import React, { useState } from 'react';
import { AppConfig, PaymentAccounts } from '../types';
import { X, Save, Copy, Check, Send, Database, RefreshCw, Key } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (newConfig: Partial<AppConfig>) => void;
  onResetData: () => void;
  isSupabaseLive: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetData,
  isSupabaseLive,
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState(config.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(config.supabaseAnonKey || '');
  const [telegramBotToken, setTelegramBotToken] = useState(config.telegramBotToken || '');
  const [telegramChatId, setTelegramChatId] = useState(config.telegramChatId || '');
  
  // Payment Accounts
  const [kpayName, setKpayName] = useState(config.paymentAccounts?.KPay?.name || 'Lin Htet');
  const [kpayNumber, setKpayNumber] = useState(config.paymentAccounts?.KPay?.number || '09-777123456');
  const [waveName, setWaveName] = useState(config.paymentAccounts?.WavePay?.name || 'Lin Htet');
  const [waveNumber, setWaveNumber] = useState(config.paymentAccounts?.WavePay?.number || '09-777123456');

  const [copiedSql, setCopiedSql] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [dbCheckStatus, setDbCheckStatus] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAccounts: PaymentAccounts = {
      ...config.paymentAccounts,
      KPay: { name: kpayName.trim(), number: kpayNumber.trim() },
      WavePay: { name: waveName.trim(), number: waveNumber.trim() },
    };

    onSaveConfig({
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
      telegramBotToken: telegramBotToken.trim(),
      telegramChatId: telegramChatId.trim(),
      paymentAccounts: updatedAccounts,
    });

    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1000);
  };

  const handleCopySql = () => {
    const sql = `-- Lin Htet IT Service: Supabase Database Schema
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  category text,
  image text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists product_files (
  product_id uuid primary key references products(id) on delete cascade,
  url text not null
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  no text unique,
  customer_name text,
  contact text,
  note text,
  items jsonb,
  total numeric,
  pay_method text,
  slip text,
  status text default 'new',
  created_at timestamptz default now()
);

alter table products enable row level security;
alter table product_files enable row level security;
alter table orders enable row level security;

create policy "public read products" on products for select using (active = true);
create policy "admin all products" on products for all to authenticated using (true) with check (true);
create policy "admin all files" on product_files for all to authenticated using (true) with check (true);
create policy "admin all orders" on orders for all to authenticated using (true) with check (true);

alter publication supabase_realtime add table orders;

insert into storage.buckets (id, name, public) values ('slips','slips',true) on conflict (id) do nothing;
create policy "anon upload slips" on storage.objects for insert to anon with check (bucket_id = 'slips');
create policy "public read slips" on storage.objects for select using (bucket_id = 'slips');`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleAutoDetectChatId = async () => {
    if (!telegramBotToken) {
      setTestStatus('Bot Token မရှိပါ');
      return;
    }
    setTestStatus('@linhtetitbot မှ မက်ဆေ့ခ်ျများကို စစ်ဆေးနေပါသည်...');
    try {
      const res = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getUpdates`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
        const lastUpdate = data.result[data.result.length - 1];
        const chatId = lastUpdate.message?.chat?.id || lastUpdate.channel_post?.chat?.id || lastUpdate.my_chat_member?.chat?.id;
        if (chatId) {
          setTelegramChatId(String(chatId));
          setTestStatus(`✅ Chat ID တွေ့ရှိပါသည်: ${chatId}`);
          return;
        }
      }
      setTestStatus('⚠️ Chat ID မတွေ့သေးပါ။ Telegram တွင် @linhtetitbot သို့ /start ပို့ပြီးမှ ဤခလုတ်ကို ပြန်နှိပ်ပါ');
    } catch (e: any) {
      setTestStatus('စစ်ဆေးမရပါ: ' + e.message);
    }
  };

  const handleCheckSupabase = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setDbCheckStatus('URL နှင့် Key ဖြည့်ပါ');
      return;
    }
    setDbCheckStatus('Database ကို စစ်ဆေးနေပါသည်...');
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/products?limit=1`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`
        }
      });
      if (res.ok) {
        setDbCheckStatus('✅ Database ချိတ်ဆက်ပြီး Table များ အဆင်သင့်ရှိပါသည်!');
      } else {
        const err = await res.json();
        if (err.code === 'PGRST205') {
          setDbCheckStatus('⚠️ Database ချိတ်ဆက်မိသော်လည်း Table များ မရှိသေးပါ။ အောက်ပါ schema.sql ကို Supabase SQL Editor တွင် Run ပေးပါ');
        } else {
          setDbCheckStatus(`အမှား: ${err.message || 'Error'}`);
        }
      }
    } catch (e: any) {
      setDbCheckStatus('ဆက်သွယ်မရပါ: ' + e.message);
    }
  };

  const handleTestTelegram = async () => {
    if (!telegramBotToken || !telegramChatId) {
      setTestStatus('Bot Token နှင့် Chat ID ဖြည့်ပေးပါ');
      return;
    }
    setTestStatus('မက်ဆေ့ခ်ျ ပို့နေပါသည်...');
    try {
      const res = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: `🔔 *Lin Htet IT Service*\nTelegram Bot ဆက်သွယ်မှု စမ်းသပ်ခြင်း အောင်မြင်ပါသည်! ✨\n\nအချိန်: ${new Date().toLocaleString('my-MM')}`,
          parse_mode: 'Markdown'
        })
      });
      if (res.ok) {
        setTestStatus('✅ Telegram သို့ စမ်းသပ်မက်ဆေ့ခ်ျ အောင်မြင်စွာ ပို့ပြီးပါပြီ!');
      } else {
        const err = await res.json();
        setTestStatus(`❌ ပို့မရပါ: ${err.description || 'အမှားရှိသည်'}`);
      }
    } catch (e: any) {
      setTestStatus(`❌ ချိတ်ဆက်မရပါ: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#e6d8c8] overflow-hidden my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#f2e8dc] flex items-center justify-between bg-[#fcfaf7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f7f0e8] flex items-center justify-center text-[#6b4226]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#2b1d12]">Setup & API Keys</h3>
              <p className="text-[11px] text-[#735c49]">
                Supabase၊ Telegram Bot နှင့် ငွေလွှဲအကောင့်များ ပြင်ဆင်ရန်
              </p>
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
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Supabase Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs sm:text-sm text-[#6b4226] flex items-center gap-1.5 uppercase tracking-wide">
                  <Database className="w-4 h-4" />
                  <span>Supabase Database ဆက်သွယ်ရန်</span>
                </h4>
                {isSupabaseLive ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active Connection
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                    Demo Mode
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#d9c4b3] bg-[#fcfaf7] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Supabase Anon Key / Service Key
                </label>
                <input
                  type="text"
                  placeholder="eyJhbGciOi..."
                  value={supabaseAnonKey}
                  onChange={e => setSupabaseAnonKey(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#d9c4b3] bg-[#fcfaf7] outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleCheckSupabase}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#f7f0e8] text-[#6b4226] hover:bg-[#ebdccd] border border-[#d9c4b3] flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Database ချိတ်ဆက်မှု & Table စစ်ဆေးမည်</span>
                </button>
              </div>

              {dbCheckStatus && (
                <div className={`p-2.5 rounded-lg text-xs ${dbCheckStatus.includes('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'}`}>
                  {dbCheckStatus}
                </div>
              )}

              <div className="p-3 bg-[#f7f0e8] rounded-xl border border-[#ebdccd] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#6b4226] block">Supabase SQL Schema</span>
                  <span className="text-[11px] text-[#735c49]">Table များနှင့် RLS policies အားလုံးပါဝင်ပါသည်</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#d9c4b3] text-xs font-bold text-[#6b4226] hover:bg-stone-50 transition-colors shadow-2xs"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>schema.sql ကူးမည်</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Telegram Bot Section */}
            <div className="space-y-3 pt-3 border-t border-[#f2e8dc]">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs sm:text-sm text-[#6b4226] flex items-center gap-1.5 uppercase tracking-wide">
                  <Send className="w-4 h-4" />
                  <span>Telegram Bot (@linhtetitbot) အကြောင်းကြားမှု</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Bot Token
                  </label>
                  <input
                    type="text"
                    placeholder="123456789:ABCdefGHIjkl..."
                    value={telegramBotToken}
                    onChange={e => setTelegramBotToken(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#d9c4b3] bg-[#fcfaf7] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Chat ID (@userinfobot သို့ Auto-Detect)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="987654321..."
                      value={telegramChatId}
                      onChange={e => setTelegramChatId(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-[#d9c4b3] bg-[#fcfaf7] outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAutoDetectChatId}
                      className="whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#6b4226] text-white hover:bg-[#53321d] shrink-0"
                      title="Telegram တွင် @linhtetitbot သို့ /start ပို့ပြီး ဤခလုတ်ကို နှိပ်ပါ"
                    >
                      Auto-Detect
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleTestTelegram}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f7f0e8] text-[#6b4226] hover:bg-[#ebdccd] border border-[#d9c4b3]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>စမ်းသပ်မက်ဆေ့ခ်ျ ပို့ကြည့်မည်</span>
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-[#fcfaf7] border border-[#ebdccd] text-[11px] text-[#735c49]">
                💡 <b>Chat ID အလွယ်ယူနည်း:</b> Telegram တွင် <b>@linhtetitbot</b> ထဲသို့ဝင်၍ <b>/start</b> ဟု စာပို့ပါ။ ထို့နောက် အထက်ပါ <b>"Auto-Detect"</b> ခလုတ်ကို နှိပ်လိုက်ပါက သင်၏ Chat ID အလိုအလျောက် ရရှိပါမည်။
              </div>

              {testStatus && (
                <div className="p-2 rounded text-xs font-medium bg-stone-100 text-stone-800 border border-stone-200">
                  {testStatus}
                </div>
              )}
            </div>

            {/* Payment Numbers Section */}
            <div className="space-y-3 pt-3 border-t border-[#f2e8dc]">
              <h4 className="font-bold text-xs sm:text-sm text-[#6b4226] flex items-center gap-1.5 uppercase tracking-wide">
                <Key className="w-4 h-4" />
                <span>ငွေလက်ခံမည့် KPay / WavePay အကောင့်များ</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#fcfaf7] p-3 rounded-xl border border-[#ebdccd] space-y-2">
                  <span className="text-xs font-bold text-[#6b4226] block">KBZPay (KPay)</span>
                  <input
                    type="text"
                    placeholder="အမည် (e.g. Lin Htet)"
                    value={kpayName}
                    onChange={e => setKpayName(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded border border-[#d9c4b3] bg-white outline-none"
                  />
                  <input
                    type="text"
                    placeholder="ဖုန်းနံပါတ် (e.g. 09-777123456)"
                    value={kpayNumber}
                    onChange={e => setKpayNumber(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded border border-[#d9c4b3] bg-white outline-none font-mono"
                  />
                </div>

                <div className="bg-[#fcfaf7] p-3 rounded-xl border border-[#ebdccd] space-y-2">
                  <span className="text-xs font-bold text-[#6b4226] block">WavePay</span>
                  <input
                    type="text"
                    placeholder="အမည် (e.g. Lin Htet)"
                    value={waveName}
                    onChange={e => setWaveName(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded border border-[#d9c4b3] bg-white outline-none"
                  />
                  <input
                    type="text"
                    placeholder="ဖုန်းနံပါတ် (e.g. 09-777123456)"
                    value={waveNumber}
                    onChange={e => setWaveNumber(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded border border-[#d9c4b3] bg-white outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-3 border-t border-[#f2e8dc] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (confirm('နမူနာ စမ်းသပ် Product များနှင့် အော်ဒါများကို မူလအတိုင်း ပြန်လည်ထားရှိမည်လား?')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-red-700 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>မူလနမူနာဒေတာ ပြန်ထားမည် (Reset)</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#6b4226] hover:bg-[#53321d] text-white shadow transition-colors"
              >
                {savedNotice ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>သိမ်းဆည်းပြီးပါပြီ!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>ဆက်တင်များ သိမ်းဆည်းမည်</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
