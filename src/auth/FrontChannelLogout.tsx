import { environment } from '@/config';
import { broadcastLogoutEvent } from '@/auth/globalLogoutSync';
import { UserManager } from 'oidc-client-ts';
import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useSearchParams } from 'react-router';
import { clearAllStorage } from '@/lib/helperFunction';

const FrontChannelLogout: React.FC = () => {
  const auth = useAuth();
  const [status, setStatus] = useState<'processing' | 'done' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const performLogout = async () => {
      try {
        const sid = searchParams.get('sid');
        const iss = searchParams.get('iss');
        // Validate required parameters
        if (!sid) {
          console.warn('No session ID (sid) provided in logout request');
        }

        // Validate issuer
        const expectedIssuer = auth.settings.authority;
        if (iss && iss !== expectedIssuer) {
          console.warn('Issuer mismatch:', { received: iss, expected: expectedIssuer });
          setErrorMessage('Invalid logout request - issuer mismatch');
          setStatus('error');
          return;
        }

        // Create UserManager instance
        const userManager = new UserManager(auth.settings);
        const user = await userManager.getUser();

        if (user && !user.expired) {
          // Clear authentication data and remove user
          clearAllStorage();
          await userManager.removeUser();
        } else {
          clearAllStorage();
        }

        // Broadcast logout event to other tabs/windows
        broadcastLogoutEvent(sid);

        // Notify parent window if running in iframe
        if (window.parent !== window) {
          window.parent.postMessage(
            {
              type: 'frontchannel-logout-complete',
              origin: window.location.origin,
              sid: sid,
            },
            '*'
          );
        }

        console.log('Front-channel logout completed successfully');
        setStatus('done');
      } catch (err) {
        console.error('Front-channel logout error:', err);
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error occurred');
        setStatus('error');
      }
    };

    performLogout();
  }, [auth]);

  // Only show visible UI if not running inside an iframe
  const isIframe = window.parent !== window;

  if (isIframe) {
    return null; // Hidden iframe
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9f9f9',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          maxWidth: '400px',
        }}
      >
        {status === 'processing' && (
          <>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem',
              }}
            />
            <h2 style={{ color: '#333', marginBottom: '0.5rem' }}>Logging out...</h2>
            <p>Processing logout request...</p>
          </>
        )}

        {status === 'done' && (
          <>
            <div
              style={{
                color: '#28a745',
                fontSize: '48px',
                marginBottom: '1rem',
              }}
            >
              ✓
            </div>
            <h2 style={{ color: '#333', marginBottom: '0.5rem' }}>Logout Complete</h2>
            <p>You have been successfully logged out. You may close this window.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div
              style={{
                color: '#dc3545',
                fontSize: '48px',
                marginBottom: '1rem',
              }}
            >
              ✗
            </div>
            <h2 style={{ color: '#333', marginBottom: '0.5rem' }}>Logout Error</h2>
            <p>An error occurred during logout: {errorMessage}</p>
            <button
              onClick={() => window.close()}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Close Window
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FrontChannelLogout;
