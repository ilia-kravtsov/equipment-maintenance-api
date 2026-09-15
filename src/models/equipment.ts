export const equipmentTypes = [
  'turbine',
  'inverter',
  'sensor',
  'substation',
] as const;

export type EquipmentType = (typeof equipmentTypes)[number];

export const equipmentStatuses = [
  'operational',
  'maintenance',
  'fault',
  'decommissioned',
] as const;

export type EquipmentStatus = (typeof equipmentStatuses)[number];

export interface EquipmentLocation {
  lat: number;
  lon: number;
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  serialNumber: string;
  location: EquipmentLocation;
  status: EquipmentStatus;
  installedAt: string;
}

export type CreateEquipmentInput = Omit<Equipment, 'id'>;