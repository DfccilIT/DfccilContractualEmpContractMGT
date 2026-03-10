import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { environment, SESSION_CHECK_INTERVAL } from '@/config';
import toast from 'react-hot-toast';
import { clearAllStorage } from '@/lib/helperFunction';

export const useSessionChecker = () => {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isAuthenticated) return;

    const checkSession = async () => {
      try {
        await auth.signinSilent();
        console.log('[Session] Silent renewal succeeded');
      } catch (error) {
        console.error('[Session] Silent renewal failed', error);
        toast.error('Session expired. Please log in again.');
        clearAllStorage();
        window.location.replace(environment.exitUrl);
      }
    };

    const intervalId = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [auth.isAuthenticated]);
};
