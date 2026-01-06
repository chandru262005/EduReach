import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/database';
import config from './config/env';
import errorHandler from './middleware/errorHandler';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/auth.routes';
import { logger } from './utils/logger';

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export default app;
