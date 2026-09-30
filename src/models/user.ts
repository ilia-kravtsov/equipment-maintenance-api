export const userRoles = ['viewer', 'technician', 'admin'] as const;

export type UserRole = (typeof userRoles)[number];

export interface User {
  id: string;
  email: string;
  role: UserRole;
  technicianId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithPasswordHash extends User {
  passwordHash: string;
}

export interface CredentialsInput {
  email: string;
  password: string;
}

export type RegisterUserInput = CredentialsInput;

export type LoginInput = CredentialsInput;

export interface CreateUserInput {
  email: string;
  passwordHash: string;
}