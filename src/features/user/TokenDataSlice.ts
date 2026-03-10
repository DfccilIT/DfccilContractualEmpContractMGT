import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { AppDispatch, RootState } from '@/app/store';
import { oidcConfig } from '@/auth/config';

interface TokenPayload {
  [key: string]: any;
}

interface TokenState {
  token: string | null;
  decoded: TokenPayload | null;
  isAuthenticated: boolean;
  isExpired: boolean;
}

const initialState: TokenState = {
  token: null,
  decoded: null,
  isAuthenticated: false,
  isExpired: true,
};

export const loadTokenFromSession = () => (dispatch: AppDispatch) => {
  try {
    const key = `oidc.user:${oidcConfig.authority}:${oidcConfig.client_id}`;

    const raw = sessionStorage.getItem(key);

    const tokenData = raw ? JSON.parse(raw) : null;

    const accessToken = tokenData?.access_token || null;
    dispatch(setToken(accessToken));
  } catch (error) {
    console.error('Error loading token from session:', error);
    dispatch(setToken(null));
  }
};

const tokenDataSlice = createSlice({
  name: 'tokenData',
  initialState,
  reducers: {
    setToken(state, action) {
      const token = action.payload;
      if (!token) {
        state.token = null;
        state.decoded = null;
        state.isAuthenticated = false;
        state.isExpired = true;
        return;
      }

      // Decode token using jwt-decode
      let decodedToken: TokenPayload | null = null;
      try {
        decodedToken = jwtDecode<TokenPayload>(token);
      } catch (e) {
        console.error('JWT decode failed:', e);
      }

      state.token = token;
      state.decoded = decodedToken;

      // Check expiry from exp claim
      const now = Math.floor(Date.now() / 1000);
      const isExpired = decodedToken?.exp ? decodedToken.exp < now : true;

      state.isExpired = isExpired;
      state.isAuthenticated = !isExpired;
    },

    clearToken(state) {
      state.token = null;
      state.decoded = null;
      state.isAuthenticated = false;
      state.isExpired = true;
    },
  },
});

export const { setToken, clearToken } = tokenDataSlice.actions;
export default tokenDataSlice.reducer;

export const selectTokenData = (state: RootState) => state.tokenData;
