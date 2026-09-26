import { equipmentIds } from './equipmentIds.js';

interface EquipmentPassportSeed {
  equipment_id: string;
  manufacturer: string;
  model: string;
  rated_power_kw: string;
  last_verified_at: string | null;
}

export const equipmentPassportSeeds: EquipmentPassportSeed[] = [
  {
    equipment_id: equipmentIds.northTurbine,
    manufacturer: 'Энергосистемы',
    model: 'ВГ-2500',
    rated_power_kw: '2500.000',
    last_verified_at: '2026-02-12',
  },
  {
    equipment_id: equipmentIds.northInverter,
    manufacturer: 'Электроника',
    model: 'ИНВ-500',
    rated_power_kw: '500.000',
    last_verified_at: '2025-11-20',
  },
  {
    equipment_id: equipmentIds.northSensor,
    manufacturer: 'Измерительные системы',
    model: 'ДВ-12',
    rated_power_kw: '0.005',
    last_verified_at: '2025-08-14',
  },
  {
    equipment_id: equipmentIds.northSubstation,
    manufacturer: 'Энергосистемы',
    model: 'ПС-4000',
    rated_power_kw: '4000.000',
    last_verified_at: '2026-03-05',
  },
  {
    equipment_id: equipmentIds.southTurbine,
    manufacturer: 'Энергосистемы',
    model: 'ВГ-3000',
    rated_power_kw: '3000.000',
    last_verified_at: '2025-12-10',
  },
  {
    equipment_id: equipmentIds.southInverter,
    manufacturer: 'Электроника',
    model: 'ИНВ-750',
    rated_power_kw: '750.000',
    last_verified_at: '2026-04-18',
  },
  {
    equipment_id: equipmentIds.southSensor,
    manufacturer: 'Измерительные системы',
    model: 'ДТ-24',
    rated_power_kw: '0.003',
    last_verified_at: null,
  },
  {
    equipment_id: equipmentIds.southSubstation,
    manufacturer: 'Энергосистемы',
    model: 'ПС-6300',
    rated_power_kw: '6300.000',
    last_verified_at: '2025-06-25',
  },
  {
    equipment_id: equipmentIds.centralInverter,
    manufacturer: 'Электроника',
    model: 'ИНВ-1000',
    rated_power_kw: '1000.000',
    last_verified_at: '2026-05-15',
  },
  {
    equipment_id: equipmentIds.centralSensor,
    manufacturer: 'Измерительные системы',
    model: 'ДД-16',
    rated_power_kw: '0.004',
    last_verified_at: '2023-09-07',
  },
  {
    equipment_id: equipmentIds.centralSubstation,
    manufacturer: 'Энергосистемы',
    model: 'ПС-2500',
    rated_power_kw: '2500.000',
    last_verified_at: '2026-01-22',
  },
];