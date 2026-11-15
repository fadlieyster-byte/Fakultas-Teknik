import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);

/**
 * Unified Google OAuth 2.0 scopes for SIKAPRODI FT UNBARI:
 * includes least-privilege Google Drive API access (`drive.file`)
 * alongside Classroom, Calendar, Forms, Sheets, and Gmail integrations.
 */
export const GOOGLE_WORKSPACE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses',
  'https://www.googleapis.com/auth/classroom.announcements',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/classroom.rosters',
  'https://www.googleapis.com/auth/classroom.profile.emails',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/forms.body.readonly',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/gmail.send'
] as const;

export function createDriveWorkspaceProvider(
  loginHint?: string,
  mode: 'consent' | 'refresh' = 'consent'
): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  GOOGLE_WORKSPACE_OAUTH_SCOPES.forEach(scope => provider.addScope(scope));
  provider.setCustomParameters({
    prompt: mode === 'consent' ? 'consent' : 'select_account',
    include_granted_scopes: 'true',
    ...(loginHint ? { login_hint: loginHint } : {})
  });
  return provider;
}

export const googleProvider = createDriveWorkspaceProvider();

export default app;
