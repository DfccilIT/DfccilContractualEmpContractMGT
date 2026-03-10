import { getDelegationInfoFromSession } from '@/lib/helperFunction';
import axiosInstance from '@/services/axiosInstance';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

export interface UserState {
  Roles: string[];
  name: string | null;
  EmpCode: string | null;
  personnelSubArea: string | null;
  Designation: string | null;
  Unit: string | null;
  unitId: number | null;
  Lavel: string | null;
  Department: string | null;
  Mobile: string | null;
  Email: string | null;
  employeeMasterAutoId: number | null;
  exp: number | null;
  loading: boolean;
  error: string | null;
  reportingOfficer: string | null;
  roleAssigned: any[];
  isDelegatedUser?: boolean;
  delegateeEmpCode?: string | null;
  delegatedApplications?: string | null; // "11,61,72,53"
  delegatedApplicationNames?: string | null; // "IT Services Management,Module Management,e-Measurement Book,APAR"
}
interface ProfileResponse {
  employeeInfo: {
    employeeMasterAutoId: number;
    employeeCode: string;
    gender: string;
    userName: string;
    post: string | null;
    genericDesignation: string;
    personnelSubArea: string;
    positions: number;
    positionGrade: string | null;
    deptDfccil: string;
    subDeptDf: string | null;
    dob: string;
    doretirement: string | null;
    location: string;
    dojdfccil: string;
    toemploy: string;
    mobile: string;
    emailAddress: string;
    designation: string;
    status: number;
    modifyBy: string;
    modifyDate: string;
    modifyIp: string;
    userType: number;
    aboutUs: string | null;
    extnNo: string | null;
    photo: string | null;
    anniversaryDate: string | null;
    personalEmailAddress: string | null;
    reportingOfficer: string | null;
    fatherName: string | null;
    isDelegatedUser?: boolean;
    delegateeEmpCode?: string | null;
    delegatedApplications?: string | null;
    delegatedApplicationNames?: string | null;
    unitId: number | null;
  };
  roleAssigned: string[];
}

// ✅ Corrected initial state: Roles is now an empty array
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
  personnelSubArea: null,
  Email: null,
  exp: null,
  reportingOfficer: null,
  loading: false,
  error: null,
  employeeMasterAutoId: null,
  roleAssigned: [],
  isDelegatedUser: false,
  delegateeEmpCode: null,
  delegatedApplications: null,
  delegatedApplicationNames: null,
};

export const fetchUserProfile = createAsyncThunk('user/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<ProfileResponse>('/User/Transfer/GetProfile');
    const data = response.data;

    if (data.error) {
      throw new Error(data.errorDetail || 'Unknown error occurred');
    }

    const delegationInfo = getDelegationInfoFromSession();
    data.employeeInfo = {
      ...data.employeeInfo,
      ...delegationInfo,
    };
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch user profile');
  }
});

// ✅ User slice
const userSlice = createSlice({
  name: 'user',
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
        const { employeeInfo, vigilanceDetails } = action.payload || {};

        state.EmpCode = employeeInfo?.employeeCode || '';
        state.name = employeeInfo?.userName || '';
        state.Designation = employeeInfo?.post || '';
        state.Unit = employeeInfo?.location || '';
        state.unitId = employeeInfo?.unitId;
        state.Department = employeeInfo?.deptDfccil || '';
        state.Lavel = employeeInfo?.toemploy || '';
        state.Mobile = employeeInfo?.mobile || '';
        state.personnelSubArea = employeeInfo?.personnelSubArea || '';
        state.reportingOfficer = employeeInfo?.reportingOfficer || '';
        state.Email = employeeInfo?.emailAddress || '';
        state.employeeMasterAutoId = employeeInfo?.employeeMasterAutoId || null;
        const roles = Array.isArray(vigilanceDetails)
          ? Array.from(
              new Set(
                vigilanceDetails.map((r: any) => (typeof r === 'string' ? r : r?.roleName)).filter((s: any) => typeof s === 'string' && s.trim().length > 0)
              )
            )
          : [];
        state.Roles = roles.length ? [...roles, 'user'] : ['user'];
        state.roleAssigned = vigilanceDetails;
        state.isDelegatedUser = employeeInfo.isDelegatedUser ?? false;
        state.delegateeEmpCode = employeeInfo.delegateeEmpCode ?? null;
        state.delegatedApplications = employeeInfo.delegatedApplications ?? null;
        state.delegatedApplicationNames = employeeInfo.delegatedApplicationNames ?? null;
      });
  },
});

export const { updateUser, resetUser } = userSlice.actions;
export default userSlice.reducer;
