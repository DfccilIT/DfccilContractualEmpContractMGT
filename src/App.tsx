import React from 'react';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallbackUI from './components/common/ErrorFallbackUI';
import { AuthProvider } from './auth/AuthProvider';
import { useAppSelector } from './app/hooks';
import { RootState } from './app/store';
import axios from 'axios';
import { environment } from './config';
import { useAppName } from './hooks/useAppName';

type ErrorSeverity = 1 | 2 | 3;

type ReportPayload = {
  appPlatform: number;
  appName: string;
  eventName: string;
  message: string;
  errorSeverity: ErrorSeverity;
  user_code?: string;
  ip?: string;
  endpoint?: string;
  status_code?: number;
  requestJSON?: string;
  isNotify_Admin: boolean;
};

async function reportError(payload: ReportPayload) {
  try {
    const response = await axios.post(`${environment.orgHierarchy}/Logger/SaveLog`, payload);
    console.log(response.data, 'response from the Error Fall Back');
  } catch (err) {
    console.log(err);
  }
}

function buildPayload(partial: Partial<ReportPayload>): ReportPayload {
  return {
    appPlatform: partial.appPlatform ?? 1,
    appName: partial.appName ?? (import.meta as any)?.env?.VITE_APP_NAME ?? 'WebApp',
    eventName: partial.eventName ?? 'UnknownEvent',
    message: partial.message ?? 'Unknown error',
    errorSeverity: partial.errorSeverity ?? 2,
    user_code: partial.user_code,
    ip: partial.ip || '0',
    endpoint: partial.endpoint ?? (typeof window !== 'undefined' ? window.location.pathname : ''),
    status_code: partial.status_code ?? 0,
    requestJSON: partial.requestJSON ?? '',
    isNotify_Admin: partial.isNotify_Admin ?? true,
  };
}

function safeStringify(obj: any) {
  try {
    return JSON.stringify(obj);
  } catch {
    return '';
  }
}
function BoundaryWrapper({ children }: { children: React.ReactNode }) {
  const { EmpCode } = useAppSelector((state: RootState) => state.user);
  const { name } = useAppName();
  return (
    <ErrorBoundary
      fallback={<ErrorFallbackUI />}
      onError={(error, info) => {
        reportError(
          buildPayload({
            appName: name,
            eventName: 'ReactError',
            message: error?.message ?? String(error),
            errorSeverity: 3,
            user_code: EmpCode,
            endpoint: window.location.pathname,
            requestJSON: safeStringify({ componentStack: info?.componentStack }),
          })
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
const App = () => {
  return (
    <div>
      <AuthProvider>
        <Toaster reverseOrder={false} toastOptions={{ duration: 4000, position: 'top-right' }} />
        <BoundaryWrapper>
          <AppRoutes />
        </BoundaryWrapper>
      </AuthProvider>
    </div>
  );
};
export default App;
