import { Router } from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';

const router = Router();

router.get('/summary', async (_req, res, next) => {
  try {
    const rows = await Transaction.find().sort({ date: -1 }).limit(6).lean();
    const totals = await Transaction.aggregate([
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);
    const income = totals.find(x => x._id === 'income')?.total || 0;
    const expense = totals.find(x => x._id === 'expense')?.total || 0;
    res.json({ income, expense, balance: income - expense, recent: rows });
  } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (['income', 'expense'].includes(req.query.type)) filter.type = req.query.type;
    const transactions = await Transaction.find(filter).sort({ date: -1, createdAt: -1 }).lean();
    res.json(transactions);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, amount, type, category, date, note = '' } = req.body;
    if (!title?.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0 ||
        !['income', 'expense'].includes(type) || !category?.trim()) {
      return res.status(400).json({ message: 'Enter a title, positive amount, valid type, and category.' });
    }
    const transaction = await Transaction.create({
      title: title.trim(), amount: Number(amount), type, category: category.trim(),
      date: date ? new Date(date) : new Date(), note
    });
    res.status(201).json(transaction);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid transaction ID.' });
    const removed = await Transaction.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Transaction not found.' });
    res.json({ message: 'Transaction deleted.' });
  } catch (e) { next(e); }
});

export default router;
