import { UserManager } from 'oidc-client-ts';
import { broadcastLogoutEvent } from '../auth/globalLogoutSync';

interface LogoutOptions {
  userManager: UserManager;
  clientId: string;
  postLogoutRedirectUri?: string;
  clearLocal?: boolean;
  isFrontChannelLogout?: boolean;
  sessionId?: string;
}

export const performOidcLogout = async ({
  userManager,
  clientId,
  postLogoutRedirectUri,
  clearLocal = true,
  isFrontChannelLogout = false,
  sessionId,
}: LogoutOptions): Promise<void> => {
  try {
    const logoutTime = Date.now().toString();

    console.log('Performing OIDC logout', {
      isFrontChannelLogout,
      sessionId,
      clientId,
    });

    // Get current user before removal
    const currentUser = await userManager.getUser();
    const userSessionId = currentUser?.profile?.sid;

    // Validate session ID for front-channel logout
    if (isFrontChannelLogout && sessionId && userSessionId) {
      if (sessionId !== userSessionId) {
        console.warn('Session ID mismatch during front-channel logout', {
          expectedSid: userSessionId,
          receivedSid: sessionId,
        });
        // Continue with logout for security, but log the mismatch
      }
    }

    // Set logout timestamps for cross-tab synchronization
    const logoutData = {
      timestamp: logoutTime,
      sessionId: sessionId || userSessionId,
      type: isFrontChannelLogout ? 'frontchannel' : 'regular',
      clientId,
    };

    // Store logout events with more context
    localStorage.setItem('user_logout_time', logoutTime);
    localStorage.setItem('sso_logout', JSON.stringify(logoutData));
    localStorage.setItem('frontchannel_logout', JSON.stringify(logoutData));

    // Clear storage items if requested
    if (clearLocal) {
      await clearAuthStorage(clientId);
    }

    // Remove user from UserManager
    await userManager.removeUser();
    console.log('User removed from UserManager');

    // Broadcast logout event to other tabs/windows
    broadcastLogoutEvent(sessionId);

    // Handle redirect based on logout type
    if (!isFrontChannelLogout) {
      // For regular logout, initiate redirect-based logout
      const logoutArgs: any = {};

      if (postLogoutRedirectUri) {
        logoutArgs.post_logout_redirect_uri = postLogoutRedirectUri;
      }

      // Include session ID hint if available
      if (sessionId || userSessionId) {
        logoutArgs.id_token_hint = currentUser?.id_token;
      }

      await userManager.signoutRedirect(logoutArgs);
    }
    // For front-channel logout, don't redirect as it's handled by the calling component
  } catch (error) {
    console.error('Error during OIDC logout:', error);

    // Enhanced error handling
    if (error instanceof Error) {
      console.error('Logout error details:', {
        message: error.message,
        stack: error.stack,
        isFrontChannelLogout,
        sessionId,
      });
    }

    // Fallback cleanup even if logout fails
    if (clearLocal) {
      try {
        await clearAuthStorage(clientId);
        await userManager.removeUser();
      } catch (cleanupError) {
        console.error('Error during fallback cleanup:', cleanupError);
      }
    }

    // Only redirect on error for regular logout (not front-channel)
    if (!isFrontChannelLogout && postLogoutRedirectUri) {
      console.log('Performing fallback redirect to:', postLogoutRedirectUri);
      window.location.href = postLogoutRedirectUri;
    }

    // Re-throw error for caller to handle
    throw error;
  }
};

/**
 * Comprehensive auth storage cleanup
 */
const clearAuthStorage = async (clientId: string): Promise<void> => {
  try {
    // Clear localStorage
    const localStorageKeysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && shouldRemoveKey(key, clientId)) {
        localStorageKeysToRemove.push(key);
      }
    }
    localStorageKeysToRemove.forEach((key) => localStorage.removeItem(key));

    // Clear sessionStorage
    const sessionStorageKeysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && shouldRemoveKey(key, clientId)) {
        sessionStorageKeysToRemove.push(key);
      }
    }
    sessionStorageKeysToRemove.forEach((key) => sessionStorage.removeItem(key));

    console.log('Auth storage cleared', {
      localStorageKeys: localStorageKeysToRemove.length,
      sessionStorageKeys: sessionStorageKeysToRemove.length,
    });
  } catch (error) {
    console.error('Error clearing auth storage:', error);
  }
};

/**
 * Determine if a storage key should be removed during logout
 */
const shouldRemoveKey = (key: string, clientId: string): boolean => {
  const authRelatedPatterns = [
    'oidc',
    'auth',
    'token',
    'user:',
    clientId,
    'access_token',
    'id_token',
    'refresh_token',
    'nonce',
    'state',
    'code_verifier',
    'authority',
    'session',
  ];

  return authRelatedPatterns.some((pattern) => key.toLowerCase().includes(pattern.toLowerCase()));
};

/**
 * Silent logout - removes user without redirect (useful for front-channel logout)
 */
export const performSilentLogout = async ({
  userManager,
  clientId,
  sessionId,
}: Pick<LogoutOptions, 'userManager' | 'clientId' | 'sessionId'>): Promise<void> => {
  return performOidcLogout({
    userManager,
    clientId,
    clearLocal: true,
    isFrontChannelLogout: true,
    sessionId,
  });
};

/**
 * Check if a logout event is recent (within last 5 seconds)
 */
export const isRecentLogoutEvent = (timestamp: string): boolean => {
  const eventTime = parseInt(timestamp, 10);
  const now = Date.now();
  const fiveSecondsAgo = now - 5000;

  return eventTime > fiveSecondsAgo && eventTime <= now;
};

/**
 * Get logout event data from storage
 */
export const getLogoutEventData = (): any => {
  try {
    const logoutData = localStorage.getItem('sso_logout');
    return logoutData ? JSON.parse(logoutData) : null;
  } catch (error) {
    console.error('Error parsing logout event data:', error);
    return null;
  }
};
