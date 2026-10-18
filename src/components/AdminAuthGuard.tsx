import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  loginAdminWithGoogle, 
  logoutAdmin, 
  onAdminAuthChange, 
  BOOTSTRAPPED_ADMIN_EMAIL 
} from '../services/firebase';
import { Shield, ShieldAlert, LogIn, LogOut, ArrowLeft, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AdminAuthGuardProps {
  children: (adminUser: User, onLogout: () => void) => React.ReactNode;
  onBackToStore: () => void;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({
  children,
  onBackToStore,
}) => {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

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
    try {
      const res = await loginAdminWithGoogle();
      if (!res.isAdmin) {
        setAuthError(res.error || 'ခွင့်ပြုချက်မရှိသော အကောင့်ဖြစ်ပါသည်');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login လုပ်ဆောင်ချက် မအောင်မြင်ပါ');
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAdminUser(null);
    setIsAdmin(false);
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
                Firebase Protected
              </span>
              <span className="text-[#ebdccd] hidden sm:inline">•</span>
              <span className="text-[#f7f0e8] font-medium">
                Admin: <b className="text-white font-mono">{adminUser.email}</b>
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
      <div className="bg-white rounded-3xl border border-[#e6d8c8] shadow-2xl max-w-md w-full p-6 sm:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
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

        {/* Error message */}
        {authError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span className="leading-relaxed">{authError}</span>
          </div>
        )}

        {/* Login with Google Button */}
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
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
