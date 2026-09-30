import { UserModel } from '../../../database/models/userModel.js';
import type {
  CreateUserInput,
  User,
  UserWithPasswordHash,
} from '../../../models/auth/user.js';
import { handleDatabaseError } from '../shared/handleDatabaseError.js';
import {
  toUser,
  toUserWithPasswordHash,
} from '../mappers/userMapper.js';
import type { UserRepository } from '../../contracts/userRepository.js';

export class PostgresUserRepository implements UserRepository {
  async create(input: CreateUserInput): Promise<User> {
    try {
      const model = await UserModel.create({
        email: input.email,
        passwordHash: input.passwordHash,
        role: 'viewer',
        technicianId: null,
      });

      return toUser(model);
    } catch (error: unknown) {
      return handleDatabaseError(error, {
        unique: 'A user with this email already exists',
        foreignKey: 'Related record not found',
      });
    }
  }

  async findById(id: string): Promise<User | undefined> {
    const model = await UserModel.findByPk(id, {
      attributes: {
        exclude: ['passwordHash'],
      },
    });

    return model === null ? undefined : toUser(model);
  }

  async findByEmailForAuthentication(
    email: string,
  ): Promise<UserWithPasswordHash | undefined> {
    const model = await UserModel.findOne({
      where: { email },
    });

    return model === null
      ? undefined
      : toUserWithPasswordHash(model);
  }
}