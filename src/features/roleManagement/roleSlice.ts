import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/services/axiosInstance';

interface Role {
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

// 🔹 GET all roles
export const fetchRoles = createAsyncThunk('roles/fetchRoles', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/User/GetAllRoles');
    const { statusCode, data } = response.data;

    if (statusCode === 200) {
      return data;
    } else {
      return rejectWithValue('Failed to fetch roles');
    }
  } catch (error: any) {
    return rejectWithValue(error?.message || 'An error occurred');
  }
});

// 🔹 POST new role
export const createRole = createAsyncThunk('roles/createRole', async (payload: { roleName: string; description: string }, { rejectWithValue }) => {
  const newPayload = {
    name: payload.roleName.trim(),
    description: payload.description.trim(),
  };
  try {
    const response = await axiosInstance.post('/User/AddNewRole', newPayload);
    const { statusCode, message, data } = response.data;

    if (statusCode === 200) {
      return data; // assuming the new role object is returned
    } else {
      return rejectWithValue(message || 'Failed to create role');
    }
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Error creating role');
  }
});

const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    addRole: (state, action) => {
      state.roles.push(action.payload);
    },
    updateRole: (state, action) => {
      const idx = state.roles.findIndex((r) => r.roleId === action.payload.roleId);
      if (idx !== -1) {
        state.roles[idx] = action.payload;
      }
    },
    deleteRole: (state, action) => {
      state.roles = state.roles.filter((r) => r.roleId !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create role
      .addCase(createRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles.push(action.payload); // append new role to state
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addRole, updateRole, deleteRole } = roleSlice.actions;
export default roleSlice.reducer;
