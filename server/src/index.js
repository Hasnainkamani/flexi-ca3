import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import transactionsRouter from './routes/transactions.js';

const app = express();
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '30kb' }));

app.get('/api/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'database_disconnected',
    database: connected ? 'connected' : 'disconnected'
  });
});
app.use('/api/transactions', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database is not connected. Check MONGODB_URI in Render.' });
  }
  next();
}, transactionsRouter);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error. Check the API logs.' });
});

const port = Number(process.env.PORT) || 5000;
app.listen(port, '0.0.0.0', () => console.log(`Finance Tracker API listening on port ${port}`));

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri || !/^mongodb(\+srv)?:\/\//.test(mongoUri)) {
  console.error('MONGODB_URI is missing or invalid. Set a valid MongoDB Atlas connection string in Render.');
} else {
  mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(error => console.error('MongoDB connection failed:', error.message));
}
