const LOGOUT_CHANNEL_NAME = 'auth-logout-channel';
const LOGOUT_EVENT_KEY = 'auth-logout-event';
const LOGOUT_TIMESTAMP_KEY = 'auth-logout-timestamp';

// Initialize BroadcastChannel if supported by the browser
let logoutChannel: BroadcastChannel | null = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    logoutChannel = new BroadcastChannel(LOGOUT_CHANNEL_NAME);
  }
} catch (error) {
  console.warn('BroadcastChannel not supported, falling back to localStorage', error);
}

/**
 * Broadcast logout event to all tabs and windows
 * @param sessionId Optional session ID for validation
 */
export function broadcastLogoutEvent(sessionId?: string | null) {
  const logoutData = {
    type: 'logout',
    timestamp: Date.now(),
    sessionId: sessionId || null,
    origin: window.location.origin,
  };

  // Use BroadcastChannel for same-origin tabs
  if (logoutChannel) {
    try {
      logoutChannel.postMessage(logoutData);
    } catch (error) {
      console.error('Error broadcasting via channel:', error);
    }
  }

  // Always use localStorage as fallback
  try {
    // Store the event data
    localStorage.setItem(LOGOUT_EVENT_KEY, JSON.stringify(logoutData));
    // Update timestamp to trigger storage event
    localStorage.setItem(LOGOUT_TIMESTAMP_KEY, Date.now().toString());
    // Clean up after a short delay
    setTimeout(() => {
      localStorage.removeItem(LOGOUT_EVENT_KEY);
    }, 1000);
  } catch (error) {
    console.error('Error broadcasting via localStorage:', error);
  }
}

/**
 * Listen for logout events across tabs and execute callback when detected
 * @param callback Function to execute when logout is detected
 * @returns Cleanup function to remove listeners
 */
export function listenForLogout(callback: () => Promise<void> | void) {
  const storageListener = (event: StorageEvent) => {
    if (event.key === LOGOUT_TIMESTAMP_KEY || event.key === LOGOUT_EVENT_KEY) {
      try {
        const logoutData = localStorage.getItem(LOGOUT_EVENT_KEY);
        if (logoutData) {
          const data = JSON.parse(logoutData);
          if (data.type === 'logout') {
            console.log('Logout detected via localStorage event', data);
            callback();
          }
        }
      } catch (error) {
        console.error('Error processing logout storage event:', error);
      }
    }
  };

  const channelListener = (event: MessageEvent) => {
    if (event.data && event.data.type === 'logout') {
      console.log('Logout detected via BroadcastChannel', event.data);
      callback();
    }
  };

  // Add event listeners
  if (logoutChannel) {
    logoutChannel.addEventListener('message', channelListener);
  }
  window.addEventListener('storage', storageListener);

  // Return cleanup function
  return () => {
    if (logoutChannel) {
      logoutChannel.removeEventListener('message', channelListener);
    }
    window.removeEventListener('storage', storageListener);
  };
}

/**
 * Check if a logout event is currently in progress
 * @returns Boolean indicating if logout was recently triggered
 */
export function isLogoutInProgress(): boolean {
  try {
    const logoutData = localStorage.getItem(LOGOUT_EVENT_KEY);
    if (!logoutData) return false;

    const data = JSON.parse(logoutData);
    const now = Date.now();
    // Consider logout in progress if event was within last 5 seconds
    return data.timestamp > now - 5000;
  } catch (error) {
    console.error('Error checking logout status:', error);
    return false;
  }
}
