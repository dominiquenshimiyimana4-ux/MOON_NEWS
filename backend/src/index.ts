import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/database';

dotenv.config();

const app: Express = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(helmet());

const allowedOrigins = [
  'https://moon-news.moonn.workers.dev',
  ...(process.env.FRONTEND_URL || '').split(','),
]
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = origin?.trim().replace(/\/+$/, '');

      if (
        !origin ||
        allowedOrigins.includes('*') ||
        (normalizedOrigin && allowedOrigins.includes(normalizedOrigin))
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  }),
);

app.use((req: Request, res: Response, next: NextFunction) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin?.trim().replace(/\/+$/, '');

  if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    return next();
  }

  return res.status(403).json({ error: 'Forbidden cross-origin request' });
});

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'Server is running' });
});

import authRoutes from './routes/auth';
import articlesRoutes from './routes/articles';
import commentsRoutes from './routes/comments';
import usersRoutes from './routes/users';
import channelsRoutes from './routes/channels';

app.use('/api/auth', authRoutes);
app.use('/api/news', articlesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/channels', channelsRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler must be registered after all routes so route errors reach it.
app.use(
  (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    console.error('Unhandled server error:', err);

    const status =
      typeof err?.status === 'number' && err.status >= 400 && err.status < 600
        ? err.status
        : 500;

    const message =
      typeof err?.message === 'string'
        ? err.message
        : 'Internal Server Error';

    res.status(status).json({ error: message });
  },
);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
