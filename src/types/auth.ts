export type UserRole = 'user' | 'CGM' | 'HR' | 'SuperAdmin' | 'ReportingOfficer';

export interface UserClaims {
  name: string;
  email: string;
  roles: UserRole[];
}
