import 'dotenv/config';
import mongoose from 'mongoose';
import Student from './models/Student.js';
import Progress from './models/Progress.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/career_os';

const demoStudent = {
  name: 'Arjun Mehta',
  targetRole: 'Full-Stack Developer',
  onboardingDone: true,
  skills: [
    { name: 'JavaScript',    current: 72, target: 90 },
    { name: 'React',         current: 65, target: 85 },
    { name: 'Node.js',       current: 58, target: 80 },
    { name: 'MongoDB',       current: 50, target: 75 },
    { name: 'System Design', current: 40, target: 80 },
    { name: 'DSA',           current: 68, target: 85 },
    { name: 'Communication', current: 57, target: 90 },
    { name: 'SQL',           current: 60, target: 75 },
  ],
};

demoStudent.careerReadiness = Math.round(
  demoStudent.skills.reduce((sum, s) => sum + (s.current / s.target) * 100, 0) /
    demoStudent.skills.length
);

const FAKE_READINESS_TREND = [52, 55, 57, 60, 61, 65, 68, 70, 71, 72];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Remove existing data to keep it idempotent
  await Student.deleteMany({});
  await Progress.deleteMany({});

  const student = await Student.create(demoStudent);
  console.log(`🌱 Seeded demo student: ${student.name} (readiness: ${student.careerReadiness}%)`);
  console.log('   ID:', student._id.toString());

  // Insert 10 progress snapshots for the last 10 days
  const now = new Date();
  const progressDocs = FAKE_READINESS_TREND.map((val, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (9 - idx));
    return {
      studentId: student._id,
      date: d,
      careerReadiness: val,
      skills: {
        DSA: Math.max(30, val - 4),
        Backend: Math.max(40, val + 10),
        DBMS: Math.max(35, val + 2),
        Communication: Math.max(30, val - 15),
        Aptitude: Math.max(30, val - 11),
        Interview: Math.max(25, val - 24),
      },
    };
  });

  await Progress.insertMany(progressDocs);
  console.log(`🌱 Seeded ${progressDocs.length} progress snapshots`);

  await mongoose.disconnect();
  console.log('👋 Done');
}

seed().catch((err) => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
