import { randomUUID } from 'node:crypto';

export const requestIds = {
  northTurbineInspection: randomUUID(),
  northTurbineLubrication: randomUUID(),
  northTurbineVibration: randomUUID(),
  northTurbineDuplicate: randomUUID(),

  northInverterDiagnostics: randomUUID(),
  northInverterCooling: randomUUID(),
  northInverterContacts: randomUUID(),

  northSensorReplacement: randomUUID(),
  northSensorCalibration: randomUUID(),
  northSensorSignalCheck: randomUUID(),

  northSubstationInspection: randomUUID(),
  northSubstationRelayTest: randomUUID(),
  northSubstationThermalScan: randomUUID(),

  southTurbineInspection: randomUUID(),
  southTurbineBearingRepair: randomUUID(),
  southTurbineBladeCheck: randomUUID(),

  southInverterFirmware: randomUUID(),
  southInverterDiagnostics: randomUUID(),
  southInverterDuplicate: randomUUID(),

  southSensorCalibration: randomUUID(),
  southSensorReplacement: randomUUID(),
  southSensorVerification: randomUUID(),

  southSubstationRepair: randomUUID(),
  southSubstationRelayTest: randomUUID(),
  southSubstationInspection: randomUUID(),

  centralInverterInspection: randomUUID(),
  centralInverterCooling: randomUUID(),
  centralInverterContacts: randomUUID(),

  centralSensorDiagnostics: randomUUID(),
  centralSensorRepairRejected: randomUUID(),
  centralSensorDuplicate: randomUUID(),

  centralSubstationInspection: randomUUID(),
  centralSubstationRelayTest: randomUUID(),
  centralSubstationThermalScan: randomUUID(),
} as const;