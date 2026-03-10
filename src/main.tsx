import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router';
import { Provider } from 'react-redux';
import { persister, store } from './app/store.ts';
import { PersistGate } from 'redux-persist/integration/react';
import { injectStore } from './services/axiosInstance';
import { clearOldSessionStorage } from './services/ssoService';
injectStore(store);
clearOldSessionStorage();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={<div>Loading...</div>} persistor={persister}>
          <App />
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
