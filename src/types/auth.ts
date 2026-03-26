export type UserRole = 'SuperAdmin' | 'Contract Manager' | 'Contractual Employee Approver';

export interface UserClaims {
  name: string;
  email: string;
  roles: UserRole[];
}
