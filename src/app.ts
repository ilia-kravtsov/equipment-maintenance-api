import express from 'express';
import { EquipmentController } from './controllers/equipmentController.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { InMemoryEquipmentRepository } from './repositories/inMemoryEquipmentRepository.js';
import { createEquipmentRouter } from './routes/equipmentRoutes.js';
import { EquipmentService } from './services/equipmentService.js';
import { MaintenanceRequestController } from './controllers/maintenanceRequestController.js';
import { InMemoryMaintenanceRequestRepository } from './repositories/inMemoryMaintenanceRequestRepository.js';
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

export const app = express();

const equipmentRepository = new InMemoryEquipmentRepository();
const requestRepository = new InMemoryMaintenanceRequestRepository();
const equipmentService = new EquipmentService(
  equipmentRepository,
  requestRepository,
);
const weatherService = new WeatherService(equipmentService);

const requestService = new MaintenanceRequestService(
  requestRepository,
  equipmentRepository,
);

const equipmentController = new EquipmentController(
  equipmentService,
  requestService,
  weatherService,
);
const requestController = new MaintenanceRequestController(requestService);

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

app.use('/api/equipment', createEquipmentRouter(equipmentController));

app.use('/api/requests', createMaintenanceRequestRouter(requestController));

app.use(notFoundHandler);

app.use(jsonErrorHandler);

app.use(errorHandler);
