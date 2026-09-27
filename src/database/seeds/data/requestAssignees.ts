import { requestIds } from './requestIds.js';
import { technicianIds } from './technicians.js';

interface RequestAssigneeSeed {
  request_id: string;
  technician_id: string;
  role: 'lead' | 'member';
  hours: string;
}

const createCrew = (
  requestId: string,
  leadId: string,
  memberId: string,
  leadHours: string,
  memberHours: string,
): RequestAssigneeSeed[] => {
  if (leadId === memberId) {
    throw new Error(
      `Seed crew must contain different technicians: ${requestId}`,
    );
  }

  return [
    {
      request_id: requestId,
      technician_id: leadId,
      role: 'lead',
      hours: leadHours,
    },
    {
      request_id: requestId,
      technician_id: memberId,
      role: 'member',
      hours: memberHours,
    },
  ];
};

export const requestAssigneeSeeds: RequestAssigneeSeed[] = [
  ...createCrew(
    requestIds.northTurbineInspection,
    technicianIds.mechanicalLead,
    technicianIds.turbineEngineer,
    '4.00',
    '6.00',
  ),
  ...createCrew(
    requestIds.northTurbineLubrication,
    technicianIds.turbineEngineer,
    technicianIds.mechanicalTechnician,
    '3.00',
    '4.00',
  ),
  ...createCrew(
    requestIds.northInverterDiagnostics,
    technicianIds.electricalLead,
    technicianIds.electricalTechnician,
    '5.00',
    '8.00',
  ),
  ...createCrew(
    requestIds.northInverterCooling,
    technicianIds.electricalLead,
    technicianIds.electricalTechnician,
    '2.00',
    '3.50',
  ),
  ...createCrew(
    requestIds.northSensorReplacement,
    technicianIds.instrumentationLead,
    technicianIds.instrumentationTechnician,
    '4.00',
    '6.00',
  ),
  ...createCrew(
    requestIds.northSensorCalibration,
    technicianIds.instrumentationLead,
    technicianIds.automationEngineer,
    '2.50',
    '3.00',
  ),
  ...createCrew(
    requestIds.northSubstationInspection,
    technicianIds.electricalLead,
    technicianIds.relayEngineer,
    '6.00',
    '8.00',
  ),
  ...createCrew(
    requestIds.northSubstationRelayTest,
    technicianIds.relayEngineer,
    technicianIds.automationEngineer,
    '5.00',
    '6.00',
  ),

  ...createCrew(
    requestIds.southTurbineInspection,
    technicianIds.mechanicalLead,
    technicianIds.mechanicalTechnician,
    '4.00',
    '5.00',
  ),
  ...createCrew(
    requestIds.southTurbineBearingRepair,
    technicianIds.mechanicalLead,
    technicianIds.turbineEngineer,
    '12.00',
    '16.00',
  ),
  ...createCrew(
    requestIds.southInverterFirmware,
    technicianIds.automationEngineer,
    technicianIds.electricalTechnician,
    '3.00',
    '2.00',
  ),
  ...createCrew(
    requestIds.southSensorCalibration,
    technicianIds.instrumentationLead,
    technicianIds.instrumentationTechnician,
    '2.00',
    '2.50',
  ),
  ...createCrew(
    requestIds.southSensorVerification,
    technicianIds.instrumentationLead,
    technicianIds.instrumentationTechnician,
    '4.00',
    '4.00',
  ),
  ...createCrew(
    requestIds.southSubstationRepair,
    technicianIds.electricalLead,
    technicianIds.relayEngineer,
    '10.00',
    '12.00',
  ),
  ...createCrew(
    requestIds.southSubstationRelayTest,
    technicianIds.relayEngineer,
    technicianIds.automationEngineer,
    '6.00',
    '5.00',
  ),

  ...createCrew(
    requestIds.centralInverterInspection,
    technicianIds.electricalLead,
    technicianIds.electricalTechnician,
    '2.00',
    '3.00',
  ),
  ...createCrew(
    requestIds.centralInverterCooling,
    technicianIds.electricalTechnician,
    technicianIds.automationEngineer,
    '3.00',
    '4.00',
  ),
  ...createCrew(
    requestIds.centralSensorDiagnostics,
    technicianIds.instrumentationLead,
    technicianIds.instrumentationTechnician,
    '3.00',
    '5.00',
  ),
  ...createCrew(
    requestIds.centralSubstationInspection,
    technicianIds.electricalLead,
    technicianIds.relayEngineer,
    '5.00',
    '7.00',
  ),
  ...createCrew(
    requestIds.centralSubstationRelayTest,
    technicianIds.relayEngineer,
    technicianIds.automationEngineer,
    '4.00',
    '6.00',
  ),
];