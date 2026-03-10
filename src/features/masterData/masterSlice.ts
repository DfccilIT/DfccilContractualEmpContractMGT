import axiosInstance from '@/services/axiosInstance';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Unit {
  id: number;
  name: string;
  sectionId: number | null;
  status: string | null;
  ip: string | null;
  createDate: string | null;
  createBy: string | null;
  sequenceId: number | null;
  abbrivation: string | null;
  authenticatedUsers: any[]; // You can type this properly if you know the structure
}

interface Employee {
  employeeMasterAutoId: number;
  employeeCode: string;
  gender: string;
  userName: string;
  post: string;
  genericDesignation: string;
  positions: number;
  positionGrade: string;
  deptDfccil: string;
  subDeptDf: string;
  dob: string;
  doretirement: string;
  location: string;
  dorecruiting: string;
  dojdfccil: string;
  dotends: string | null;
  depTenurecompletiondate: string | null;
  depExtensionuptodate: string | null;
  deputationTenure: string | null;
  dorepatriation: string | null;
  doabsorption: string | null;
  dofirstPromotion: string | null;
  dosecondPromotion: string | null;
  dothirdPromotion: string | null;
  doreemployment: string | null;
  doabsconding: string | null;
  toemploy: string;
  empSubgroup: string;
  ethnicOrigin: string;
  religion: string;
  rbfileNo: string | null;
  lastDesignation: string | null;
  services: string;
  ditsdoarailway: string | null;
  parentRailway: string | null;
  gazettedNonGazetted: string | null;
  doletter: string | null;
  personnelArea: string;
  personnelSubArea: string;
  mobile: string;
  pwd: string;
  emailAddress: string;
  status: number;
  modifyBy: string;
  modifyDate: string;
  modifyIp: string;
  userType: number;
  designation: string;
  aboutUs: string | null;
  extnNo: string | null;
  faxNo: string | null;
  mtnno: string | null;
  photo: string | null;
  anniversaryDate: string | null;
  personalMobile: string | null;
  personalEmailAddress: string | null;
  parentOrganzation: string | null;
  duration: string | null;
  reportingOfficer: string | null;
  fatherName: string | null;
}

export interface PurposeType {
  pktblPurposeId: number;
  purposeTitle: string;
  fkUserType: number;
  status: string | null;
  isBulk: boolean;
  isSpecialPurpose: boolean | null;
  isUserVisible: boolean | null;
  fkUserTypeNavigation: any | null;
  editInputs: any[];
  inputTypes: any[];
  inputs: any[];
  purposeToEmployees: any[];
  purposeToNotings: any[];
  tblUsers: any[];
}

interface Department {
  departmentid: number;
  department: string;
  unitId: number | null;
  status: string | null;
  ip: string | null;
  createDate: string | null; // Could be Date if parsed
  createBy: string | null;
  cadres: any[]; // Replace `any` with specific type if known
}

interface MasterData {
  unit: Unit[];
  departments: Department[];
  posts: string[];
  grades: string[];
  employees: Employee[];
  dept: Department[];
}

interface MasterState {
  data: MasterData;
  loading: boolean;
  error: string | null;
}

const initialState: MasterState = {
  data: {
    unit: [],
    departments: [],
    posts: [],
    grades: [],
    employees: [],
    dept: [],
  },
  loading: false,
  error: null,
};

export const fetchMasterData = createAsyncThunk<MasterData, void, { rejectValue: string }>('masterData', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get('/ModuleManagement/GetAllMasterData');
    return response.data.data as MasterData;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data || 'Something went wrong');
  }
});

const masterSlice = createSlice({
  name: 'master',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasterData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMasterData.fulfilled, (state, action: PayloadAction<MasterData>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchMasterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch master data';
      });
  },
});

export default masterSlice.reducer;
