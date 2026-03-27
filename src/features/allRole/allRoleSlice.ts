import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/app/store';
import axiosInstance from '@/services/axiosInstance';

export interface Role {
  roleId: number;
  roleName: string;
  description: string;
}

interface RoleState {
  roles: Role[];
  loading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  roles: [],
  loading: false,
  error: null,
};

export const fetchRoles = createAsyncThunk<Role[], void, { rejectValue: string }>('roles/fetchRoles', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/User/GetAllRoles');
    return response.data.data as Role[];
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch roles';
    return rejectWithValue(errorMessage);
  }
});

export const allRoleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<Role[]>) => {
        state.roles = action.payload;
        state.loading = false;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An unknown error occurred';
      });
  },
});

export default allRoleSlice.reducer;
