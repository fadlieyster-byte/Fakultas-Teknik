import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import {
  authenticateDriveWithOAuth,
  getDriveAuthSession,
  getDriveSessionHint,
  initDriveAuth,
  isDriveTokenExpiringSoon,
  OAuthTokenVerificationResult,
  refreshDriveAuthToken,
  signOutDriveSession,
  subscribeDriveAuthSession,
  verifyDriveAuthToken,
  WorkspaceAuthSession,
  WorkspaceSessionHint
} from '../utils/driveService';
import { signOutGoogleWorkspace } from '../utils/googleWorkspaceService';

export interface UseDriveAuthOptions {
  defaultLoginHint?: string;
  onAuthenticated?: (session: WorkspaceAuthSession) => void;
  onSessionExpiredOrCleared?: () => void;
}

export interface UseDriveAuthResult {
  firebaseUser: User | null;
  session: WorkspaceAuthSession | null;
  sessionHint: WorkspaceSessionHint | null;
  accessToken: string | null;
  userEmail: string | null;
  displayName: string | null;
  grantedAt: string | null;
  expiresAt: number | null;
  tokenRemainingMinutes: number | null;
  isAuthenticated: boolean;
  needsAuth: boolean;
  needsRefresh: boolean;
  isExpiringSoon: boolean;
  isValidatingSession: boolean;
  isAuthenticating: boolean;
  authError: string | null;
  signIn: (loginHint?: string) => Promise<WorkspaceAuthSession | null>;
  refreshSession: (loginHint?: string) => Promise<WorkspaceAuthSession | null>;
  verifyCurrentToken: () => Promise<OAuthTokenVerificationResult>;
  signOut: (alsoSignOutFirebase?: boolean) => Promise<void>;
  validateSession: () => boolean;
  clearError: () => void;
}

/**
 * React hook managing Google Drive OAuth 2.0 authentication, strictly in-memory
 * access token storage, session metadata hint preservation, automatic TTL verification,
 * and Firebase Auth state sync.
 */
export function useDriveAuth(options: UseDriveAuthOptions = {}): UseDriveAuthResult {
  const { defaultLoginHint, onAuthenticated, onSessionExpiredOrCleared } = options;

  const [firebaseUser, setFirebaseUser] = useState<User | null>(() => auth.currentUser);
  const [session, setSession] = useState<WorkspaceAuthSession | null>(() => getDriveAuthSession());
  const [sessionHint, setSessionHint] = useState<WorkspaceSessionHint | null>(() =>
    getDriveSessionHint()
  );
  const [isValidatingSession, setIsValidatingSession] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState<number>(() => Date.now());

  const validateSession = useCallback((): boolean => {
    setSessionHint(getDriveSessionHint());
    const active = getDriveAuthSession();
    if (!active?.accessToken) {
      setSession(prev => {
        if (prev !== null) onSessionExpiredOrCleared?.();
        return null;
      });
      return false;
    }

    if (active.expiresAt && Date.now() >= active.expiresAt) {
      signOutDriveSession(true);
      setSession(null);
      onSessionExpiredOrCleared?.();
      return false;
    }

    setSession(active);
    return true;
  }, [onSessionExpiredOrCleared]);

  useEffect(() => {
    let isMounted = true;

    const unsubscribeFirebase = onAuthStateChanged(auth, fbUser => {
      if (!isMounted) return;
      setFirebaseUser(fbUser);
    });

    const unsubscribeInit = initDriveAuth(
      (fbUser, activeSession) => {
        if (!isMounted) return;
        setFirebaseUser(fbUser);
        setSession(activeSession);
        setSessionHint(getDriveSessionHint());
        setIsValidatingSession(false);
      },
      () => {
        if (!isMounted) return;
        setSession(getDriveAuthSession());
        setSessionHint(getDriveSessionHint());
        setIsValidatingSession(false);
      }
    );

    const unsubscribeTokenStore = subscribeDriveAuthSession(nextSession => {
      if (!isMounted) return;
      setSessionHint(getDriveSessionHint());
      setSession(prev => {
        if (prev && !nextSession) {
          onSessionExpiredOrCleared?.();
        }
        return nextSession;
      });
    });

    validateSession();
    setIsValidatingSession(false);

    return () => {
      isMounted = false;
      unsubscribeFirebase();
      unsubscribeInit();
      unsubscribeTokenStore();
    };
  }, [validateSession, onSessionExpiredOrCleared]);

  // Periodically check remaining token TTL (every 60s) & schedule exact expiration cleanup
  useEffect(() => {
    if (!session?.expiresAt) return;
    const msRemaining = session.expiresAt - Date.now();
    if (msRemaining <= 0) {
      signOutDriveSession(true);
      setSession(null);
      onSessionExpiredOrCleared?.();
      return;
    }

    const interval = window.setInterval(() => {
      setNowTick(Date.now());
    }, 60_000);

    const timer = window.setTimeout(() => {
      signOutDriveSession(true);
      setSession(null);
      onSessionExpiredOrCleared?.();
    }, msRemaining);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, [session?.expiresAt, onSessionExpiredOrCleared]);

  const signIn = useCallback(
    async (loginHint?: string): Promise<WorkspaceAuthSession | null> => {
      setAuthError(null);
      setIsAuthenticating(true);
      try {
        const hint =
          loginHint ?? defaultLoginHint ?? sessionHint?.userEmail ?? firebaseUser?.email ?? undefined;
        const nextSession = await authenticateDriveWithOAuth(hint);
        setSession(nextSession);
        setSessionHint(getDriveSessionHint());
        setFirebaseUser(auth.currentUser);
        setNowTick(Date.now());
        onAuthenticated?.(nextSession);
        return nextSession;
      } catch (err: any) {
        const message =
          err?.code === 'auth/popup-closed-by-user'
            ? 'Jendela autentikasi Google OAuth ditutup sebelum selesai.'
            : err?.message || 'Autentikasi OAuth 2.0 Google Drive gagal.';
        setAuthError(message);
        throw new Error(message);
      } finally {
        setIsAuthenticating(false);
      }
    },
    [defaultLoginHint, sessionHint?.userEmail, firebaseUser?.email, onAuthenticated]
  );

  const refreshSession = useCallback(
    async (loginHint?: string): Promise<WorkspaceAuthSession | null> => {
      setAuthError(null);
      setIsAuthenticating(true);
      try {
        const hint =
          loginHint ?? sessionHint?.userEmail ?? firebaseUser?.email ?? defaultLoginHint ?? undefined;
        const refreshed = await refreshDriveAuthToken(hint);
        setSession(refreshed);
        setSessionHint(getDriveSessionHint());
        setFirebaseUser(auth.currentUser);
        setNowTick(Date.now());
        onAuthenticated?.(refreshed);
        return refreshed;
      } catch (err: any) {
        const message =
          err?.code === 'auth/popup-closed-by-user'
            ? 'Jendela pembaruan token Google OAuth ditutup sebelum selesai.'
            : err?.message || 'Pembaruan token OAuth 2.0 Google Drive gagal.';
        setAuthError(message);
        throw new Error(message);
      } finally {
        setIsAuthenticating(false);
      }
    },
    [defaultLoginHint, sessionHint?.userEmail, firebaseUser?.email, onAuthenticated]
  );

  const verifyCurrentToken = useCallback(async (): Promise<OAuthTokenVerificationResult> => {
    const result = await verifyDriveAuthToken();
    if (!result.valid) {
      setSession(null);
    } else {
      setSession(getDriveAuthSession());
      setNowTick(Date.now());
    }
    return result;
  }, []);

  const signOut = useCallback(
    async (alsoSignOutFirebase = false): Promise<void> => {
      setAuthError(null);
      if (alsoSignOutFirebase) {
        await signOutGoogleWorkspace();
        setFirebaseUser(null);
      } else {
        signOutDriveSession(false);
      }
      setSession(null);
      setSessionHint(null);
    },
    []
  );

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  const hasValidToken = Boolean(
    session?.accessToken && (!session.expiresAt || Date.now() < session.expiresAt)
  );
  const tokenRemainingMinutes =
    hasValidToken && session?.expiresAt
      ? Math.max(0, Math.round((session.expiresAt - nowTick) / 60_000))
      : null;

  return {
    firebaseUser,
    session: hasValidToken ? session : null,
    sessionHint,
    accessToken: hasValidToken ? session!.accessToken : null,
    userEmail: hasValidToken
      ? session!.userEmail
      : sessionHint?.userEmail ?? firebaseUser?.email ?? null,
    displayName: hasValidToken
      ? session!.displayName
      : sessionHint?.displayName ?? firebaseUser?.displayName ?? null,
    grantedAt: hasValidToken ? session!.grantedAt : sessionHint?.grantedAt ?? null,
    expiresAt: hasValidToken ? session!.expiresAt ?? null : null,
    tokenRemainingMinutes,
    isAuthenticated: hasValidToken,
    needsAuth: !hasValidToken,
    needsRefresh: !hasValidToken && Boolean(sessionHint || firebaseUser),
    isExpiringSoon: hasValidToken && isDriveTokenExpiringSoon(session),
    isValidatingSession,
    isAuthenticating,
    authError,
    signIn,
    refreshSession,
    verifyCurrentToken,
    signOut,
    validateSession,
    clearError
  };
}
