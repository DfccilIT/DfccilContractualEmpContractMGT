import axios from 'axios';
import { environment } from '@/config';
import { UserManager } from 'oidc-client-ts';
import { oidcConfig } from '@/auth/config';
import { clearAllStorage } from '@/lib/helperFunction';

const api = axios.create({
  baseURL: environment.authUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    accept: 'text/plain',
  },
});

export const clearUserSwitchFlags = () => {
  try {
    localStorage.removeItem('user_switch_in_progress');
    localStorage.removeItem('user_switch_timestamp');
    localStorage.removeItem('old_session_ids'); // Clear old session tracking
    console.log('User switch flags cleared');
  } catch (error) {
    console.error('Error clearing user switch flags:', error);
  }
};

/**
 * Check if a user switch is currently in progress
 * @returns boolean indicating if a switch is in progress (within last 10 seconds)
 * Note: Using localStorage (not sessionStorage) so flags are accessible in iframes
 */
export const isUserSwitchInProgress = (): boolean => {
  try {
    const switchInProgress = localStorage.getItem('user_switch_in_progress');
    const switchTimestamp = localStorage.getItem('user_switch_timestamp');

    if (switchInProgress === 'true' && switchTimestamp) {
      const timeSinceSwitch = Date.now() - parseInt(switchTimestamp, 10);
      return timeSinceSwitch < 10000; // 10 seconds
    }
    return false;
  } catch (error) {
    console.error('Error checking user switch status:', error);
    return false;
  }
};

/**
 * Store the current session ID as "old" before switching
 * This allows us to ignore front-channel logout requests for old sessions
 */
export const markSessionAsOld = (sessionId: string | null | undefined) => {
  if (!sessionId) return;

  try {
    const oldSessionIds = getOldSessionIds();
    oldSessionIds.push(sessionId);
    // Keep only last 5 session IDs to prevent unlimited growth
    const recentSessions = oldSessionIds.slice(-5);
    localStorage.setItem('old_session_ids', JSON.stringify(recentSessions));
    // console.log('[SessionTracking] Marked session as old:', sessionId);
  } catch (error) {
    console.error('Error marking session as old:', error);
  }
};

/**
 * Get list of old session IDs that should be ignored in front-channel logout
 */
export const getOldSessionIds = (): string[] => {
  try {
    const stored = localStorage.getItem('old_session_ids');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting old session IDs:', error);
    return [];
  }
};

/**
 * Check if a session ID is from an old (switched away) session
 * @param sessionId - The session ID from front-channel logout request
 * @returns true if this is an old session that should be ignored
 */
export const isOldSession = (sessionId: string | null | undefined): boolean => {
  if (!sessionId) return false;

  try {
    const oldSessionIds = getOldSessionIds();
    const isOld = oldSessionIds.includes(sessionId);
    // console.log('[SessionTracking] Checking if session is old:', {
    //   sessionId,
    //   isOld,
    //   oldSessions: oldSessionIds,
    // });
    return isOld;
  } catch (error) {
    console.error('Error checking if session is old:', error);
    return false;
  }
};

/**
 * Check if the current stored OIDC session is old and clear it if necessary
 * This prevents tabs from trying to authenticate with old session data after a user switch
 * Call this BEFORE initializing the AuthProvider
 */
export const clearOldSessionStorage = () => {
  try {
    const oidcKey = `oidc.user:${oidcConfig.authority}:${oidcConfig.client_id}`;
    const storedUserData = sessionStorage.getItem(oidcKey);

    if (!storedUserData) {
      console.log('[SessionCheck] No stored session found');
      return;
    }

    // Parse the stored user data to get the session ID
    const userData = JSON.parse(storedUserData);
    const storedSessionId = userData?.profile?.sid;

    if (!storedSessionId) {
      console.log('[SessionCheck] No session ID in stored data');
      return;
    }

    // Check if this stored session is marked as old
    if (isOldSession(storedSessionId)) {
      console.warn('[SessionCheck] ⚠️ Stored session is OLD - clearing to prevent endsession callback');
      console.warn('[SessionCheck] Old session ID:', storedSessionId);

      // Clear ALL OIDC storage to prevent authentication with old session
      const keysToRemove: string[] = [];

      // Check sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.includes('oidc')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => {
        sessionStorage.removeItem(key);
        console.log('[SessionCheck] Removed:', key);
      });

      console.log('[SessionCheck] ✓ Old session storage cleared - will force fresh login');
    } else {
      console.log('[SessionCheck] ✓ Stored session is current (not old)');
    }
  } catch (error) {
    console.error('[SessionCheck] Error checking/clearing old session:', error);
  }
};

export interface DelegateUser {
  userId: string;
  userName: string;
  displayName: string;
  email: string;
  designation: string;
  department: string;
  mobileNo: string;
  applications?: Array<{
    applicationId: string;
    applicationName: string;
  }>;
  validUntil?: string;
}

export interface DelegateUsersResponse {
  success: boolean;
  authenticatedUser: {
    userId: string;
    userName: string;
    displayName: string;
    email: string;
    designation: string;
  };
  delegateUsers: DelegateUser[];
  totalDelegates: number;
}

/**
 * Fetch available delegate users for current authenticated user
 */
export const getAvailableDelegateUsers = async (): Promise<DelegateUsersResponse> => {
  try {
    const response = await api.get('/api/delegate-users');
    return response.data;
  } catch (error) {
    console.error('Error fetching delegate users:', error);
    throw error;
  }
};

/**
 * Switch to a delegate user (redirect method)
 * This will properly terminate the current session and redirect to SSO switch endpoint
 * Similar to logout flow but redirects to switch endpoint instead
 */
export const switchUserRedirect = async (targetUserId: string, returnUrl?: string) => {
  try {
    const currentUrl = returnUrl || window.location.href;
    const userManager = new UserManager(oidcConfig);

    console.log('Starting user switch process:', { targetUserId, returnUrl: currentUrl });

    // Get current user to check session and mark it as old
    const currentUser = await userManager.getUser();

    // IMPORTANT: Mark the current session as "old" so front-channel logout for it will be ignored
    if (currentUser?.profile?.sid) {
      markSessionAsOld(currentUser.profile.sid);
    }

    // IMPORTANT: Set flag to indicate this is a user switch, not a logout
    // This prevents front-channel logout from triggering during the switch
    // Using localStorage (not sessionStorage) so it's accessible in front-channel logout iframe
    localStorage.setItem('user_switch_in_progress', 'true');
    localStorage.setItem('user_switch_timestamp', Date.now().toString());

    console.log('[UserSwitch] Flags set:', {
      flag: localStorage.getItem('user_switch_in_progress'),
      timestamp: localStorage.getItem('user_switch_timestamp'),
      oldSessionMarked: currentUser?.profile?.sid,
    });

    if (currentUser && !currentUser.expired) {
      console.log('Removing current user session');
      // Remove current user from UserManager
      await userManager.removeUser();
    }

    // Clear all local storage, session storage, and cookies
    // Note: clearAllStorage() automatically preserves the user switch flags
    clearAllStorage();

    console.log('[UserSwitch] After clearAllStorage, flags:', {
      flag: localStorage.getItem('user_switch_in_progress'),
      timestamp: localStorage.getItem('user_switch_timestamp'),
    });

    console.log('Session cleared, redirecting to SSO switch endpoint');

    // Build switch URL
    const switchUrl = `${environment.authUrl}/connect/switch?target_user_id=${encodeURIComponent(targetUserId)}&return_url=${encodeURIComponent(
      currentUrl
    )}&client_id=${encodeURIComponent(environment.clientId)}&state=${Date.now()}`;

    // Redirect to SSO switch endpoint (prevent back navigation)
    window.location.replace(switchUrl);
  } catch (error) {
    console.error('Error during user switch:', error);
    // Fallback: clear storage and redirect anyway
    localStorage.setItem('user_switch_in_progress', 'true');
    localStorage.setItem('user_switch_timestamp', Date.now().toString());
    // clearAllStorage() will preserve the flags automatically
    clearAllStorage();
    const currentUrl = returnUrl || window.location.href;
    const switchUrl = `${environment.authUrl}/connect/switch?target_user_id=${encodeURIComponent(targetUserId)}&return_url=${encodeURIComponent(
      currentUrl
    )}&client_id=${encodeURIComponent(environment.clientId)}&state=${Date.now()}`;
    window.location.replace(switchUrl);
  }
};

/**
 * Switch to a delegate user (API method)
 * Returns promise with result, but still requires page refresh for new tokens
 */
export const switchUserApi = async (targetUserId: string, clientId?: string) => {
  try {
    const response = await api.post('/api/switch-user', {
      targetUserId,
      clientId: clientId || environment.clientId,
    });
    return response.data;
  } catch (error) {
    console.error('Error switching user:', error);
    throw error;
  }
};

/**
 * Return to original user (if currently delegated)
 * This will terminate the delegated session and restore the original user session
 *
 * @param originalUserId - The original user's employee code (delegateeEmpCode)
 */
export const returnToOriginalUser = async (originalUserId?: string | null) => {
  try {
    const currentUrl = window.location.href;
    const userManager = new UserManager(oidcConfig);
    const currentUser = await userManager.getUser();

    // IMPORTANT: Mark the current (delegated) session as "old" so front-channel logout for it will be ignored
    if (currentUser?.profile?.sid) {
      markSessionAsOld(currentUser.profile.sid);
    }
    localStorage.setItem('user_switch_in_progress', 'true');
    localStorage.setItem('user_switch_timestamp', Date.now().toString());

    console.log('[ReturnToOriginal] Flags set:', {
      flag: localStorage.getItem('user_switch_in_progress'),
      timestamp: localStorage.getItem('user_switch_timestamp'),
      oldSessionMarked: currentUser?.profile?.sid,
    });

    if (currentUser && !currentUser.expired) {
      console.log('Removing delegated user session');
      // Remove current delegated user from UserManager
      await userManager.removeUser();
    }

    // Clear all local storage, session storage, and cookies
    // Note: clearAllStorage() automatically preserves the user switch flags
    clearAllStorage();

    console.log('[ReturnToOriginal] After clearAllStorage, flags:', {
      flag: localStorage.getItem('user_switch_in_progress'),
      timestamp: localStorage.getItem('user_switch_timestamp'),
    });

    console.log('Session cleared, redirecting to switch endpoint to restore original user');

    // Build switch URL - try multiple approaches based on what original user ID we have
    let switchUrl: string;

    if (originalUserId) {
      // APPROACH 1: Use the actual original user's ID from delegateeEmpCode
      switchUrl = `${environment.authUrl}/connect/switch?target_user_id=${encodeURIComponent(originalUserId)}&return_url=${encodeURIComponent(
        currentUrl
      )}&client_id=${encodeURIComponent(environment.clientId)}&state=return_${Date.now()}`;
      console.log('Using original user ID:', originalUserId);
    } else {
      // APPROACH 2: Use "ORIGINAL" as a special keyword (if your SSO supports it)
      switchUrl = `${environment.authUrl}/connect/switch?target_user_id=ORIGINAL&return_url=${encodeURIComponent(currentUrl)}&client_id=${encodeURIComponent(
        environment.clientId
      )}&state=return_${Date.now()}`;
      console.log('Using ORIGINAL keyword');
    }

    console.log('Redirecting to:', switchUrl);

    // Redirect to switch endpoint
    window.location.replace(switchUrl);
  } catch (error) {
    console.error('Error returning to original user:', error);
    // Fallback: Try logout approach
    try {
      const currentUrl = window.location.href;
      clearAllStorage();

      // Redirect to logout which might restore session
      const logoutUrl = `${environment.authUrl}/connect/endsession?post_logout_redirect_uri=${encodeURIComponent(currentUrl)}&client_id=${encodeURIComponent(
        environment.clientId
      )}`;

      console.log('Fallback: Using logout approach');
      window.location.replace(logoutUrl);
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      clearAllStorage();
      window.location.replace(window.location.origin + '/home');
    }
  }
};
