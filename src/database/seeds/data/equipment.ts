import type {
  EquipmentStatus,
  EquipmentType,
} from '../../../models/equipment/equipment.js';

import { equipmentIds } from './equipmentIds.js';
import { siteIds } from './sites.js';

interface EquipmentSeed {
  id: string;
  site_id: string;
  name: string;
  type: EquipmentType;
  serial_number: string;
  latitude: number;
  longitude: number;
  status: EquipmentStatus;
  installed_at: string;
  deleted_at: null;
}

export const equipmentSeeds: EquipmentSeed[] = [
  {
    id: equipmentIds.northTurbine,
    site_id: siteIds.north,
    name: 'Ветрогенератор Север 01',
    type: 'turbine',
    serial_number: 'NORTH-TRB-001',
    latitude: 68.9712,
    longitude: 33.0755,
    status: 'operational',
    installed_at: '2022-06-15',
    deleted_at: null,
  },
  {
    id: equipmentIds.northInverter,
    site_id: siteIds.north,
    name: 'Инвертор Север 01',
    type: 'inverter',
    serial_number: 'NORTH-INV-001',
    latitude: 68.9709,
    longitude: 33.0751,
    status: 'maintenance',
    installed_at: '2022-06-20',
    deleted_at: null,
  },
  {
    id: equipmentIds.northSensor,
    site_id: siteIds.north,
    name: 'Датчик вибрации Север 01',
    type: 'sensor',
    serial_number: 'NORTH-SNS-001',
    latitude: 68.9712,
    longitude: 33.0755,
    status: 'fault',
    installed_at: '2023-03-10',
    deleted_at: null,
  },
  {
    id: equipmentIds.northSubstation,
    site_id: siteIds.north,
    name: 'Подстанция Север 01',
    type: 'substation',
    serial_number: 'NORTH-SUB-001',
    latitude: 68.9703,
    longitude: 33.0738,
    status: 'operational',
    installed_at: '2021-09-01',
    deleted_at: null,
  },
  {
    id: equipmentIds.southTurbine,
    site_id: siteIds.south,
    name: 'Ветрогенератор Юг 01',
    type: 'turbine',
    serial_number: 'SOUTH-TRB-001',
    latitude: 45.0455,
    longitude: 41.9701,
    status: 'maintenance',
    installed_at: '2023-04-12',
    deleted_at: null,
  },
  {
    id: equipmentIds.southInverter,
    site_id: siteIds.south,
    name: 'Инвертор Юг 01',
    type: 'inverter',
    serial_number: 'SOUTH-INV-001',
    latitude: 45.0451,
    longitude: 41.9697,
    status: 'operational',
    installed_at: '2023-04-15',
    deleted_at: null,
  },
  {
    id: equipmentIds.southSensor,
    site_id: siteIds.south,
    name: 'Датчик температуры Юг 01',
    type: 'sensor',
    serial_number: 'SOUTH-SNS-001',
    latitude: 45.0446,
    longitude: 41.9694,
    status: 'operational',
    installed_at: '2024-02-08',
    deleted_at: null,
  },
  {
    id: equipmentIds.southSubstation,
    site_id: siteIds.south,
    name: 'Подстанция Юг 01',
    type: 'substation',
    serial_number: 'SOUTH-SUB-001',
    latitude: 45.0441,
    longitude: 41.9685,
    status: 'fault',
    installed_at: '2020-11-23',
    deleted_at: null,
  },
  {
    id: equipmentIds.centralInverter,
    site_id: siteIds.central,
    name: 'Инвертор Центр 01',
    type: 'inverter',
    serial_number: 'CENTRAL-INV-001',
    latitude: 55.9121,
    longitude: 37.7314,
    status: 'operational',
    installed_at: '2024-07-05',
    deleted_at: null,
  },
  {
    id: equipmentIds.centralSensor,
    site_id: siteIds.central,
    name: 'Датчик давления Центр 01',
    type: 'sensor',
    serial_number: 'CENTRAL-SNS-001',
    latitude: 55.9118,
    longitude: 37.7311,
    status: 'decommissioned',
    installed_at: '2019-05-17',
    deleted_at: null,
  },
  {
    id: equipmentIds.centralSubstation,
    site_id: siteIds.central,
    name: 'Подстанция Центр 01',
    type: 'substation',
    serial_number: 'CENTRAL-SUB-001',
    latitude: 55.9112,
    longitude: 37.7302,
    status: 'operational',
    installed_at: '2022-10-03',
    deleted_at: null,
  },
];