// cria toda a parte de rotas
import { Router } from 'express'; // importa somente o Router do express

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';

import authMiddleware from './app/middlewares/auth';
import ProviderController from './app/controllers/ProviderController';
import AppointmentsController from './app/controllers/AppointmentsController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';

const routes = new Router(); // cria uma nova variavel rota
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

/* 
cria um middleware global e só passa por ela oq esta daqui pra baixo
## OBRIGATORIO estar antes de update
*/
routes.use(authMiddleware);
// metodo update
routes.put('/users', UserController.update);

routes.get('/providers', ProviderController.index);
routes.get('/providers/:providerId/available', AvailableController.index);

routes.post('/appointments', AppointmentsController.store);
routes.get('/appointments', AppointmentsController.index);
routes.delete('/appointments/:id', AppointmentsController.delete);

routes.get('/schedule', ScheduleController.index);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

// rota de upload de  arquivo(avatar)
routes.post('/files', upload.single('file'), FileController.store);

export default routes; // exporta as rotas
