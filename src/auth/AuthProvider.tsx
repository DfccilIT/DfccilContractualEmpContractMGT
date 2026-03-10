import { AuthProvider as OIDCProvider } from 'react-oidc-context';
import { oidcConfig } from './config';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <OIDCProvider {...oidcConfig}>{children}</OIDCProvider>;
};
