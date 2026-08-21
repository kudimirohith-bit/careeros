import 'dotenv/config';
import mongoose from 'mongoose';
import Student from './models/Student.js';
import Progress from './models/Progress.js';
import Assessment from './models/Assessment.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/career_os';

const defaultSkills = [
  { name: 'DSA', current: 54, target: 75 },
  { name: 'Backend', current: 82, target: 80 },
  { name: 'DBMS', current: 70, target: 75 },
  { name: 'Aptitude', current: 68, target: 70 },
  { name: 'Communication', current: 62, target: 70 },
  { name: 'Interview', current: 52, target: 65 },
  { name: 'System Design', current: 35, target: 65 },
  { name: 'Testing', current: 45, target: 70 },
];

const careerReadiness = Math.round(
  defaultSkills.reduce((sum, s) => sum + s.current, 0) / defaultSkills.length
);

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing collections
  await Student.deleteMany({});
  await Progress.deleteMany({});
  await Assessment.deleteMany({});

  // 1. Create Demo Student Profile
  const student = await Student.create({
    name: 'Alex Kumar',
    targetRole: 'Backend Developer',
    onboardingDone: true,
    careerReadiness,
    skills: defaultSkills,
    evidenceHub: {
      github: true,
      codingPlatform: true,
      resume: true,
      certificates: false,
    },
  });
  console.log('✅ Demo Student created:', student._id);

  // 2. Create 14-day Historical Progress Snapshots
  const readinessTrend = [42, 45, 47, 49, 50, 52, 55, 57, 58, 60, 62, 64, 66, careerReadiness];
  const skillSnapshots = [
    { DSA: 35, Backend: 65, DBMS: 50, Communication: 45 },
    { DSA: 37, Backend: 67, DBMS: 52, Communication: 46 },
    { DSA: 39, Backend: 68, DBMS: 54, Communication: 48 },
    { DSA: 40, Backend: 70, DBMS: 55, Communication: 49 },
    { DSA: 42, Backend: 72, DBMS: 57, Communication: 50 },
    { DSA: 44, Backend: 73, DBMS: 59, Communication: 52 },
    { DSA: 46, Backend: 75, DBMS: 61, Communication: 54 },
    { DSA: 47, Backend: 76, DBMS: 63, Communication: 55 },
    { DSA: 49, Backend: 78, DBMS: 65, Communication: 57 },
    { DSA: 50, Backend: 79, DBMS: 66, Communication: 58 },
    { DSA: 51, Backend: 80, DBMS: 68, Communication: 59 },
    { DSA: 52, Backend: 81, DBMS: 69, Communication: 60 },
    { DSA: 53, Backend: 82, DBMS: 70, Communication: 61 },
    { DSA: 54, Backend: 82, DBMS: 70, Communication: 62 },
  ];

  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    await Progress.create({
      studentId: student._id,
      date,
      careerReadiness: readinessTrend[i],
      skills: skillSnapshots[i],
      activityType: i % 3 === 0 ? 'assessment' : i % 2 === 0 ? 'skill_update' : 'daily_snapshot',
      note: i % 3 === 0 ? `Completed skill assessment check #${Math.floor(i / 3) + 1}` : `Day ${i + 1} activity log`,
    });
  }
  console.log('✅ 14 historical progress snapshots created');

  // 3. Create Sample Assessment Submissions
  const sampleAssessments = [
    {
      studentId: student._id,
      type: 'aptitude',
      scores: { Arithmetic: 75, Logical: 70, Verbal: 80, DataInterp: 65 },
      totalScore: 72,
      answers: ['A', 'C', 'B', 'D'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      studentId: student._id,
      type: 'coding',
      scores: { Arrays: 85, Strings: 80, Trees: 60, DynamicProgramming: 50 },
      totalScore: 68,
      answers: ['O(log n)', 'Stack', 'Representational State Transfer'],
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      studentId: student._id,
      type: 'technical',
      scores: { Databases: 80, APIs: 85, SystemDesign: 45, Security: 70 },
      totalScore: 70,
      answers: ['Unique identifier', 'Saves staged changes', 'Inter-app communications'],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      studentId: student._id,
      type: 'mock_interview',
      scores: { Clarity: 75, ProblemSolving: 70, TechnicalDepth: 65, Confidence: 80 },
      totalScore: 73,
      answers: ['STAR method explanation', 'LEGO OOP analogy'],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const item of sampleAssessments) {
    await Assessment.create(item);
  }
  console.log(`✅ ${sampleAssessments.length} sample assessment records created`);

  await mongoose.disconnect();
  console.log('🌱 Seeding complete!');
}

seed().catch(console.error);
