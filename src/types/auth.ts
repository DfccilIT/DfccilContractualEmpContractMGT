export type UserRole = 'user' | 'CGM' | 'HR' | 'SuperAdmin' | 'ReportingOfficer' | 'Contract Manager';

export interface UserClaims {
  name: string;
  email: string;
  roles: UserRole[];
}
