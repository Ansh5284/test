import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const DRIVE_OAUTH_SCOPES: string[] = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts',
];

let authInstance: Auth | null = null;
let providerInstance: GoogleAuthProvider | null = null;
let isSigningIn = false;
// Strict in-memory token cache (never stored in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;

function getFirebaseAuth(): Auth | null {
  if (authInstance) return authInstance;
  try {
    if (!firebaseConfig || !firebaseConfig.apiKey || !firebaseConfig.projectId) {
      return null;
    }
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    return authInstance;
  } catch {
    return null;
  }
}

function getGoogleProvider(): GoogleAuthProvider {
  if (!providerInstance) {
    providerInstance = new GoogleAuthProvider();
    for (const scope of DRIVE_OAUTH_SCOPES) {
      providerInstance.addScope(scope);
    }
  }
  return providerInstance;
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void,
) => {
  const auth = getFirebaseAuth();
  if (!auth) {
    onAuthFailure?.();
    return () => {};
  }

  try {
    return onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        if (cachedAccessToken) {
          onAuthSuccess?.(user, cachedAccessToken);
        } else if (!isSigningIn) {
          cachedAccessToken = null;
          onAuthFailure?.();
        }
      } else {
        cachedAccessToken = null;
        onAuthFailure?.();
      }
    });
  } catch {
    onAuthFailure?.();
    return () => {};
  }
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error(
      'Google OAuth is unavailable on this host. Configure VITE_GOOGLE_DRIVE_API_KEY and your public Drive folder IDs for direct access.',
    );
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, getGoogleProvider());
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Drive access token was not returned by sign-in.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async (): Promise<void> => {
  const auth = getFirebaseAuth();
  if (auth) {
    await auth.signOut();
  }
  cachedAccessToken = null;
};
