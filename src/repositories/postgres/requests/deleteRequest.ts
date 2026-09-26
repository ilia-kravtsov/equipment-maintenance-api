import { MaintenanceRequestModel } from '../../../database/models/maintenanceRequestModel.js';

export const deleteRequest = async (id: string): Promise<boolean> => {
  const deletedCount = await MaintenanceRequestModel.destroy({
    where: { id },
  });

  return deletedCount > 0;
};