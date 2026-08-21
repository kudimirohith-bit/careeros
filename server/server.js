import 'dotenv/config';
import './models/Student.js';
import './models/Assessment.js';
import './models/Progress.js';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import studentRouter from './routes/student.js';
import assessmentRouter from './routes/assessment.js';
import progressRouter from './routes/progress.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/student', studentRouter);
app.use('/api/assessment', assessmentRouter);
app.use('/api/progress', progressRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
