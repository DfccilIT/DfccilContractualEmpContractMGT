import { environment } from '@/config';
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

interface Unit {
  unitName: string;
  unitId: number;
}

interface EmployeeState {
  employees: Employee[];
  units: Unit[];
  departments: string[];
  error: string | null;
  loading: boolean;
}

const initialState: EmployeeState = {
  employees: [],
  units: [],
  departments: [],
  loading: false,
  error: null,
};

export const fetchEmployees = createAsyncThunk('employee/fetchEmployee', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${environment.orgHierarchy}/Organization/GetOrganizationHierarchy`);
    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }
    const data = await response.json();
    if (data && !data.error) {
      return data.data;
    } else {
      return rejectWithValue('Failed to fetch employees');
    }
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
      const uniqueUnits = Array.from(
        new Map(action.payload.map((emp) => [emp.unitId, { unitName: emp.unitName, unitId: emp.unitId }])).values()
      );
      state.units = uniqueUnits;

      // Extract unique departments (excluding null values)
      const uniqueDepartments = Array.from(
        new Set(action.payload.map((emp) => emp.department).filter((dept): dept is string => dept !== null))
      );
      state.departments = uniqueDepartments;
    },
    clearEmployeesData: (state) => {
      state.employees = [];
      state.units = [];
      state.departments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action: PayloadAction<Employee[]>) => {
        state.loading = false;
        state.employees = action.payload;
        const uniqueUnits = Array.from(
          new Map(action.payload.map((emp) => [emp.unitId, { unitName: emp.unitName, unitId: emp.unitId }])).values()
        );
        state.units = uniqueUnits;

        const uniqueDepartments = Array.from(
          new Set(action.payload.map((emp) => emp.department).filter((dept): dept is string => dept !== null))
        );
        state.departments = uniqueDepartments;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setEmployeesData, clearEmployeesData } = employeeSlice.actions;
export default employeeSlice.reducer;
