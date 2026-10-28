import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import transactionsRouter from './routes/transactions.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '30kb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/transactions', transactionsRouter);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error. Check the API logs.' });
});

const port = Number(process.env.PORT) || 5000;
try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance_tracker');
  app.listen(port, () => console.log(`Finance Tracker API running on port ${port}`));
} catch (error) {
  console.error('MongoDB connection failed:', error.message);
  process.exit(1);
}
