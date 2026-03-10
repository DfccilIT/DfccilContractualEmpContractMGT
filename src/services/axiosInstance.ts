import axios from 'axios';
import { environment } from '@/config';
import { clearAllStorage, getObjectFromSessionStorage } from '@/lib/helperFunction';
import toast from 'react-hot-toast';
import logger from '@/lib/logger';
import { oidcConfig } from '@/auth/config';
import { RootState } from '@/app/store';
let reduxStore: any = null;
export const injectStore = (store: any) => {
  reduxStore = store;
};
const axiosInstance = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const tokenData = getObjectFromSessionStorage(`oidc.user:${oidcConfig.authority}:${oidcConfig.client_id}`);
    const accessToken = tokenData?.access_token;
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    if (reduxStore) {
      const state = reduxStore.getState() as RootState;
      const decodedToken = state.tokenData;

      const isReadOnly = decodedToken?.decoded?.IsReadOnly === 'True';
      if (isReadOnly) {
        const method = (config.method || 'get').toLowerCase();
        const isWriteMethod = ['post', 'put', 'patch', 'delete'].includes(method);
        if (isWriteMethod) {
          toast.error('You are not authorized to perform this action.');
          // Cancel this request before it hits server
          return Promise.reject(new axios.Cancel('READ_ONLY_MODE'));
        }
      }
    }
    config.headers['DeviceType'] = 'web';
    return config;
  },
  (error) => {
    logger.error(error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      toast.error('Your session has expired. Please log in again.');
      clearAllStorage();
      setTimeout(() => {
        window.location.href = environment.exitUrl;
      }, 500);
    }

    // Make sure error.response exists before accessing its status
    if (error.response && error.response.status === 401) {
      toast.error('Authorization failed. Your session has expired. Redirecting to login...');
      clearAllStorage();
      setTimeout(() => {
        window.location.href = environment.exitUrl;
      }, 500);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
