export interface Claim {
  claimId: number;
  empId: number;
  patientId: number;
  advanceAmount: number;
  claimAmount: number;
  requestDate: string;
  approvedAmount: number | null;
  approvedDate: string | null;
  statusId: number;
  status: string;
  claimTypeName: string;
  claimTypeId: number;
}

export interface ClaimState {
  loading: boolean;
  error: string | null;
  success: boolean;
  data: Claim[] | null;
}

export interface ClaimRequest {
  IsSpecailDisease: boolean;
  IsTaxAble: boolean;
  SpecialDiseaseName?: string;
  ClaimAmount?: number;
  ClaimPdfUpload?: string;
  AdmissionAdviceUpload?: any[];
  DischargeSummaryUpload?: any[];
  InvestigationReportsUpload?: any[];
  EmpId?: number;
  Unit?: string;
  FinalHospitalBill?: number;
  FinalHospitalBillUpload?: any[];
  MedicenBill?: { BilledAmount: number; ClaimedAmount: number }[];
  MedicenNotFinalBill?: { Amount: number; Files: any[]; AmountCliam: number };
  Consultation?: { BilledAmount: number; ClaimedAmount: number }[];
  ConsultationNotFinalBill?: { BilledAmount: number; Files: any[]; AmountCliam: number };
  Investigation?: { BilledAmount: number; ClaimedAmount: number }[];
  InvestigationNotFinalBill?: { BilledAmount: number; Files: any[]; AmountCliam: number };
  RoomRent?: { BilledAmount: number; ClaimedAmount: number }[];
  OtherBill?: { BilledAmount: number; ClaimedAmount: number };
  Procedure?: { BilledAmount: number; ClaimedAmount: number }[];
  OtherBillNotFinalBill?: { BilledAmount: number; Files: any[]; ClaimedAmount: number };
  PatientId?: number;
  RequestName?: string;
  Reason?: string;
  PayTo?: string;
  HospitalName: string;
  HospitalRegNo: string;
  DateOfAdmission: string;
  DateofDischarge: string;
  DoctorName?: string;
  IsPreHospitalizationExpenses: boolean;
  PreHospitalizationExpensesMedicine?: { BilledAmount: number; Files: any[]; ClaimedAmount: number; ClaimDate: string };
  PreHospitalizationExpensesConsultation?: { BilledAmount: number; Files: any[]; ClaimedAmount: number; ClaimDate: string };
  PreHospitalizationExpensesInvestigation?: { BilledAmount: number; Files: any[]; ClaimedAmount: number; ClaimDate: string };
  PreHospitalizationExpensesOther?: { BilledAmount: number; Files: any[]; ClaimedAmount: number; ClaimDate: string };
  PreHospitalizationProcedure?: { BilledAmount: number; Files: any[]; ClaimedAmount: number; ClaimDate: string };
  PostHospitalTreatmentAdviseUpload?: any[];
  Digonosis?: string;
  TreatmentType?: string;
  IsHospitialEmpanpanelled?: boolean;
  HospitalId?: string;
  IsPostHospitalization: boolean;
  HospitalIncomeTaxFile?: { Files: any[] };
  HospitalRegstrationDetailsFile?: { Files: any[] };
  PaidAmount?: number;
  NotIncluded?: { BilledAmount: number; ClaimedAmount: number; files?: File[] }[];
  claimedTotal?: number;
}
