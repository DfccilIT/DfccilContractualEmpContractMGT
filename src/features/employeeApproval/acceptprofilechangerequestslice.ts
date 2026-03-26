import axiosInstance from '@/services/axiosInstance';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import toast from 'react-hot-toast';

export const acceptProfileChangeRequests = createAsyncThunk('/profileupdateRequest/acceptProfileChangeRequests', async (request:any) => {
  try {
    const requestBody = {
      employeeCode: request.employeeCode,
      isApproved: request.isApproved,
      remarks: request.remarks,
    };

    const response = await axiosInstance.put('/ModuleManagement/ModuleMangement/ProceedEditEmployeeRequest', requestBody);

    toast.success(request.isApproved ? 'Profile change request approved successfully' : 'Profile change request rejected successfully');

    return response.data;
  } catch (err) {
    console.error('error', err);
    toast.error('Error in processing profile change request');
    throw err;
  }
});
  
const acceptProfileChangeRequestsSlice = createSlice({
  name: 'profileupdateRequest',
  initialState: {
    loading: false,
    error: null,
    data: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(acceptProfileChangeRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptProfileChangeRequests.fulfilled, (state, action) => {
        (state.loading = false), (state.data = action.payload);
      })
      .addCase(acceptProfileChangeRequests.rejected, (state, action) => {
        (state.loading = false), (state.error = action.error.message);
      });
  },
});

export default acceptProfileChangeRequestsSlice.reducer;
