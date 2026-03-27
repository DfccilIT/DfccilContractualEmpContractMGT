import axiosInstance from '@/services/axiosInstance';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import toast from 'react-hot-toast';

export const fetchProfileChangeRequest = createAsyncThunk('/fetchRequests/fetchProfileChangeRequest', async () => {
  try {
    const response = await axiosInstance.get('/ModuleManagement/ModuleMangement/GetAllEditEmployeeRequest');
    return response.data.data;
  } catch (err) {
    console.error('error', err);
    toast.error('Error in Adding Employee of the Month');
  }
});

const fetchProfileChangeRequestSlice = createSlice({
  name: 'fetchRequests',
  initialState: {
    loading: false,
    error: null,
    data: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileChangeRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileChangeRequest.fulfilled, (state, action) => {
        (state.loading = false), (state.data = action.payload);
      })
      .addCase(fetchProfileChangeRequest.rejected, (state, action) => {
        (state.loading = false), (state.error = action.error.message);
      });
  },
});

export default fetchProfileChangeRequestSlice.reducer;
