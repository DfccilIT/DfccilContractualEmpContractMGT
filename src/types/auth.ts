export type UserRole = 'SuperAdmin' | 'Contract Manager';

export interface UserClaims {
  name: string;
  email: string;
  roles: UserRole[];
}
