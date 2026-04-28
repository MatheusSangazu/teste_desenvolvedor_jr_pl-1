import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { createTasksRouter } from './routes/tasksRoutes';

export function createApp(dataDir?: string): Application {
  const app: Application = express();
  app.use(cors());
  app.use(express.json());

  app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'API is running' });
  });

  app.use('/tasks', createTasksRouter(dataDir));

  return app;
}

const app = createApp();
export default app;
