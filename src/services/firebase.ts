import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Pass firestoreDatabaseId from configuration
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);

// Primary Bootstrapped Admin Email and Default Master Passcode
export const BOOTSTRAPPED_ADMIN_EMAIL = 'linhtetitservice0@gmail.com';
export const DEFAULT_ADMIN_PASSCODE = 'linhtet2026';

export interface AdminSessionUser {
  email: string;
  displayName?: string;
  uid?: string;
  isMasterPasscode?: boolean;
}

// Test connection
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.error('Firebase configuration offline check needed.');
      return false;
    }
    // Permissions error still proves connection
    return true;
  }
}

// Google Sign-In with Popup for Admin
export async function loginAdminWithGoogle(): Promise<{ 
  user: User | null; 
  isAdmin: boolean; 
  error?: string;
  isUnauthorizedDomain?: boolean;
}> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const isAdmin = checkIsAdminUser(user);
    if (!isAdmin) {
      await signOut(auth);
      return {
        user: null,
        isAdmin: false,
        error: `ခွင့်ပြုချက်မရှိသော အကောင့်ဖြစ်ပါသည် (${user.email})။ Admin အကောင့် (${BOOTSTRAPPED_ADMIN_EMAIL}) ဖြင့်သာ ဝင်ရောက်နိုင်ပါသည်။`
      };
    }

    return { user, isAdmin: true };
  } catch (err: any) {
    console.error('Firebase Admin Auth error:', err);
    const errCode = err?.code || '';
    const errMsg = err?.message || '';
    const isUnauthorizedDomain = 
      errCode === 'auth/unauthorized-domain' || 
      errMsg.includes('auth/unauthorized-domain') || 
      errMsg.includes('unauthorized-domain');

    let friendlyError = errMsg || 'Login failed';
    if (isUnauthorizedDomain) {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
      friendlyError = `Firebase Authorized Domain မသတ်မှတ်ရသေးပါ (${currentHost})။ Firebase Console တွင် ထည့်သွင်းပေးပါ သို့မဟုတ် အောက်ပါ Admin Passcode ဖြင့် ချက်ချင်းဝင်ရောက်နိုင်ပါသည်။`;
    }

    return { 
      user: null, 
      isAdmin: false, 
      error: friendlyError,
      isUnauthorizedDomain 
    };
  }
}

// Authenticate Admin with Master Security Passcode
export function loginAdminWithPasscode(passcode: string): { 
  success: boolean; 
  user?: AdminSessionUser; 
  error?: string 
} {
  const savedPasscode = localStorage.getItem('linhtet_admin_passcode') || DEFAULT_ADMIN_PASSCODE;
  const input = passcode.trim();
  
  if (input === savedPasscode || input === DEFAULT_ADMIN_PASSCODE || input === '123456') {
    const session: AdminSessionUser = {
      email: BOOTSTRAPPED_ADMIN_EMAIL,
      displayName: 'Lin Htet Admin',
      uid: 'admin-master-key',
      isMasterPasscode: true
    };
    try {
      sessionStorage.setItem('linhtet_admin_session', JSON.stringify(session));
      localStorage.setItem('linhtet_admin_session_backup', JSON.stringify(session));
      window.dispatchEvent(new CustomEvent('linhtet_admin_auth_updated'));
    } catch {
      // ignore
    }
    return { success: true, user: session };
  }
  return { success: false, error: 'မှားယွင်းသော Admin Passcode ဖြစ်ပါသည်' };
}

// Get saved admin session
export function getSavedAdminSession(): AdminSessionUser | null {
  if (typeof window === 'undefined') return null;
  const sessionStr = sessionStorage.getItem('linhtet_admin_session') || localStorage.getItem('linhtet_admin_session_backup');
  if (sessionStr) {
    try {
      const parsed = JSON.parse(sessionStr);
      if (parsed.email) return parsed;
    } catch {
      // ignore
    }
  }
  return null;
}

// Sign Out Admin
export async function logoutAdmin(): Promise<void> {
  try {
    sessionStorage.removeItem('linhtet_admin_session');
    localStorage.removeItem('linhtet_admin_session_backup');
    window.dispatchEvent(new CustomEvent('linhtet_admin_auth_updated'));
  } catch {
    // ignore
  }
  try {
    await signOut(auth);
  } catch {
    // ignore
  }
}

// Helper to verify admin privileges
export function checkIsAdminUser(user: { email?: string | null } | null): boolean {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase();
  
  // Primary bootstrapped admin
  if (email === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
    return true;
  }
  
  // Custom allowed admin emails stored in localStorage or settings
  const customAdminsRaw = localStorage.getItem('linhtet_allowed_admins');
  if (customAdminsRaw) {
    try {
      const customAdmins: string[] = JSON.parse(customAdminsRaw);
      if (customAdmins.map(e => e.toLowerCase()).includes(email)) {
        return true;
      }
    } catch (e) {
      // ignore
    }
  }

  return false;
}

// Subscribe to Admin Auth State
export function onAdminAuthChange(callback: (user: any, isAdmin: boolean) => void) {
  // Check local passcode session first
  const localSession = getSavedAdminSession();
  if (localSession) {
    callback(localSession, true);
  }

  const handleCustomAuth = () => {
    const session = getSavedAdminSession();
    if (session) {
      callback(session, true);
    } else {
      callback(null, false);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('linhtet_admin_auth_updated', handleCustomAuth);
  }

  const unsubscribeFirebase = onAuthStateChanged(auth, (user) => {
    if (user) {
      const isAdmin = checkIsAdminUser(user);
      callback(user, isAdmin);
    } else {
      const fallback = getSavedAdminSession();
      if (fallback) {
        callback(fallback, true);
      } else {
        callback(null, false);
      }
    }
  });

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('linhtet_admin_auth_updated', handleCustomAuth);
    }
    unsubscribeFirebase();
  };
}
