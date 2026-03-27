export type UserRole = 'SuperAdmin' | 'Contract Manager' | 'Contractual Employee Approver' | 'GGM' | 'CGM' | 'GM' | 'user';

export interface UserClaims {
  name: string;
  email: string;
  roles: UserRole[];
}
