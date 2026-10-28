import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 90 },
  amount: { type: Number, required: true, min: 0.01 },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true, trim: true, maxlength: 40 },
  date: { type: Date, required: true, default: Date.now },
  note: { type: String, trim: true, maxlength: 240, default: '' }
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
