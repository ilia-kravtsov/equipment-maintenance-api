import type { UserModel } from '../../database/models/userModel.js';
import type {
  User,
  UserWithPasswordHash,
} from '../../models/auth/user.js';

export const toUser = (model: UserModel): User => {
  return {
    id: model.id,
    email: model.email,
    role: model.role,
    technicianId: model.technicianId,
    createdAt: model.createdAt.toISOString(),
    updatedAt: model.updatedAt.toISOString(),
  };
};

export const toUserWithPasswordHash = (
  model: UserModel,
): UserWithPasswordHash => {
  return {
    ...toUser(model),
    passwordHash: model.passwordHash,
  };
};