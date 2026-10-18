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

// Primary Bootstrapped Admin Email
export const BOOTSTRAPPED_ADMIN_EMAIL = 'linhtetitservice0@gmail.com';

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
export async function loginAdminWithGoogle(): Promise<{ user: User | null; isAdmin: boolean; error?: string }> {
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
    return { user: null, isAdmin: false, error: err.message || 'Login failed' };
  }
}

// Sign Out Admin
export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}

// Helper to verify admin privileges
export function checkIsAdminUser(user: User | null): boolean {
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
export function onAdminAuthChange(callback: (user: User | null, isAdmin: boolean) => void) {
  return onAuthStateChanged(auth, (user) => {
    const isAdmin = checkIsAdminUser(user);
    callback(user, isAdmin);
  });
}
