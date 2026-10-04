import express from 'express';
import { EquipmentController } from './controllers/equipmentController.js';
import { errorHandler } from './middlewares/errors/errorHandler.js';
import { createEquipmentRouter } from './routes/equipmentRoutes.js';
import { EquipmentService } from './services/equipmentService.js';
import { MaintenanceRequestController } from './controllers/maintenanceRequestController.js';
import { createMaintenanceRequestRouter } from './routes/maintenanceRequestRoutes.js';
import { MaintenanceRequestService } from './services/maintenanceRequestService.js';
import { notFoundHandler } from './middlewares/errors/notFoundHandler.js';
import { jsonErrorHandler } from './middlewares/errors/jsonErrorHandler.js';
import { requestId } from './middlewares/http/requestId.js';
import { WeatherService } from './services/weatherService.js';
import helmet from 'helmet';
import { corsMiddleware } from './middlewares/http/corsMiddleware.js';
import { apiRateLimiter } from './middlewares/http/rateLimitMiddleware.js';
import { requestLogger } from './middlewares/http/requestLogger.js';
import { sequelize } from './database/sequelize.js';
import { initModels } from './database/models/initModels.js';
import { PostgresEquipmentRepository } from './repositories/postgres/equipment/postgresEquipmentRepository.js';
import { PostgresMaintenanceRequestRepository } from './repositories/postgres/requests/postgresMaintenanceRequestRepository.js';
import { PostgresRequestAssigneeRepository } from './repositories/postgres/requests/postgresRequestAssigneeRepository.js';
import { RequestAssigneeService } from './services/requestAssigneeService.js';
import { RequestAssigneeController } from './controllers/requestAssigneeController.js';
import { createRequestAssigneeRouter } from './routes/requestAssigneeRoutes.js';
import { PostgresSiteSummaryRepository } from './repositories/postgres/reports/postgresSiteSummaryRepository.js';
import { SiteSummaryService } from './services/siteSummaryService.js';
import { SiteSummaryController } from './controllers/siteSummaryController.js';
import { createSiteRouter } from './routes/siteRoutes.js';
import { PostgresEquipmentLoadRepository } from './repositories/postgres/reports/postgresEquipmentLoadRepository.js';
import { EquipmentLoadService } from './services/equipmentLoadService.js';
import { EquipmentLoadController } from './controllers/equipmentLoadController.js';
import { createReportRouter } from './routes/reportRoutes.js';
import { AuthController } from './controllers/authController.js';
import { createRequireAuth } from './middlewares/auth/requireAuth.js';
import { PostgresRefreshSessionRepository } from './repositories/postgres/auth/postgresRefreshSessionRepository.js';
import { PostgresUserRepository } from './repositories/postgres/users/postgresUserRepository.js';
import { createAuthRouter } from './routes/authRoutes.js';
import { AuthService } from './services/authService.js';
import { createDocsRouter } from './routes/docsRoutes.js';
import { PostgresSiteRepository } from './repositories/postgres/sites/postgresSiteRepository.js';
import { SiteService } from './services/siteService.js';
import { SiteController } from './controllers/siteController.js';
import { PostgresTechnicianRepository } from './repositories/postgres/technicians/postgresTechnicianRepository.js';
import { TechnicianService } from './services/technicianService.js';
import { TechnicianController } from './controllers/technicianController.js';
import { createTechnicianRouter } from './routes/technicianRoutes.js';
import { createHealthRouter } from './routes/healthRoutes.js';
import { createMetricsRouter } from './routes/metricsRoutes.js';

export const app = express();

app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : false);

initModels(sequelize);

const equipmentRepository = new PostgresEquipmentRepository(sequelize);
const requestRepository = new PostgresMaintenanceRequestRepository(sequelize);
const requestAssigneeRepository = new PostgresRequestAssigneeRepository(sequelize);
const siteSummaryRepository = new PostgresSiteSummaryRepository(sequelize);
const equipmentLoadRepository = new PostgresEquipmentLoadRepository(sequelize);
const userRepository = new PostgresUserRepository();
const refreshSessionRepository = new PostgresRefreshSessionRepository();
const siteRepository = new PostgresSiteRepository();
const technicianRepository = new PostgresTechnicianRepository();

const equipmentService = new EquipmentService(
  equipmentRepository,
  requestRepository,
);
const weatherService = new WeatherService(equipmentService);
const requestService = new MaintenanceRequestService(
  requestRepository,
  equipmentRepository,
);
const requestAssigneeService = new RequestAssigneeService(requestAssigneeRepository);
const siteSummaryService = new SiteSummaryService(siteSummaryRepository);
const equipmentLoadService = new EquipmentLoadService(equipmentLoadRepository);
const authService = new AuthService(
  userRepository,
  refreshSessionRepository,
);
const siteService = new SiteService(siteRepository);
const technicianService = new TechnicianService(technicianRepository);

const equipmentController = new EquipmentController(
  equipmentService,
  requestService,
  weatherService,
);
const requestController = new MaintenanceRequestController(requestService);
const requestAssigneeController = new RequestAssigneeController(requestAssigneeService);
const siteSummaryController = new SiteSummaryController(
  siteSummaryService,
);
const equipmentLoadController = new EquipmentLoadController(equipmentLoadService);
const authController = new AuthController(authService);
const siteController = new SiteController(siteService);
const technicianController = new TechnicianController(technicianService);

const requireAuth = createRequireAuth(authService);

app.use(requestId);

app.use(requestLogger);

app.use(helmet());

app.use(corsMiddleware);

app.use('/metrics', createMetricsRouter());

app.use('/api/health', createHealthRouter(sequelize));

app.use('/api', apiRateLimiter);

app.use(
  express.json({
    limit: '100kb',
  }),
);

app.use(createDocsRouter());

app.use(express.static('public'));

app.use(
  '/api/auth',
  createAuthRouter(authController, requireAuth),
);

app.use(
  '/api/equipment',
  createEquipmentRouter(equipmentController, requireAuth),
);

app.use('/api/requests', createMaintenanceRequestRouter(requestController, requireAuth));

app.use(
  '/api/requests',
  createRequestAssigneeRouter(requestAssigneeController, requireAuth),
);

app.use(
  '/api/sites',
  createSiteRouter(siteController, siteSummaryController, requireAuth),
);

app.use(
  '/api/reports',
  createReportRouter(equipmentLoadController, requireAuth),
);

app.use(
  '/api/technicians',
  createTechnicianRouter(technicianController, requireAuth),
);

app.use(notFoundHandler);

app.use(jsonErrorHandler);

app.use(errorHandler);
