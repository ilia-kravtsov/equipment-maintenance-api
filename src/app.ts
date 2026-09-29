import express from 'express';
import { EquipmentController } from './controllers/equipmentController.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { createEquipmentRouter } from './routes/equipmentRoutes.js';
import { EquipmentService } from './services/equipmentService.js';
import { MaintenanceRequestController } from './controllers/maintenanceRequestController.js';
import { createMaintenanceRequestRouter } from './routes/maintenanceRequestRoutes.js';
import { MaintenanceRequestService } from './services/maintenanceRequestService.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { jsonErrorHandler } from './middlewares/jsonErrorHandler.js';
import { requestId } from './middlewares/requestId.js';
import { WeatherService } from './services/weatherService.js';
import helmet from 'helmet';
import { corsMiddleware } from './middlewares/corsMiddleware.js';
import { apiRateLimiter } from './middlewares/rateLimitMiddleware.js';
import { requestLogger } from './middlewares/requestLogger.js';
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
import { createRequireAuth } from './middlewares/requireAuth.js';
import { PostgresRefreshSessionRepository } from './repositories/postgres/auth/postgresRefreshSessionRepository.js';
import { PostgresUserRepository } from './repositories/postgres/users/postgresUserRepository.js';
import { createAuthRouter } from './routes/authRoutes.js';
import { AuthService } from './services/authService.js';

export const app = express();

initModels(sequelize);

const equipmentRepository = new PostgresEquipmentRepository(sequelize);
const requestRepository = new PostgresMaintenanceRequestRepository(sequelize);
const requestAssigneeRepository = new PostgresRequestAssigneeRepository(sequelize);
const siteSummaryRepository = new PostgresSiteSummaryRepository(sequelize);
const equipmentLoadRepository = new PostgresEquipmentLoadRepository(sequelize);
const userRepository = new PostgresUserRepository();
const refreshSessionRepository = new PostgresRefreshSessionRepository();

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

const requireAuth = createRequireAuth(authService);

app.use(requestId);

app.use(requestLogger);

app.use(helmet());

app.use(corsMiddleware);

app.use('/api', apiRateLimiter);

app.use(
  express.json({
    limit: '100kb',
  }),
);

app.use(express.static('public'));

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
  });
});

app.use(
  '/api/auth',
  createAuthRouter(authController, requireAuth),
);

app.use('/api/equipment', createEquipmentRouter(equipmentController));

app.use('/api/requests', createMaintenanceRequestRouter(requestController));

app.use(
  '/api/requests',
  createRequestAssigneeRouter(requestAssigneeController),
);

app.use('/api/sites', createSiteRouter(siteSummaryController));

app.use('/api/reports', createReportRouter(equipmentLoadController));

app.use(notFoundHandler);

app.use(jsonErrorHandler);

app.use(errorHandler);
