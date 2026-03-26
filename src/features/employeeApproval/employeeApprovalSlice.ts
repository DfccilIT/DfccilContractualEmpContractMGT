import axiosInstance from '@/services/axiosInstance';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
interface FetchRequestsPayload {
  Status: number;
  unitId: number;
}
export const fetchEmployeeApprovalRequests = createAsyncThunk('/fetchRequests/fetchEmployeeApprovalRequests', async (unitId: number, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`/ModuleManagement/GetAllContractualEmployeeRequests/${unitId}`);
    return response.data.data;
  } catch (err) {
    console.error('error', err);
    toast.error('Error fetching employee approval requests');
    return rejectWithValue(err.response?.data?.message || 'Error fetching requests');
  }
});

export const fetchEmployeeAcceptRejectRequests = createAsyncThunk(
  '/fetchRequests/fetchEmployeeAcceptRejectRequests',
  async (payload: FetchRequestsPayload, { rejectWithValue }) => {
    const { Status, unitId } = payload;
    try {
      const response = await axiosInstance.get(`/ModuleManagement/GetAcceptOrRejectContractualEmployeeRequests/${Status}/${unitId}`);
      const sortedData = response.data.data.sort((a, b) => {
        const dateA = new Date(a.modify_Date);
        const dateB = new Date(b.modify_Date);
        return dateB - dateA;
      });
      return sortedData;
    } catch (err) {
      console.error('error', err);
      const statusText = Status === 0 ? 'accepted' : Status === 9 ? 'rejected' : 'filtered';
      toast.error(`Error fetching ${statusText} employee requests`);
      return rejectWithValue(err.response?.data?.message || 'Error fetching requests');
    }
  }
);

interface EmployeeApprovalState {
  loading: boolean;
  error: string | null;
  data: any[] | null;
}

const initialState: EmployeeApprovalState = {
  loading: false,
  error: null,
  data: null,
};

const fetchEmployeeApprovalRequestsSlice = createSlice({
  name: 'fetchRequests',
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
      // fetchEmployeeApprovalRequests cases
      .addCase(fetchEmployeeApprovalRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeApprovalRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeeApprovalRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = null;
      })
      // fetchEmployeeAcceptRejectRequests cases
      .addCase(fetchEmployeeAcceptRejectRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeAcceptRejectRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeeAcceptRejectRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = null;
      });
  },
});

export const { clearError, clearData } = fetchEmployeeApprovalRequestsSlice.actions;
export default fetchEmployeeApprovalRequestsSlice.reducer;
