import { getDelegationInfoFromSession } from "@/lib/helperFunction";
import axiosInstance from "@/services/axiosInstance";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

export interface UserState {
  Roles: string[];
  name: string | null;
  EmpCode: string | null;
  Designation: string | null;
  Unit: string | null;
  unitId: number | null;
  Lavel: string | null;
  Department: string | null;
  Mobile: string | null;
  Email: string | null;
  employeeMasterAutoId: number | null;
  personnelSubArea: string | null;
  reportingOfficer: string | null;
  exp: number | null;
  roleAssigned: any[];
  loading: boolean;
  error: string | null;

  isDelegatedUser?: boolean;
  delegateeEmpCode?: string | null;
  delegatedApplications?: string | null;
  delegatedApplicationNames?: string | null;
}

interface ProfileApiResponse {
  statusCode: number;
  message: string;
  data: {
    empId: number;
    empCode: string;
    name: string;
    email: string;
    mobile: string;
    designation: string;
    department: string;
    unit: string;
    unitId: number;
    level: string;
    dmsRoles: any[];
    globelAssigndRolesAndUnits: {
      roleAssign: string;
      units: any[];
    }[];
  };
}

const initialState: UserState = {
  Roles: [],
  name: null,
  EmpCode: null,
  Designation: null,
  Unit: null,
  unitId: null,
  Lavel: null,
  Department: null,
  Mobile: null,
  Email: null,
  employeeMasterAutoId: null,
  personnelSubArea: null,
  reportingOfficer: null,
  exp: null,
  roleAssigned: [],
  loading: false,
  error: null,
  isDelegatedUser: false,
  delegateeEmpCode: null,
  delegatedApplications: null,
  delegatedApplicationNames: null,
};

export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ProfileApiResponse>("/Account/profile");

      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message);
      }

      const delegationInfo = getDelegationInfoFromSession();

      return {
        ...response.data.data,
        ...delegationInfo,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch user profile"
      );
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser(state, action: PayloadAction<Partial<UserState>>) {
      return { ...state, ...action.payload };
    },
    resetUser() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload;

        state.EmpCode = data?.empCode || "";
        state.name = data?.name || "";
        state.Designation = data?.designation || "";
        state.Unit = data?.unit || "";
        state.unitId = data?.unitId || null;
        state.Department = data?.department || "";
        state.Lavel = data?.level || "";
        state.Mobile = data?.mobile || "";
        state.Email = data?.email || "";
        state.employeeMasterAutoId = data?.empId || null;

        const roles =
          data?.globelAssigndRolesAndUnits?.map((r: any) => r.roleAssign) || [];

        state.Roles = [...new Set([...roles, "user"])];
        state.roleAssigned = data?.globelAssigndRolesAndUnits || [];

        state.isDelegatedUser = data?.isDelegatedUser ?? false;
        state.delegateeEmpCode = data?.delegateeEmpCode ?? null;
        state.delegatedApplications = data?.delegatedApplications ?? null;
        state.delegatedApplicationNames = data?.delegatedApplicationNames ?? null;
      })

      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateUser, resetUser } = userSlice.actions;
export default userSlice.reducer;