import { environment } from '@/config';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

type ApplicationVisibility = {
  id: number;
  unitId: string;
  unitName: string;
  department: string;
  grade: string;
  empType: string;
  createdDate: string;
  modifiedDate: string;
  isActive: boolean;
  applicationId: number;
  applicationName: string | null;
};

type Application = {
  id: number;
  categoryId: number | null;
  name: string;
  hindiName: string | null;
  icon: string | null;
  sortingOrder: number;
  description: string | null;
  appUrl: string | null;
  bgColor: string | null;
  createdDate: string;
  modifiedDate: string;
  isActive: boolean;
  applicationVisibilities: ApplicationVisibility[];
  favorites: any | null;
};

interface ApplicationsState {
  applications: Application[];
  status: boolean;
  error: string | null;
}

// ⏳ Initial state
const initialState: ApplicationsState = {
  applications: [],
  status: false,
  error: null,
};

// 🔁 Async thunk to fetch applications
export const fetchApplications = createAsyncThunk<
  Application[], // Return type
  void,
  { rejectValue: string }
>('applications/fetchApplications', async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${environment.orgHierarchy}/MobileVisibility/GetApplications`);
    return response.data.data as Application[];
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data || 'Something went wrong');
  }
});

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.status = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action: PayloadAction<Application[]>) => {
        state.status = false;
        state.applications = action.payload;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.status = false;
        state.error = action.payload || 'Failed to fetch applications';
      });
  },
});

export default applicationsSlice.reducer;
