import axiosInstance from '@/services/axiosInstance';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface Employee {
  id: number | null;
  empId: number;
  empCode: string;
  empName: string;
  department: string | null;
  designation: string;
  level: string;
  unitName: string;
  unitId: number;
  empMobileNo: string | null;
  empEmail: string | null;
  managerId: number | null;
  managerCode: string | null;
  managerName: string | null;
  totalReportingCount: number;
  title: string | null;
}
interface EmployeeState {
  employees: Employee[];
  error: string | null;
  loading: boolean;
}

const initialState: EmployeeState = {
  employees: [],
  loading: false,
  error: null,
};

export const fetchEmployeesList = createAsyncThunk('employee/fetchEmployee', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`/ModuleManagement/GetEmployeeProfile/X`);
    console.log(response.data);
    return response?.data?.data?.employee;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error loading employees');
  }
});

export const selectLoadingState = (state: { employee: EmployeeState }) => state.employee.loading;

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    setEmployeesData: (state, action: PayloadAction<Employee[]>) => {
      state.employees = action.payload;
    },
    clearEmployeesData: (state) => {
      state.employees = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeesList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeesList.fulfilled, (state, action: PayloadAction<Employee[]>) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployeesList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setEmployeesData, clearEmployeesData } = employeeSlice.actions;
export default employeeSlice.reducer;
