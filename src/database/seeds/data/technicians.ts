interface TechnicianSeed {
  id: string;
  full_name: string;
  specialization: string;
  employee_number: string;
}

export const technicianIds = {
  electricalLead: 'c2ef06b9-a9fa-4a33-85c1-4ff69177d3e5',
  electricalTechnician: '27dbd384-68b1-45a2-86b0-fd11065aa2bb',
  relayEngineer: '1d11851c-91bb-4589-b639-3604822df1f4',
  mechanicalLead: 'e930c96b-ea97-47d8-bd06-31a4091139b8',
  mechanicalTechnician: '4c9bcf5e-8bbd-47f5-b40e-6bd167a87c02',
  turbineEngineer: '0f7275d4-cdfc-4946-88a3-db6ce3e2ab9e',
  instrumentationLead: 'ac9b52ab-9429-4973-80ef-22e0485f26f7',
  instrumentationTechnician: 'ececb6b0-d316-481d-a3dd-0d6d5c216f6f',
  automationEngineer: '1f43cebd-162c-493d-8044-3968e790626c',
} as const;

export const technicianSeeds: TechnicianSeed[] = [
  {
    id: technicianIds.electricalLead,
    full_name: 'Соколов Андрей Викторович',
    specialization: 'Обслуживание силового электрооборудования',
    employee_number: 'TECH-001',
  },
  {
    id: technicianIds.electricalTechnician,
    full_name: 'Морозова Елена Сергеевна',
    specialization: 'Обслуживание инверторов',
    employee_number: 'TECH-002',
  },
  {
    id: technicianIds.relayEngineer,
    full_name: 'Волков Дмитрий Павлович',
    specialization: 'Релейная защита и автоматика',
    employee_number: 'TECH-003',
  },
  {
    id: technicianIds.mechanicalLead,
    full_name: 'Кузнецов Михаил Олегович',
    specialization: 'Диагностика механического оборудования',
    employee_number: 'TECH-004',
  },
  {
    id: technicianIds.mechanicalTechnician,
    full_name: 'Орлова Анна Игоревна',
    specialization: 'Ремонт механических узлов',
    employee_number: 'TECH-005',
  },
  {
    id: technicianIds.turbineEngineer,
    full_name: 'Лебедев Павел Андреевич',
    specialization: 'Обслуживание ветрогенераторов',
    employee_number: 'TECH-006',
  },
  {
    id: technicianIds.instrumentationLead,
    full_name: 'Новикова Мария Алексеевна',
    specialization: 'Метрология и поверка приборов',
    employee_number: 'TECH-007',
  },
  {
    id: technicianIds.instrumentationTechnician,
    full_name: 'Петров Илья Романович',
    specialization: 'Диагностика измерительных датчиков',
    employee_number: 'TECH-008',
  },
  {
    id: technicianIds.automationEngineer,
    full_name: 'Смирнова Ольга Денисовна',
    specialization: 'Промышленная автоматизация',
    employee_number: 'TECH-009',
  },
];