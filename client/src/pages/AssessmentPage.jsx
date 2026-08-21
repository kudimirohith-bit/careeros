import { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';

/* ─── Question Data ──────────────────────────────────────────────── */
const SECTIONS = [
  {
    id: 'aptitude',
    label: 'Aptitude',
    icon: '🧮',
    type: 'mcq',
    questions: [
      {
        q: 'If a train travels 60 km in 45 minutes, what is its speed in km/h?',
        options: ['70 km/h', '80 km/h', '90 km/h', '75 km/h'],
        correct: 1,
      },
      {
        q: 'Find the odd one out: 2, 3, 5, 7, 11, 12, 13',
        options: ['11', '12', '13', '7'],
        correct: 1,
      },
      {
        q: 'A is 2 years older than B who is twice as old as C. If total ages = 27, how old is B?',
        options: ['7', '8', '10', '12'],
        correct: 2,
      },
      {
        q: 'Complete the series: 1, 4, 9, 16, 25, ?',
        options: ['30', '35', '36', '40'],
        correct: 2,
      },
      {
        q: 'If MANGO is coded as OCPIQ, how is APPLE coded?',
        options: ['CRRNG', 'BQQMF', 'DRRNG', 'CQQNG'],
        correct: 0,
      },
    ],
  },
  {
    id: 'coding',
    label: 'Coding',
    icon: '💻',
    type: 'mcq',
    questions: [
      {
        q: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        correct: 1,
      },
      {
        q: 'Which data structure uses LIFO (Last In, First Out)?',
        options: ['Queue', 'Array', 'Stack', 'Linked List'],
        correct: 2,
      },
      {
        q: 'What does REST stand for?',
        options: [
          'Representational State Transfer',
          'Remote Execution Service Transfer',
          'Reliable State Technology',
          'Resource Entity Service Type',
        ],
        correct: 0,
      },
    ],
  },
  {
    id: 'technical',
    label: 'Technical',
    icon: '🔧',
    type: 'mcq',
    questions: [
      {
        q: 'What is a primary key in a database?',
        options: [
          'A key that can be NULL',
          'A unique identifier for each record',
          'A foreign reference to another table',
          'An index on a column',
        ],
        correct: 1,
      },
      {
        q: "What does 'git commit' do?",
        options: [
          'Uploads changes to GitHub',
          'Saves a snapshot of staged changes',
          'Creates a new branch',
          'Merges two branches',
        ],
        correct: 1,
      },
      {
        q: 'What is the primary purpose of an API?',
        options: [
          'To design relational databases',
          'To style web pages with CSS',
          'To allow applications to communicate with each other',
          'To host web servers',
        ],
        correct: 2,
      },
    ],
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: '🎤',
    type: 'text',
    questions: [
      {
        q: 'Describe a project you\'ve worked on in 2–3 sentences.',
        placeholder: 'e.g. I built a web app that helps students track their study goals…',
      },
      {
        q: 'Explain what Object-Oriented Programming (OOP) means to someone non-technical.',
        placeholder: 'Imagine OOP like building with LEGO…',
      },
    ],
  },
];

/* ─── Score computation ──────────────────────────────────────────── */
function noise(range = 5) {
  return Math.round((Math.random() - 0.5) * 2 * range);
}

function clamp(v) { return Math.min(100, Math.max(0, Math.round(v))); }

function computeScores(mcqAnswers, textAnswers) {
  const pct = (sectionIdx, total) => {
    const answers = mcqAnswers[sectionIdx] || {};
    const correct = SECTIONS[sectionIdx].questions.filter(
      (q, i) => answers[i] === q.correct
    ).length;
    return Math.round((correct / total) * 100);
  };

  const aptitude    = pct(0, 5);
  const coding      = pct(1, 3);
  const technical   = pct(2, 3);

  // Communication: heuristic on word count + punctuation
  const commScore = textAnswers.reduce((sum, txt) => {
    const words = txt.trim().split(/\s+/).filter(Boolean).length;
    const sentences = (txt.match(/[.!?]/g) || []).length;
    const wordScore = Math.min(words * 3, 60);
    const structScore = Math.min(sentences * 10, 40);
    return sum + wordScore + structScore;
  }, 0) / textAnswers.length;
  const communication = clamp(commScore);

  return {
    aptitude,
    coding,
    technical,
    communication,
    derived: {
      DSA:            clamp(aptitude * 0.4 + coding * 0.6 + noise(5)),
      Programming:    clamp(coding * 0.7 + aptitude * 0.3 + noise(4)),
      'Node.js':      clamp(coding * 0.7 + technical * 0.3 + noise(4)),
      APIs:           clamp(technical * 0.6 + coding * 0.4 + noise(3)),
      Databases:      clamp(technical * 0.8 + aptitude * 0.2 + noise(3)),
      SQL:            clamp(technical * 0.8 + aptitude * 0.2 + noise(4)),
      MongoDB:        clamp(technical * 0.7 + coding * 0.3 + noise(4)),
      'System Design':clamp(aptitude * 0.5 + technical * 0.5 + noise(5)),
      Communication:  clamp(communication),
      'Interview Prep': clamp(communication * 0.5 + aptitude * 0.5 + noise(4)),
      JavaScript:     clamp(coding * 0.8 + aptitude * 0.2 + noise(4)),
      React:          clamp(coding * 0.7 + technical * 0.3 + noise(5)),
      'HTML/CSS':     clamp(coding * 0.6 + technical * 0.2 + noise(5)),
      Python:         clamp(coding * 0.8 + aptitude * 0.2 + noise(4)),
      ML:             clamp(aptitude * 0.4 + technical * 0.6 + noise(5)),
      'Deep Learning':clamp(aptitude * 0.3 + technical * 0.7 + noise(5)),
      Mathematics:    clamp(aptitude * 0.9 + noise(4)),
      'Data Viz':     clamp(technical * 0.5 + aptitude * 0.5 + noise(4)),
      Statistics:     clamp(aptitude * 0.8 + technical * 0.2 + noise(4)),
      'ML Basics':    clamp(aptitude * 0.5 + technical * 0.5 + noise(4)),
      'Problem Solving': clamp(aptitude * 0.7 + coding * 0.3 + noise(3)),
      Excel:          clamp(aptitude * 0.6 + noise(5)),
      Git:            clamp(technical * 0.7 + coding * 0.3 + noise(3)),
      Testing:        clamp(technical * 0.7 + coding * 0.3 + noise(3)),
      NLP:            clamp(technical * 0.6 + aptitude * 0.4 + noise(5)),
      'UI/UX':        clamp(technical * 0.4 + aptitude * 0.3 + noise(5)),
    },
  };
}

/* ─── Progress Bar ────────────────────────────────────────────────── */
function ProgressBar({ current }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-0 mb-3">
        {SECTIONS.map((s, i) => {
          const done    = i < current;
          const active  = i === current;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold transition-all duration-300 mb-1.5"
                  style={{
                    background: done ? '#6366F1' : active ? '#EEF2FF' : '#F1F5F9',
                    color:      done ? '#fff'     : active ? '#6366F1' : '#94A3B8',
                    border:     active ? '2px solid #6366F1' : '2px solid transparent',
                    boxShadow:  active ? '0 0 0 4px rgba(99,102,241,0.15)' : 'none',
                  }}
                >
                  {done ? '✓' : s.icon}
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: active ? '#6366F1' : done ? '#64748B' : '#94A3B8' }}
                >
                  {s.label}
                </span>
              </div>
              {i < SECTIONS.length - 1 && (
                <div
                  className="h-0.5 flex-1 mx-1 mb-5 rounded-full transition-all duration-500"
                  style={{ background: done ? '#6366F1' : '#E2E8F0' }}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Thin progress track */}
      <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${((current) / SECTIONS.length) * 100}%`,
            background: 'linear-gradient(90deg, #6366F1, #818CF8)',
          }}
        />
      </div>
    </div>
  );
}

/* ─── MCQ Section ─────────────────────────────────────────────────── */
function McqSection({ section, sectionIdx, answers, onChange }) {
  return (
    <div className="space-y-6">
      {section.questions.map((q, qi) => (
        <div key={qi} className="card p-6">
          <p className="font-semibold text-slate-800 mb-4 leading-relaxed">
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2 flex-shrink-0"
              style={{ background: '#EEF2FF', color: '#6366F1' }}
            >
              {qi + 1}
            </span>
            {q.q}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi;
              return (
                <button
                  key={oi}
                  id={`q${sectionIdx}-${qi}-opt${oi}`}
                  onClick={() => onChange(qi, oi)}
                  className="text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 border"
                  style={{
                    background:  selected ? '#EEF2FF' : '#F8FAFC',
                    borderColor: selected ? '#6366F1' : '#E2E8F0',
                    color:       selected ? '#4338CA' : '#475569',
                    boxShadow:   selected ? '0 0 0 2px rgba(99,102,241,0.2)' : 'none',
                  }}
                >
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs mr-2 font-bold"
                    style={{
                      background: selected ? '#6366F1' : '#E2E8F0',
                      color:      selected ? '#fff' : '#64748B',
                    }}
                  >
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Communication Section ──────────────────────────────────────── */
function TextSection({ section, answers, onChange }) {
  return (
    <div className="space-y-6">
      {section.questions.map((q, qi) => (
        <div key={qi} className="card p-6">
          <p className="font-semibold text-slate-800 mb-3 leading-relaxed">
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2"
              style={{ background: '#EEF2FF', color: '#6366F1' }}
            >
              {qi + 1}
            </span>
            {q.q}
          </p>
          <textarea
            id={`comm-${qi}`}
            rows={4}
            value={answers[qi] || ''}
            onChange={(e) => onChange(qi, e.target.value)}
            placeholder={q.placeholder}
            className="w-full px-4 py-3 rounded-xl text-sm text-slate-700 resize-none outline-none transition-all duration-150"
            style={{
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#6366F1')}
            onBlur={(e)  => (e.target.style.borderColor = '#E2E8F0')}
          />
          <p className="text-xs text-slate-400 mt-1.5 text-right">
            {(answers[qi] || '').trim().split(/\s+/).filter(Boolean).length} words
          </p>
        </div>
      ))}
    </div>
  );
}

/* ─── Results Screen ─────────────────────────────────────────────── */
function ResultsScreen({ scores }) {
  const bars = [
    { label: 'Aptitude',      value: scores.aptitude,      color: '#6366F1' },
    { label: 'Coding',        value: scores.coding,        color: '#8B5CF6' },
    { label: 'Technical',     value: scores.technical,     color: '#06B6D4' },
    { label: 'Communication', value: scores.communication, color: '#10B981' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <style>{`
        @keyframes barGrow { from { width: 0; } }
        @keyframes resultPop {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
      <div
        className="card p-8 w-full max-w-md text-center"
        style={{ animation: 'resultPop 0.5s cubic-bezier(.34,1.56,.64,1) both' }}
      >
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Assessment Complete!</h2>
        <p className="text-slate-500 text-sm mb-8">Your skill profile has been calculated.</p>

        <div className="space-y-4 text-left">
          {bars.map(({ label, value, color }, i) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <span className="text-sm font-bold" style={{ color }}>{value}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${value}%`,
                    background: color,
                    animation: `barGrow 0.8s ease ${i * 0.15}s both`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 mt-8 animate-pulse">
          Saving results & heading to your dashboard…
        </p>
      </div>
    </div>
  );
}

/* ─── Main Assessment Page ──────────────────────────────────────── */
export default function AssessmentPage() {
  const { student, setStudent, setCurrentPage } = useApp();

  const [sectionIdx,  setSectionIdx]  = useState(0);
  const [mcqAnswers,  setMcqAnswers]  = useState([{}, {}, {}]);   // 3 MCQ sections
  const [textAnswers, setTextAnswers] = useState(['', '']);        // comm section
  const [submitting,  setSubmitting]  = useState(false);
  const [scores,      setScores]      = useState(null);
  const [error,       setError]       = useState('');

  // After results screen shown, navigate to dashboard
  useEffect(() => {
    if (!scores) return;
    const t = setTimeout(() => setCurrentPage('dashboard'), 2800);
    return () => clearTimeout(t);
  }, [scores, setCurrentPage]);

  const section = SECTIONS[sectionIdx];
  const isLast  = sectionIdx === SECTIONS.length - 1;

  // Per-section answer helpers
  const setMcqAnswer = (qi, oi) => {
    setMcqAnswers((prev) => {
      const copy = [...prev];
      copy[sectionIdx] = { ...copy[sectionIdx], [qi]: oi };
      return copy;
    });
  };

  const setTextAnswer = (qi, val) => {
    setTextAnswers((prev) => {
      const copy = [...prev];
      copy[qi] = val;
      return copy;
    });
  };

  // Count answered in current section
  const answeredCount = section.type === 'mcq'
    ? Object.keys(mcqAnswers[sectionIdx] || {}).length
    : textAnswers.filter((t) => t.trim().length > 10).length;
  const totalCount = section.questions.length;
  const sectionComplete = answeredCount === totalCount;

  const handleNext = () => setSectionIdx((p) => p + 1);
  const handleBack = () => setSectionIdx((p) => p - 1);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const computed = computeScores(mcqAnswers, textAnswers);
      setScores(computed);

      // Map derived scores onto student's existing skills
      const updatedSkills = (student?.skills || []).map((sk) => ({
        ...sk,
        current: computed.derived[sk.name] ?? sk.current,
      }));

      if (student?._id) {
        const res = await axios.post(
          `/api/student/${student._id}/update-skills`,
          { skills: updatedSkills }
        );
        setStudent(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to save results. Please try again.');
      setSubmitting(false);
    }
  };

  /* ── Render results screen ── */
  if (scores) return <ResultsScreen scores={scores} />;

  return (
    <div className="max-w-2xl mx-auto">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .slide-in { animation: slideIn 0.3s ease both; }
      `}</style>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Initial Assessment</h1>
        <p className="text-slate-500 text-sm mt-1">
          Complete all 4 sections so we can calibrate your skill profile accurately.
        </p>
      </div>

      {/* Progress bar */}
      <ProgressBar current={sectionIdx} />

      {/* Error banner */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Section questions */}
      <div key={section.id} className="slide-in">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-2xl">{section.icon}</span>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{section.label}</h2>
            <p className="text-xs text-slate-400">
              {answeredCount}/{totalCount} answered
              {sectionComplete && (
                <span className="ml-2 text-emerald-600 font-semibold">✓ Complete</span>
              )}
            </p>
          </div>
        </div>

        {section.type === 'mcq' ? (
          <McqSection
            section={section}
            sectionIdx={sectionIdx}
            answers={mcqAnswers[sectionIdx] || {}}
            onChange={setMcqAnswer}
          />
        ) : (
          <TextSection
            section={section}
            answers={textAnswers}
            onChange={setTextAnswer}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-8">
        {sectionIdx > 0 && (
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            ← Back
          </button>
        )}

        <div className="flex-1" />

        {/* Completion chip */}
        <span className="text-xs text-slate-400 font-medium hidden sm:block">
          Section {sectionIdx + 1} of {SECTIONS.length}
        </span>

        {isLast ? (
          <button
            id="submit-assessment-btn"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 flex items-center gap-2"
            style={{
              background: submitting ? '#A5B4FC' : 'var(--accent)',
              boxShadow:  submitting ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
              cursor:     submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Calculating…
              </>
            ) : (
              'Submit Assessment →'
            )}
          </button>
        ) : (
          <button
            id={`next-section-${sectionIdx}`}
            onClick={handleNext}
            className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200"
            style={{
              background: 'var(--accent)',
              boxShadow:  '0 4px 14px rgba(99,102,241,0.35)',
            }}
          >
            Next Section →
          </button>
        )}
      </div>
    </div>
  );
}
