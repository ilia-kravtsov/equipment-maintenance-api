import type {
  CreateUserInput,
  User,
  UserWithPasswordHash,
} from '../models/auth/user.js';

export interface UserRepository {
  create(input: CreateUserInput): Promise<User>;

  findById(id: string): Promise<User | undefined>;

  findByEmailForAuthentication(
    email: string,
  ): Promise<UserWithPasswordHash | undefined>;
}