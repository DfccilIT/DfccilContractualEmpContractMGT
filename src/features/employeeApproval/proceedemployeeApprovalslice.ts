import axiosInstance from '@/services/axiosInstance';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import toast from 'react-hot-toast';

export const proceedEmployeeApprovalRequests = createAsyncThunk('/profileupdateRequest/proceedEmployeeApprovalRequests', async (request: any) => {
  try {
    const requestBody = {
      contraualEmployeeRequestId: request.contractualEmployeeRequestId,
      isApproved: request.isApproved,
      contractId: String(request.contractId),
      remarks: request.remarks,
    };

    const response = await axiosInstance.put('/ModuleManagement/ProcessContractualEmployeeRequest', requestBody);
    if (response?.data?.statusCode === 200) {
      toast.success(request.isApproved ? 'Request approved successfully' : 'Request rejected successfully');
      return response.data;
    } else {
      toast.error(response.data.message);
      return false;
    }
  } catch (err) {
    console.error('error', err);
    toast.error('Error in processing profile change request');
    throw err;
  }
});

const proceedEmployeeApprovalRequestsSlice = createSlice({
  name: 'profileupdateRequest',
  initialState: {
    loading: false,
    error: null,
    data: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(proceedEmployeeApprovalRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(proceedEmployeeApprovalRequests.fulfilled, (state, action) => {
        ((state.loading = false), (state.data = action.payload));
      })
      .addCase(proceedEmployeeApprovalRequests.rejected, (state, action) => {
        ((state.loading = false), (state.error = action.error.message));
      });
  },
});

export default proceedEmployeeApprovalRequestsSlice.reducer;
