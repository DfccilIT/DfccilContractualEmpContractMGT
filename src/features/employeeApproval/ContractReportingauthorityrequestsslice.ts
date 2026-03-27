import axiosInstance from '@/services/axiosInstance';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import toast from 'react-hot-toast';

export const fetchContractReportingAuthorityRequests = createAsyncThunk(
  '/fetchRequests/fetchContractReportingAuthorityRequests',
  async ({ employeeCode, location, userName }: { employeeCode: string; location: string; userName: string }) => {
    try {
      let url = '/ModuleManagement/ModuleMangement/GetAllReportingOfficerRequestForContractual';
      if (location && location !== 'All Units') {
        url += `?location=${encodeURIComponent(location)}`;
      }
      const response = await axiosInstance.get(url);
      return response.data.data;
    } catch (err) {
      console.error('error', err);
      toast.error('Error in fetching reporting authority requests');
      throw err;
    }
  }
);

const fetchContractReportingAuthorityRequestsSlice = createSlice({
  name: 'fetchRequests',
  initialState: {
    loading: false,
    error: null,
    data: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContractReportingAuthorityRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContractReportingAuthorityRequests.fulfilled, (state, action) => {
        (state.loading = false), (state.data = action.payload);
      })
      .addCase(fetchContractReportingAuthorityRequests.rejected, (state, action) => {
        (state.loading = false), (state.error = action.error.message);
      });
  },
});

export default fetchContractReportingAuthorityRequestsSlice.reducer;
