import { useState, useEffect } from 'react';
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

function TypewriterQuestion({ text, onComplete }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
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
    <span className="font-medium text-[#F5F7FA] leading-relaxed text-sm">
      {displayed}
      {displayed.length < text.length && <span className="animate-pulse text-[#A78BFA] font-bold ml-0.5">|</span>}
    </span>
  );
}

function ScoreBar({ label, value, delay = 0 }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay + 100);
    return () => clearTimeout(t);
  }, [value, delay]);

  const color = value >= 75 ? '#34D399' : value >= 65 ? '#8B5CF6' : '#FBBF24';

  return (
    <div>
      <div className="flex items-center justify-between mb-1 text-xs">
        <span className="font-semibold text-[#A7ADBA]">{label}</span>
        <span className="font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#1B1E27] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function MockInterview() {
  const { student, setStudent } = useApp();
  const [started, setStarted]       = useState(false);
  const [currentQ, setCurrentQ]     = useState(0);
  const [answers, setAnswers]       = useState(['', '', '', '']);
  const [timer, setTimer]           = useState(180);
  const [completed, setCompleted]   = useState(false);
  const [, setSaving]         = useState(false);

  const targetRole = student?.targetRole ?? 'Backend Developer';

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

  if (!started) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="card p-8 text-center space-y-6 bg-[#171A22] border border-[#282D38]">
          <div className="w-16 h-16 rounded-2xl bg-[#1B1E27] text-[#A78BFA] border border-[rgba(139,92,246,0.3)] flex items-center justify-center text-3xl mx-auto">
            🤖
          </div>

          <div>
            <h1 className="text-xl font-bold text-[#F5F7FA]">AI Mock Interview</h1>
            <p className="text-[#A7ADBA] text-xs mt-1.5">
              Practice role-specific interview questions in a realistic chat evaluation session.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B1E27] border border-[#282D38] text-[#A78BFA] text-xs font-medium">
            <span>🎯 Target Role:</span>
            <span className="font-bold text-[#F5F7FA]">{targetRole}</span>
          </div>

          <div className="bg-[#11131A] rounded-xl p-4 border border-[#282D38] text-left text-xs text-[#A7ADBA] space-y-2">
            <p className="font-bold text-[#F5F7FA]">📋 Session Format:</p>
            <p>• 4 core technical & behavioral questions</p>
            <p>• 3-minute response window per question</p>
            <p>• Multi-dimensional AI performance breakdown</p>
          </div>

          <button
            id="start-interview-btn"
            onClick={() => setStarted(true)}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-colors bg-[#8B5CF6] hover:bg-[#7C3AED]"
          >
            🚀 Start Interview Now
          </button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="card p-6 bg-[#171A22] border border-[#282D38] space-y-6">
          <div className="flex items-center justify-between border-b border-[#282D38] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1B1E27] text-[#A78BFA] border border-[rgba(139,92,246,0.3)] flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#F5F7FA]">Interview Performance Analysis</h1>
                <p className="text-[#737B8C] text-xs">Role: {targetRole}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-[#A78BFA]">{ANALYSIS_SCORES.overall}%</p>
              <p className="text-[10px] font-semibold text-[#737B8C] uppercase tracking-wider">Overall Score</p>
            </div>
          </div>

          <div className="space-y-3">
            <ScoreBar label="Technical Knowledge" value={ANALYSIS_SCORES.technical} delay={0} />
            <ScoreBar label="Communication"       value={ANALYSIS_SCORES.communication} delay={100} />
            <ScoreBar label="Clarity"             value={ANALYSIS_SCORES.clarity} delay={200} />
            <ScoreBar label="Confidence"          value={ANALYSIS_SCORES.confidence} delay={300} />
            <ScoreBar label="Completeness"        value={ANALYSIS_SCORES.completeness} delay={400} />
          </div>

          <div className="h-px bg-[#282D38]" />

          <div className="space-y-2">
            {FEEDBACK_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium border"
                style={{
                  background:
                    item.type === 'good' ? 'rgba(52,211,153,0.08)' :
                    item.type === 'warn' ? 'rgba(251,191,36,0.08)' : 'rgba(139,92,246,0.08)',
                  borderColor:
                    item.type === 'good' ? 'rgba(52,211,153,0.2)' :
                    item.type === 'warn' ? 'rgba(251,191,36,0.2)' : 'rgba(139,92,246,0.2)',
                  color:
                    item.type === 'good' ? '#34D399' :
                    item.type === 'warn' ? '#FBBF24' : '#A78BFA',
                }}
              >
                <span className="flex-shrink-0 text-sm">
                  {item.type === 'good' ? '✅' : item.type === 'warn' ? '⚠️' : '💡'}
                </span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setCompleted(false);
              setStarted(false);
              setCurrentQ(0);
              setAnswers(['', '', '', '']);
            }}
            className="w-full py-2.5 rounded-xl font-semibold text-xs text-white transition-colors bg-[#8B5CF6] hover:bg-[#7C3AED]"
          >
            🔄 Practice Another Session
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#171A22] border border-[rgba(251,191,36,0.25)] flex items-center gap-3">
          <span className="text-xl text-[#FBBF24]">💡</span>
          <p className="text-xs text-[#A7ADBA] font-medium leading-relaxed">
            <span className="font-bold text-[#F5F7FA]">STAR method tip:</span> Situation → Task → Action → Result to structure clear responses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F5F7FA]">AI Mock Interview Session</h1>
          <p className="text-xs text-[#737B8C]">Question {currentQ + 1} of {QUESTIONS.length}</p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#171A22] border border-[#282D38]">
          <span className="text-xs font-medium text-[#737B8C]">Timer:</span>
          <span className={`font-mono font-bold text-xs ${timer <= 30 ? 'text-[#F87171] animate-pulse' : 'text-[#A78BFA]'}`}>
            {fmtTimer(timer)}
          </span>
        </div>
      </div>

      <div className="h-1.5 w-full bg-[#1B1E27] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#8B5CF6] transition-all duration-300 rounded-full"
          style={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-5 card p-5 border border-[#282D38] space-y-4 bg-[#171A22]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1B1E27] text-[#A78BFA] flex items-center justify-center text-base border border-[rgba(139,92,246,0.3)]">
              🤖
            </div>
            <div>
              <p className="text-xs font-bold text-[#F5F7FA]">AI Interviewer</p>
              <p className="text-[10px] font-semibold text-[#34D399]">● Asking Question</p>
            </div>
          </div>

          <div className="bg-[#1B1E27] p-4 rounded-xl border border-[#282D38] min-h-[120px] flex items-center">
            <TypewriterQuestion text={QUESTIONS[currentQ]} />
          </div>
        </div>

        <div className="md:col-span-7 card p-5 border border-[#282D38] space-y-4 bg-[#171A22]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#737B8C]">
              Your Response
            </label>
            <span className="text-[11px] text-[#737B8C]">
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
            className="w-full p-3.5 rounded-xl text-xs border border-[#282D38] focus:outline-none focus:border-[#8B5CF6] bg-[#14161E] resize-none text-[#F5F7FA] placeholder-[#737B8C]"
          />

          <div className="flex justify-end gap-3">
            <button
              id="submit-answer-btn"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white transition-colors bg-[#8B5CF6] hover:bg-[#7C3AED]"
            >
              {currentQ < QUESTIONS.length - 1 ? 'Submit Answer & Next →' : 'Submit & Finish Session 🚀'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
