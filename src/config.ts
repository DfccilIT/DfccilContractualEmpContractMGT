const DFCCIL_UAT = {
  apiUrl: 'https://uatdmsapi.dfccil.com/api',
  orgHierarchy: 'https://uatorganization.dfccil.com/api',
  logoutUrl: 'http://uat.dfccil.com/DfcHome',
  exitUrl: 'http://uatlogin.dfccil.com/applications',
  authUrl: 'https://app2.dfccil.com',
  clientId: '958d19e3e7c244c589d551433ad844c8',
  postLogout: 'https://uatlogin.dfccil.com/signout',
  redirectPath: 'transfer-request',
  applicationId: 52,
};

const DFCCIL_PROD = {
  apiUrl: 'https://uatndaapi.dfccil.com/api',
  orgHierarchy: 'https://orgsvc.dfccil.com/api',
  logoutUrl: 'https://it.dfccil.com/Home/Home',
  exitUrl: 'http://uatlogin.dfccil.com/applications',
  authUrl: 'https://app2.dfccil.com',
  clientId: '071ed846a328407ab65d9a1d9a23847a',
  postLogout: 'https://uatlogin.dfccil.com/signout',
  redirectPath: 'transfer-request',
  applicationId: 4,
};

// https://github.com/DfccilIT/TransferModuleFrontEnd.git

export const environment = DFCCIL_UAT;

export const SESSION_CHECK_INTERVAL = 20 * 60 * 1000;
