import { useState } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';

/* ─── Data ─────────────────────────────────────────────────────────── */

const ROLES = [
  {
    id: 'backend',
    emoji: '🖥️',
    label: 'Backend Developer',
    desc: 'Build APIs, services, and server-side systems that power applications at scale.',
    tags: ['Node.js', 'Databases', 'System Design'],
    skills: [
      { name: 'Programming',    current: 0, target: 90 },
      { name: 'DSA',            current: 0, target: 85 },
      { name: 'Node.js',        current: 0, target: 80 },
      { name: 'APIs',           current: 0, target: 80 },
      { name: 'Databases',      current: 0, target: 75 },
      { name: 'Git',            current: 0, target: 70 },
      { name: 'Testing',        current: 0, target: 70 },
      { name: 'System Design',  current: 0, target: 80 },
      { name: 'Communication',  current: 0, target: 75 },
      { name: 'Interview Prep', current: 0, target: 85 },
    ],
  },
  {
    id: 'data-analyst',
    emoji: '📊',
    label: 'Data Analyst',
    desc: 'Turn raw data into insights using SQL, Python, and powerful visualisation tools.',
    tags: ['Python', 'SQL', 'Data Viz'],
    skills: [
      { name: 'Python',           current: 0, target: 80 },
      { name: 'SQL',              current: 0, target: 85 },
      { name: 'Statistics',       current: 0, target: 75 },
      { name: 'Data Viz',         current: 0, target: 70 },
      { name: 'Excel',            current: 0, target: 65 },
      { name: 'Communication',    current: 0, target: 75 },
      { name: 'ML Basics',        current: 0, target: 60 },
      { name: 'Problem Solving',  current: 0, target: 80 },
    ],
  },
  {
    id: 'ai-engineer',
    emoji: '🤖',
    label: 'AI Engineer',
    desc: 'Design and deploy machine learning models and intelligent systems end-to-end.',
    tags: ['Python', 'ML', 'Deep Learning'],
    skills: [
      { name: 'Python',       current: 0, target: 90 },
      { name: 'ML',           current: 0, target: 85 },
      { name: 'Deep Learning',current: 0, target: 80 },
      { name: 'DSA',          current: 0, target: 75 },
      { name: 'Mathematics',  current: 0, target: 80 },
      { name: 'APIs',         current: 0, target: 70 },
      { name: 'NLP',          current: 0, target: 75 },
      { name: 'Communication',current: 0, target: 70 },
    ],
  },
  {
    id: 'frontend',
    emoji: '🌐',
    label: 'Frontend Developer',
    desc: 'Craft pixel-perfect, performant UIs using modern JavaScript frameworks and design systems.',
    tags: ['React', 'JavaScript', 'UI/UX'],
    skills: [
      { name: 'HTML/CSS',     current: 0, target: 85 },
      { name: 'JavaScript',   current: 0, target: 90 },
      { name: 'React',        current: 0, target: 85 },
      { name: 'DSA',          current: 0, target: 70 },
      { name: 'UI/UX',        current: 0, target: 75 },
      { name: 'APIs',         current: 0, target: 70 },
      { name: 'Git',          current: 0, target: 65 },
      { name: 'Communication',current: 0, target: 70 },
    ],
  },
];

const EVIDENCE_SOURCES = [
  { id: 'github',    emoji: '🐙', label: 'GitHub',            desc: 'Link your repos & contributions' },
  { id: 'platform',  emoji: '💻', label: 'Coding Platform',   desc: 'LeetCode, HackerRank, etc.' },
  { id: 'resume',    emoji: '📄', label: 'Resume',            desc: 'Upload your latest resume' },
  { id: 'certs',     emoji: '🎓', label: 'Certificates',      desc: 'Add your certifications' },
];

/* ─── Step indicator ─────────────────────────────────────────────── */

function StepDots({ step }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className="rounded-full transition-all duration-300"
            style={{
              width:  step >= s ? 28 : 10,
              height: 10,
              background: step >= s ? 'var(--accent)' : '#CBD5E1',
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Step 1 — Career Goal ────────────────────────────────────────── */

function StepGoal({ selected, onSelect, onNext }) {
  return (
    <div className="w-full max-w-2xl mx-auto animate-fadein">
      <p className="text-indigo-500 text-sm font-semibold mb-1 tracking-wide uppercase">Step 1 of 3</p>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">What's your career goal?</h2>
      <p className="text-slate-500 mb-8">We'll personalise your learning path around this role.</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {ROLES.map((role) => {
          const isSelected = selected?.id === role.id;
          return (
            <button
              key={role.id}
              id={`goal-card-${role.id}`}
              onClick={() => onSelect(role)}
              className="text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-md"
              style={{
                background:   isSelected ? '#EEF2FF' : '#fff',
                borderColor:  isSelected ? 'var(--accent)' : '#E2E8F0',
                boxShadow:    isSelected ? '0 0 0 3px rgba(99,102,241,0.15)' : undefined,
              }}
            >
              <div className="text-3xl mb-3">{role.emoji}</div>
              <div className="font-bold text-slate-800 text-base mb-1">{role.label}</div>
              <p className="text-slate-500 text-xs leading-relaxed mb-3">{role.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {role.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: isSelected ? 'rgba(99,102,241,0.15)' : '#F1F5F9',
                      color:      isSelected ? '#4F46E5' : '#64748B',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <button
        id="goal-next-btn"
        disabled={!selected}
        onClick={onNext}
        className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200"
        style={{
          background: selected ? 'var(--accent)' : '#CBD5E1',
          cursor: selected ? 'pointer' : 'not-allowed',
          boxShadow: selected ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
        }}
      >
        Continue →
      </button>
    </div>
  );
}

/* ─── Step 2 — Skills Preview ─────────────────────────────────────── */

function SkillPill({ name, index }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border"
      style={{
        background: '#EEF2FF',
        borderColor: '#C7D2FE',
        color: '#4338CA',
        animation: `skillPop 0.4s ease both`,
        animationDelay: `${index * 60}ms`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
      {name}
    </span>
  );
}

function StepSkills({ role, onNext, onBack }) {
  return (
    <div className="w-full max-w-xl mx-auto animate-fadein">
      <p className="text-indigo-500 text-sm font-semibold mb-1 tracking-wide uppercase">Step 2 of 3</p>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Skills we'll track</h2>
      <p className="text-slate-500 mb-8">
        For <span className="font-semibold text-indigo-600">{role.label}</span>, we'll assess your current level across these areas:
      </p>

      <div
        className="p-6 rounded-2xl mb-8"
        style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
      >
        <div className="flex flex-wrap gap-2.5">
          {role.skills.map((s, i) => (
            <SkillPill key={s.name} name={s.name} index={i} />
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center mb-6">
        🧠 We'll assess your current level for each of these via short tests &amp; your portfolio.
      </p>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          ← Back
        </button>
        <button
          id="skills-next-btn"
          onClick={onNext}
          className="flex-[2] py-3.5 rounded-xl font-semibold text-white transition-all duration-200"
          style={{
            background: 'var(--accent)',
            boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
          }}
        >
          Looks good →
        </button>
      </div>
    </div>
  );
}

/* ─── Step 3 — Evidence Hub ──────────────────────────────────────── */

function StepEvidence({ onFinish, onBack, saving }) {
  const [connected, setConnected] = useState({});

  const toggle = (id) => setConnected((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="w-full max-w-xl mx-auto animate-fadein">
      <p className="text-indigo-500 text-sm font-semibold mb-1 tracking-wide uppercase">Step 3 of 3</p>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Evidence Hub</h2>
      <p className="text-slate-500 mb-8">Connect your existing work so we can auto-assess your skills. (All optional)</p>

      <div className="space-y-3 mb-6">
        {EVIDENCE_SOURCES.map(({ id, emoji, label, desc }) => {
          const done = connected[id];
          return (
            <div
              key={id}
              className="flex items-center justify-between p-4 rounded-xl border transition-all duration-200"
              style={{
                background:   done ? '#F0FDF4' : '#fff',
                borderColor:  done ? '#86EFAC' : '#E2E8F0',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{emoji}</span>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </div>
              <button
                id={`connect-${id}`}
                onClick={() => toggle(id)}
                className="text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                style={{
                  background: done ? '#DCFCE7' : 'var(--accent-light)',
                  color:      done ? '#15803D' : 'var(--accent)',
                  border:     `1px solid ${done ? '#86EFAC' : '#C7D2FE'}`,
                }}
              >
                {done ? '✓ Connected' : 'Connect'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          ← Back
        </button>
        <button
          id="finish-onboarding-btn"
          onClick={onFinish}
          disabled={saving}
          className="flex-[2] py-3.5 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background: saving ? '#A5B4FC' : 'var(--accent)',
            boxShadow: saving ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Setting up…
            </>
          ) : (
            'Finish & Start →'
          )}
        </button>
      </div>

      <p className="text-center">
        <button
          id="skip-evidence-btn"
          onClick={onFinish}
          className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
        >
          Skip for now
        </button>
      </p>
    </div>
  );
}

/* ─── Main Onboarding Component ───────────────────────────────────── */

export default function Onboarding() {
  const { setStudent, setCurrentPage } = useApp();

  const [step,     setStep]     = useState(1);
  const [role,     setRole]     = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const handleFinish = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: 'Alex Kumar',
        targetRole: role.label,
        skills: role.skills,
        onboardingDone: true,
      };
      const res = await axios.post('/api/student', payload);
      setStudent(res.data);
      setCurrentPage('practice');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  return (
    <>
      {/* Keyframes injected inline so they're always available */}
      <style>{`
        @keyframes skillPop {
          from { opacity: 0; transform: scale(0.75) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein { animation: fadein 0.35s ease both; }
      `}</style>

      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
        style={{ background: 'var(--main-bg)' }}
      >
        {/* Brand mark */}
        <div className="mb-10 flex items-center gap-2">
          <span
            className="flex items-center justify-center rounded-xl text-white text-lg font-bold"
            style={{ width: 40, height: 40, background: 'var(--accent)' }}
          >
            ⚡
          </span>
          <span className="text-2xl font-bold text-slate-800">
            Career <span style={{ color: 'var(--accent)' }}>OS</span>
          </span>
        </div>

        {/* Step dots */}
        <StepDots step={step} />

        {/* Error */}
        {error && (
          <div className="w-full max-w-xl mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Step content */}
        {step === 1 && (
          <StepGoal
            selected={role}
            onSelect={setRole}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StepSkills
            role={role}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepEvidence
            onFinish={handleFinish}
            onBack={() => setStep(2)}
            saving={saving}
          />
        )}
      </div>
    </>
  );
}
