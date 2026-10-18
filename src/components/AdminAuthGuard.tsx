import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  loginAdminWithGoogle, 
  loginAdminWithPasscode,
  logoutAdmin, 
  onAdminAuthChange, 
  BOOTSTRAPPED_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSCODE
} from '../services/firebase';
import { 
  Shield, 
  ShieldAlert, 
  LogIn, 
  LogOut, 
  ArrowLeft, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  Key,
  Copy,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

interface AdminAuthGuardProps {
  children: (adminUser: User | { email: string; displayName?: string }, onLogout: () => void) => React.ReactNode;
  onBackToStore: () => void;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({
  children,
  onBackToStore,
}) => {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  // Passcode login state
  const [usePasscode, setUsePasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscodeText, setShowPasscodeText] = useState(false);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'your-domain.vercel.app';

  useEffect(() => {
    const unsubscribe = onAdminAuthChange((user, adminStatus) => {
      setAdminUser(user);
      setIsAdmin(adminStatus);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setSigningIn(true);
    setAuthError(null);
    setIsUnauthorizedDomain(false);
    try {
      const res = await loginAdminWithGoogle();
      if (!res.isAdmin) {
        setAuthError(res.error || 'ခွင့်ပြုချက်မရှိသော အကောင့်ဖြစ်ပါသည်');
        if (res.isUnauthorizedDomain) {
          setIsUnauthorizedDomain(true);
          setUsePasscode(true); // Automatically open the passcode input so they aren't blocked!
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Login လုပ်ဆောင်ချက် မအောင်မြင်ပါ';
      setAuthError(errMsg);
      if (errMsg.includes('auth/unauthorized-domain') || errMsg.includes('unauthorized-domain')) {
        setIsUnauthorizedDomain(true);
        setUsePasscode(true);
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);
    if (!passcode.trim()) {
      setPasscodeError('Admin Passcode ရိုက်ထည့်ပေးပါ');
      return;
    }

    const res = loginAdminWithPasscode(passcode);
    if (res.success && res.user) {
      setAdminUser(res.user);
      setIsAdmin(true);
      setAuthError(null);
      setIsUnauthorizedDomain(false);
    } else {
      setPasscodeError(res.error || 'မှားယွင်းသော Passcode ဖြစ်ပါသည်');
    }
  };

  const handleCopyDomain = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAdminUser(null);
    setIsAdmin(false);
    setPasscode('');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#e6d8c8] border-t-[#6b4226] rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-stone-600">
          Firebase Admin လုံခြုံရေး စစ်ဆေးနေပါသည်...
        </p>
      </div>
    );
  }

  // If successfully authenticated as admin
  if (adminUser && isAdmin) {
    return (
      <div className="space-y-4">
        {/* Top Firebase Security Banner */}
        <div className="bg-[#6b4226] text-white px-4 sm:px-6 py-2.5 shadow-xs border-b border-[#53321d]">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {adminUser.isMasterPasscode ? 'Master Passcode Authenticated' : 'Firebase Protected'}
              </span>
              <span className="text-[#ebdccd] hidden sm:inline">•</span>
              <span className="text-[#f7f0e8] font-medium">
                Admin: <b className="text-white font-mono">{adminUser.email || BOOTSTRAPPED_ADMIN_EMAIL}</b>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#53321d] hover:bg-[#432715] text-[#f7f0e8] hover:text-white transition-colors"
                title="Admin Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout ထွက်မည်</span>
              </button>
            </div>
          </div>
        </div>

        {/* Render Protected Admin Dashboard */}
        {children(adminUser, handleLogout)}
      </div>
    );
  }

  // Admin Lock Screen
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#e6d8c8] shadow-2xl max-w-lg w-full p-6 sm:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Lock Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-[#f7f0e8] text-[#6b4226] flex items-center justify-center shadow-inner">
          <Shield className="w-10 h-10 text-[#6b4226]" />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 mb-2">
            Firebase Authentication Guard
          </span>
          <h3 className="text-xl font-extrabold text-[#2b1d12] tracking-tight">
            Admin Backend Security
          </h3>
          <p className="text-xs sm:text-sm text-[#735c49] mt-1.5 leading-relaxed">
            Lin Htet IT Service ၏ အော်ဒါစီမံခန့်ခွဲမှုနှင့် Download Links များကို လုံခြုံစွာ ကာကွယ်ထားပါသည်။ Admin အကောင့်ဖြင့် ဝင်ရောက်ပါ။
          </p>
        </div>

        {/* Authorized Admin Notice */}
        <div className="p-3 bg-[#fcfaf7] border border-[#ebdccd] rounded-xl text-left text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-500 block">
            ခွင့်ပြုထားသော စီမံခန့်ခွဲသူ အီးမေးလ်:
          </span>
          <p className="font-mono font-bold text-[#6b4226] break-all">
            {BOOTSTRAPPED_ADMIN_EMAIL}
          </p>
        </div>

        {/* Specific Firebase unauthorized-domain Assistance Box */}
        {isUnauthorizedDomain && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs text-left space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 font-extrabold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Firebase Authorized Domain သတ်မှတ်ရန် လိုအပ်နေပါသည်</span>
            </div>
            
            <p className="text-stone-700 leading-relaxed">
              လူကြီးမင်း ဖွင့်ထားသော domain (<b>{currentHostname}</b>) သည် Firebase Console ၏ Authorized domains စာရင်းထဲတွင် မရှိသေးသောကြောင့် Google Login ကန့်သတ်ခံရခြင်း ဖြစ်ပါသည်။
            </p>

            <div className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-stone-500 block">လက်ရှိ Domain Name:</span>
                <span className="font-mono font-bold text-[#6b4226] truncate block">{currentHostname}</span>
              </div>
              <button
                onClick={handleCopyDomain}
                className="px-3 py-1.5 rounded-lg bg-[#f7f0e8] hover:bg-[#ebdccd] text-[#6b4226] font-bold text-xs flex items-center gap-1 shrink-0 transition-colors"
              >
                {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDomain ? 'Copied' : 'Copy Domain'}</span>
              </button>
            </div>

            <div className="space-y-1 text-[11px] text-stone-600">
              <div className="font-bold text-stone-800">Firebase Console တွင် ထည့်သွင်းနည်း:</div>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Firebase Console သို့ သွားပါ</li>
                <li><b>Build</b> &gt; <b>Authentication</b> &gt; <b>Settings</b> &gt; <b>Authorized domains</b> သို့ သွားပါ</li>
                <li><b>Add domain</b> တွင် အထက်ပါ <b className="font-mono">{currentHostname}</b> ကို ထည့်သွင်းပါ</li>
              </ol>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <a
                href="https://console.firebase.google.com/project/gen-lang-client-0374514838/authentication/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-800 font-bold underline flex items-center gap-1 hover:text-amber-950 text-[11px]"
              >
                <span>Firebase Console ဖွင့်ရန်</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                👇 အောက်တွင် Master Passcode ဖြင့် ချက်ချင်းဝင်နိုင်ပါသည်
              </span>
            </div>
          </div>
        )}

        {/* Generic Error message (if not unauthorized-domain) */}
        {authError && !isUnauthorizedDomain && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span className="leading-relaxed">{authError}</span>
          </div>
        )}

        {/* Master Passcode Login Form */}
        {usePasscode ? (
          <form onSubmit={handlePasscodeSubmit} className="space-y-3 p-4 bg-[#fcfaf7] border border-[#e6d8c8] rounded-2xl text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#6b4226]">
                <Key className="w-4 h-4 text-amber-600" />
                <span>Admin Master Passcode ဖြင့် ဝင်ရောက်ခြင်း</span>
              </div>
              <span className="text-[10px] text-stone-500 font-mono">Instant Access</span>
            </div>

            <div className="relative">
              <input
                type={showPasscodeText ? 'text' : 'password'}
                placeholder="Admin Passcode ရိုက်ထည့်ပါ..."
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                className="w-full text-xs pl-3 pr-10 py-2.5 rounded-xl border border-[#d9c4b3] bg-white outline-none focus:border-[#6b4226] font-mono"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPasscodeText(prev => !prev)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 p-0.5"
              >
                {showPasscodeText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {passcodeError && (
              <p className="text-red-600 text-xs font-semibold">{passcodeError}</p>
            )}

            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span>မူလ Passcode: <code className="font-bold text-[#6b4226] bg-[#f7f0e8] px-1.5 py-0.5 rounded">{DEFAULT_ADMIN_PASSCODE}</code></span>
              <button
                type="button"
                onClick={() => setPasscode(DEFAULT_ADMIN_PASSCODE)}
                className="text-[#6b4226] hover:underline font-bold text-[10px]"
              >
                Auto-fill
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#6b4226] hover:bg-[#53321d] text-white shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Admin Dashboard သို့ ချက်ချင်းဝင်ရောက်မည်</span>
            </button>
          </form>
        ) : null}

        {/* Login with Google Button & Passcode Toggle */}
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            disabled={signingIn}
            className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#6b4226] hover:bg-[#53321d] text-white shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {signingIn ? (
              <span>စစ်ဆေးနေပါသည်...</span>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google ဖြင့် Admin Login ဝင်မည်</span>
              </>
            )}
          </button>

          {/* Toggle between Google & Passcode Mode */}
          <button
            type="button"
            onClick={() => setUsePasscode(prev => !prev)}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold text-[#6b4226] bg-[#f7f0e8] hover:bg-[#ebdccd] border border-[#d9c4b3] transition-colors flex items-center justify-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5 text-amber-700" />
            <span>
              {usePasscode 
                ? 'Google Login သို့ ပြန်ပြောင်းမည်' 
                : '🔑 Master Passcode / Security PIN ဖြင့် ဝင်မည် (Vercel / Offline)'}
            </span>
          </button>

          <button
            onClick={onBackToStore}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ဆိုင်ရှေ့သို့ ပြန်သွားမည်</span>
          </button>
        </div>
      </div>
    </div>
  );
};
