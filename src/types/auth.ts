export type UserRole = 'user' | 'CGM' | 'HR' | 'superAdmin' | 'ReportingOfficer';

export interface UserClaims {
  name: string;
  email: string;
  roles: UserRole[];
}
