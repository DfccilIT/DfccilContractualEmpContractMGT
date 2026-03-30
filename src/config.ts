const DFCCIL_UAT = {
  apiUrl: 'https://uatdmsapi.dfccil.com/api',
  orgHierarchy: 'https://uatorganization.dfccil.com/api',
  logoutUrl: 'http://uat.dfccil.com/DfcHome',
  exitUrl: 'https://uatlogin.dfccil.com/applications',
  authUrl: 'https://app2.dfccil.com',
  clientId: '11c5d7b6f43c4127a997ad1096b41926',
  postLogout: 'https://uatlogin.dfccil.com/signout',
  redirectPath: 'manage-contract',
  applicationId: 79,
};

const DFCCIL_PROD = {
  apiUrl: 'https://dmsapi.dfccil.com/api',
  orgHierarchy: 'https://orgsvc.dfccil.com/api',
  logoutUrl: 'https://it.dfccil.com/Home/Home',
  exitUrl: 'https://dashboard.dfccil.com/applications',
  authUrl: 'https://auth.dfccil.com',
  clientId: '61304a607f6947b285618a5775b65674',
  postLogout: 'https://dashboard.dfccil.com/signout',
  redirectPath: 'manage-contract',
  applicationId: 75,
};


export const environment = DFCCIL_UAT;

export const SESSION_CHECK_INTERVAL = 20 * 60 * 1000;
