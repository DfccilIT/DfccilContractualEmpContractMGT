import { useCallback, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { broadcastLogoutEvent, listenForLogout, isLogoutInProgress } from '../auth/globalLogoutSync';
import { oidcConfig } from './config';
import { clearAllStorage } from '@/lib/helperFunction';

export function useGlobalLogout() {
  const auth = useAuth();
  const globalLogout = useCallback(async () => {
    try {
      const user = auth.user;
      const sessionId = user?.profile?.sid;

      // ✅ Notify other tabs/windows before removing user
      if (sessionId) {
        broadcastLogoutEvent(sessionId);
      }

      await auth.removeUser();
      clearAllStorage();
      await auth.signoutRedirect({
        post_logout_redirect_uri: oidcConfig.post_logout_redirect_uri,
      });
    } catch (error) {
      window.location.href = oidcConfig.post_logout_redirect_uri;
    }
  }, [auth]);

  /**
   * Listen for logout events from other tabs/apps and sync logout
   */
  useEffect(() => {
    if (isLogoutInProgress()) {
      console.log('[GlobalLogout] Logout already in progress. Skipping listener setup.');
      return;
    }

    const cleanup = listenForLogout(async () => {
      if (auth.isAuthenticated) {
        try {
          await auth.removeUser();
          clearAllStorage();
          window.location.href = oidcConfig.post_logout_redirect_uri;
        } catch (error) {}
      }
    });

    return () => {
      cleanup?.();
    };
  }, [auth]);

  return {
    globalLogout,
    isAuthenticated: auth.isAuthenticated,
    isLogoutInProgress: isLogoutInProgress(),
  };
}
