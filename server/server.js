import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRouter from './routes/auth.js';
import onboardingRouter from './routes/onboarding.js';
import evidenceRouter from './routes/evidence.js';
import studentRouter from './routes/student.js';
import assessmentRouter from './routes/assessment.js';
import progressRouter from './routes/progress.js';
import aiRouter from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/evidence', evidenceRouter);
app.use('/api/student', studentRouter);
app.use('/api/assessment', assessmentRouter);
app.use('/api/progress', progressRouter);
app.use('/api/ai', aiRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/career_os';

async function connectWithRetry(retries = 5, delayMs = 1000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
      console.log('✅ MongoDB connected successfully at:', MONGO_URI);
      return true;
    } catch (err) {
      if (i === retries) throw err;
      console.warn(`⏳ MongoDB connection attempt ${i}/${retries} failed (${err.message}). Retrying in ${delayMs}ms...`);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

async function startServer() {
  try {
    await connectWithRetry(1, 0);
  } catch {
    console.warn('⚠️ Direct MongoDB connection failed. Attempting to start local mongod daemon...');
    try {
      const { spawn } = await import('child_process');
      const { mkdirSync } = await import('fs');
      mkdirSync('./.mongodb_data', { recursive: true });
      spawn('mongod', ['--fork', '--dbpath', './.mongodb_data', '--logpath', './.mongodb_data/mongod.log', '--port', '27017']);
      await connectWithRetry(5, 1500);
    } catch (daemonErr) {
      console.error('❌ Could not connect to MongoDB:', daemonErr.message);
    }
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 CareerOS Backend running on http://0.0.0.0:${PORT}`));
}

startServer();
