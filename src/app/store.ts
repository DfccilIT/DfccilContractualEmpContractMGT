import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storageSession from 'redux-persist/lib/storage/session';
import { combineReducers } from 'redux';
import userReducer from '@/features/user/userSlice';
import applicationsReducer from '@/features/applications/applicationSlice';
import masterDataReducer from '../features/masterData/masterSlice';
import tokenDataReduer from '../features/user/TokenDataSlice';
import fetchContractReportingAuthorityRequestsReducer from '@/features/employeeApproval/ContractReportingauthorityrequestsslice';
import fetchEmployeeApprovalReducer from '@/features/employeeApproval/employeeApprovalSlice';
import contractProfileChangeRequestReducer from '@/features/employeeApproval/contractProfilerequestsslice';
import employeeReducer from '@/features/employee/employeeSlice';

const persistConfig = {
  key: 'root',
  storage: storageSession,
  whitelist: ['user', 'applications'],
};

const rootReducer = combineReducers({
  user: userReducer,
  applications: applicationsReducer,
    employee: employeeReducer,

  masterData: masterDataReducer,
  tokenData: tokenDataReduer,
  fetchContractReportingAuthorityRequests: fetchContractReportingAuthorityRequestsReducer,
  fetchEmployeeApproval: fetchEmployeeApprovalReducer,
  contractProfileChangeRequest: contractProfileChangeRequestReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persister = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
