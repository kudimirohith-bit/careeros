import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';

const QUESTIONS = [
  'Tell me about yourself and why you want to be a Backend Developer.',
  'Explain what a REST API is and how it works.',
  'What is the difference between SQL and NoSQL databases?',
  'Describe a challenging project you\'ve worked on.',
];

const ANALYSIS_SCORES = {
  technical: 78,
  communication: 68,
  clarity: 71,
  confidence: 61,
  completeness: 75,
  overall: 70.6,
};

const FEEDBACK_ITEMS = [
  { type: 'good', text: 'Good technical understanding of REST APIs' },
  { type: 'good', text: 'Clear project description with specific details' },
  { type: 'warn', text: 'Work on structuring answers using STAR method' },
  { type: 'warn', text: 'Practice speaking with more confidence — use concrete examples' },
  { type: 'tip',  text: 'Recommended: Practice 5 more HR questions to improve Communication score' },
];

/* ─── Typewriter Effect Component ────────────────────────────────── */
function TypewriterQuestion({ text, onComplete }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    // 2-second typewriter effect across full text length
    const speed = Math.max(15, Math.floor(2000 / text.length));
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <span className="font-semibold text-slate-800 leading-relaxed text-base">
      {displayed}
      {displayed.length < text.length && <span className="animate-pulse text-indigo-500 font-bold ml-0.5">|</span>}
    </span>
  );
}

/* ─── Animated Score Bar ─────────────────────────────────────────── */
function ScoreBar({ label, value, delay = 0 }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay + 100);
    return () => clearTimeout(t);
  }, [value, delay]);

  const color = value >= 75 ? '#22C55E' : value >= 65 ? '#6366F1' : '#F59E0B';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-black" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function MockInterview() {
  const { student, setStudent } = useApp();
  const [started, setStarted]       = useState(false);
  const [currentQ, setCurrentQ]     = useState(0);
  const [answers, setAnswers]       = useState(['', '', '', '']);
  const [timer, setTimer]           = useState(180); // 3 minutes per question
  const [completed, setCompleted]   = useState(false);
  const [saving, setSaving]         = useState(false);

  const targetRole = student?.targetRole ?? 'Backend Developer';

  // Countdown timer for active question
  useEffect(() => {
    if (!started || completed) return;
    setTimer(180);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, currentQ, completed]);

  // Submit interview results to backend
  const handleFinishInterview = async () => {
    setCompleted(true);
    if (!student?._id) return;
    setSaving(true);
    try {
      const res = await axios.post(`/api/student/${student._id}/mock-interview`, {
        scores: ANALYSIS_SCORES,
      });
      if (res.data) setStudent(res.data);
    } catch (err) {
      console.error('Mock interview POST failed:', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      handleFinishInterview();
    }
  };

  const fmtTimer = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // ── 1. INTRO SCREEN ──────────────────────────────────────────────
  if (!started) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="card p-8 text-center space-y-6 border border-slate-200 shadow-xl rounded-3xl bg-gradient-to-b from-indigo-50/40 via-white to-white">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600 text-white flex items-center justify-center text-4xl mx-auto shadow-lg shadow-indigo-200">
            🤖
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-800">Ready for your AI Mock Interview?</h1>
            <p className="text-slate-500 text-sm mt-2">
              Practice role-specific interview questions in a realistic chat-based evaluation session.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <span>🎯 Target Role:</span>
            <span className="font-extrabold">{targetRole}</span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left text-xs text-slate-600 space-y-2">
            <p className="font-bold text-slate-800 text-sm">📋 Session Format:</p>
            <p>• 4 core technical & behavioral interview questions</p>
            <p>• 3-minute timed response window per question</p>
            <p>• Multi-dimensional AI analysis on Technical Knowledge, Clarity, and Communication</p>
          </div>

          <button
            id="start-interview-btn"
            onClick={() => setStarted(true)}
            className="w-full py-4 rounded-2xl font-black text-white text-base transition-all shadow-lg hover:shadow-indigo-200"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }}
          >
            🚀 Start Interview Now
          </button>
        </div>
      </div>
    );
  }

  // ── 2. ANALYSIS SCREEN ───────────────────────────────────────────
  if (completed) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fadein">
        {/* Main Analysis Card */}
        <div className="card p-6 border-2 border-indigo-200 space-y-6 shadow-xl rounded-3xl bg-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-md">
                🤖
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800">Interview Performance Analysis</h1>
                <p className="text-slate-400 text-xs mt-0.5">Role: {targetRole}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-3xl font-black text-indigo-600">{ANALYSIS_SCORES.overall}%</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Score</p>
            </div>
          </div>

          {/* Metric Bars */}
          <div className="space-y-3.5">
            <ScoreBar label="Technical Knowledge" value={ANALYSIS_SCORES.technical} delay={0} />
            <ScoreBar label="Communication"       value={ANALYSIS_SCORES.communication} delay={100} />
            <ScoreBar label="Clarity"             value={ANALYSIS_SCORES.clarity} delay={200} />
            <ScoreBar label="Confidence"          value={ANALYSIS_SCORES.confidence} delay={300} />
            <ScoreBar label="Completeness"        value={ANALYSIS_SCORES.completeness} delay={400} />
          </div>

          <div className="h-px bg-slate-100" />

          {/* Feedback Bullet Points */}
          <div className="space-y-2.5">
            {FEEDBACK_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-sm font-medium border"
                style={{
                  background:
                    item.type === 'good' ? '#F0FDF4' :
                    item.type === 'warn' ? '#FFFBEB' : '#EEF2FF',
                  borderColor:
                    item.type === 'good' ? '#BBF7D0' :
                    item.type === 'warn' ? '#FDE68A' : '#C7D2FE',
                  color:
                    item.type === 'good' ? '#15803D' :
                    item.type === 'warn' ? '#92400E' : '#4338CA',
                }}
              >
                <span className="flex-shrink-0 text-base">
                  {item.type === 'good' ? '✅' : item.type === 'warn' ? '⚠️' : '💡'}
                </span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              setCompleted(false);
              setStarted(false);
              setCurrentQ(0);
              setAnswers(['', '', '', '']);
            }}
            className="w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-md"
            style={{ background: 'var(--accent)' }}
          >
            🔄 Practice Another Session
          </button>
        </div>

        {/* STAR Method Tip Card */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <p className="text-xs text-amber-900 font-semibold leading-relaxed">
            <span className="font-black text-amber-800">Use the STAR method:</span> Situation → Task → Action → Result to structure clear, impactful responses.
          </p>
        </div>
      </div>
    );
  }

  // ── 3. INTERVIEW CHAT SESSION UI ─────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Header & Timer */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">AI Mock Interview Session</h1>
          <p className="text-xs text-slate-400 font-medium">Question {currentQ + 1} of {QUESTIONS.length}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100">
            <span className="text-xs font-semibold text-indigo-500">⏱ Timer:</span>
            <span className={`font-mono font-bold text-sm ${timer <= 30 ? 'text-red-600 animate-pulse' : 'text-indigo-700'}`}>
              {fmtTimer(timer)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
          style={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Chat Layout: Left AI Question, Right Student Response */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Interviewer Avatar + Bubble (5 cols) */}
        <div className="md:col-span-5 card p-5 border border-slate-200 space-y-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
              🤖
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">AI Interviewer</p>
              <p className="text-[11px] font-semibold text-emerald-600">● Asking Question</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm min-h-[120px] flex items-center">
            <TypewriterQuestion text={QUESTIONS[currentQ]} />
          </div>
        </div>

        {/* Right: Student Response Area (7 cols) */}
        <div className="md:col-span-7 card p-5 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Your Response
            </label>
            <span className="text-[11px] text-slate-400">
              {answers[currentQ].trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          <textarea
            rows={7}
            value={answers[currentQ]}
            onChange={(e) => {
              const val = e.target.value;
              setAnswers((prev) => prev.map((a, i) => (i === currentQ ? val : a)));
            }}
            placeholder="Type your response here... Be concise and clear."
            className="w-full p-4 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50 resize-none font-medium text-slate-700"
          />

          <div className="flex justify-end gap-3">
            <button
              id="submit-answer-btn"
              onClick={handleNext}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              style={{ background: 'var(--accent)' }}
            >
              {currentQ < QUESTIONS.length - 1 ? 'Submit Answer & Next →' : 'Submit & Finish Session 🚀'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
