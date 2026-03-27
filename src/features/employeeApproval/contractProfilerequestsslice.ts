import axiosInstance from '@/services/axiosInstance';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import toast from 'react-hot-toast';

export const contractProfileChangeRequest = createAsyncThunk(
  '/fetchRequests/contractProfileChangeRequest',
  async ({ employeeCode, location, userName }: { employeeCode: string; location: string; userName: string }) => {
    try {
      let url = '/ModuleManagement/ModuleMangement/GetAllEditEmployeeRequestForContractual';
      if (location && location !== 'All Units') {
        url += `?&location=${encodeURIComponent(location)}`;
      }
      const response = await axiosInstance.get(url);
      return response.data.data;
    } catch (err) {
      console.error('error', err);
      toast.error('Error in fetching reporting officer requests');
      throw err;
    }
  }
);

const contractProfileChangeRequestSlice = createSlice({
  name: 'fetchRequests',
  initialState: {
    loading: false,
    error: null,
    data: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(contractProfileChangeRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(contractProfileChangeRequest.fulfilled, (state, action) => {
        (state.loading = false), (state.data = action.payload);
      })
      .addCase(contractProfileChangeRequest.rejected, (state, action) => {
        (state.loading = false), (state.error = action.error.message);
      });
  },
});

export default contractProfileChangeRequestSlice.reducer;
