import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/app/store';
import axiosInstance from '@/services/axiosInstance';

export interface Role {
  roleId: number;
  roleName: string;
}

export interface User {
  empCode: number;
  unit: string;
  roles: Role[];
}

interface RoleState {
  userList: Role[];
  loading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  userList: [],
  loading: false,
  error: null,
};

export const fetchEmpRoleList = createAsyncThunk<Role[], void, { rejectValue: string }>('roles/GetEmpRoleList', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/User/GetEmpRoleList');
    return response.data.data as Role[];
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch roles';
    return rejectWithValue(errorMessage);
  }
});

export const empRoleListSlice = createSlice({
  name: 'empRoleList',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmpRoleList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmpRoleList.fulfilled, (state, action: PayloadAction<Role[]>) => {
        state.userList = action.payload;
        state.loading = false;
      })
      .addCase(fetchEmpRoleList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An unknown error occurred';
      });
  },
});

export default empRoleListSlice.reducer;
