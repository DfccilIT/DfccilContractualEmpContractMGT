import axiosInstance from '@/services/axiosInstance';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

interface DeactivateEmployeeRequest {
  employeeCodes: string[];
}

export const deactivateContractualEmployee = createAsyncThunk(
  '/employeeApproval/deactivateContractualEmployee',
  async (request: DeactivateEmployeeRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/ModuleManagement/ContractualEmployeeDeactivate', {
        employeeCodes: request.employeeCodes,
        isApproved:true,
      });

      toast.success('Employee account deactivated successfully');
      return response.data;
    } catch (err: any) {
      console.error('error', err);
      toast.error(err?.response?.data?.message || 'Error deactivating employee account');
      return rejectWithValue(err.response?.data?.message || 'Error deactivating employee');
    }
  }
);

interface DeactivateEmployeeState {
  loading: boolean;
  error: string | null;
  data: any | null;
}

const initialState: DeactivateEmployeeState = {
  loading: false,
  error: null,
  data: null,
};

const deactivateEmployeeSlice = createSlice({
  name: 'deactivateEmployee',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearData: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deactivateContractualEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateContractualEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(deactivateContractualEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearData } = deactivateEmployeeSlice.actions;
export default deactivateEmployeeSlice.reducer;
