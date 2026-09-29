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

export interface RegisterUserInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
}