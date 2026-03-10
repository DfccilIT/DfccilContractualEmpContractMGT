import { environment } from '@/config';

export const oidcConfig = {
  authority: environment.authUrl,
  client_id: environment.clientId,
  redirect_uri: `${window.location.origin}/${environment.redirectPath}`,
  post_logout_redirect_uri: environment.postLogout,
  frontchannel_logout_uri: `${window.location.origin}/logout-notification`,
  frontchannel_logout_session_required: true,
  silent_redirect_uri: `${window.location.origin}/silent-renew.html`,
  response_type: 'code',
  scope: 'openid profile api1',
  automaticSilentRenew: true,
  monitorSession: true,
  checkSessionInterval: 30000,
  loadUserInfo: true,
  revokeAccessTokenOnSignout: true,
  accessTokenExpiringNotificationTime: 60,
  storeAuthStateInCookie: true,
  metadata: {
    authorization_endpoint: `${environment.authUrl}/connect/authorize`,
    token_endpoint: `${environment.authUrl}/connect/token`,
    userinfo_endpoint: `${environment.authUrl}/connect/userinfo`,
    end_session_endpoint: `${environment.authUrl}/connect/endsession`,
    frontchannel_logout_supported: true,
    frontchannel_logout_session_supported: true,
  },
};
