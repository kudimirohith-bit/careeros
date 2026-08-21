import { useState, useEffect } from 'react';
import { api } from '../api/api';
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

function clamp(v) { return Math.min(100, Math.max(0, Math.round(v))); }

function computeScores(mcqAnswers, textAnswers) {
  const pct = (sectionIdx, total) => {
    const answers = mcqAnswers[sectionIdx] || {};
    const correct = SECTIONS[sectionIdx].questions.filter(
      (q, i) => answers[i] === q.correct
    ).length;
    return Math.round((correct / total) * 100);
  };

  const aptitude = pct(0, 5);
  const coding = pct(1, 3);
  const technical = pct(2, 3);

  const commScore = textAnswers.reduce((sum, txt) => {
    const words = txt.trim().split(/\s+/).filter(Boolean).length;
    const sentences = (txt.match(/[.!?]/g) || []).length;
    const wordScore = Math.min(words * 3, 60);
    const structScore = Math.min(sentences * 10, 40);
    return sum + wordScore + structScore;
  }, 0) / (textAnswers.length || 1);

  const communication = clamp(commScore);

  return { aptitude, coding, technical, communication };
}

/* ─── Progress Bar ────────────────────────────────────────────────── */
function ProgressBar({ current }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-0 mb-3">
        {SECTIONS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold transition-all duration-300 mb-1.5"
                  style={{
                    background: done ? '#8B5CF6' : active ? 'rgba(139, 92, 246, 0.15)' : '#1B1E27',
                    color: done ? '#FFF' : active ? '#A78BFA' : '#737B8C',
                    border: active ? '2px solid #8B5CF6' : '2px solid transparent',
                  }}
                >
                  {done ? '✓' : s.icon}
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: active ? '#A78BFA' : done ? '#737B8C' : '#525966' }}
                >
                  {s.label}
                </span>
              </div>
              {i < SECTIONS.length - 1 && (
                <div
                  className="h-0.5 flex-1 mx-1 mb-5 rounded-full transition-all duration-500"
                  style={{ background: done ? '#8B5CF6' : '#282D38' }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="h-1 rounded-full bg-[#1B1E27] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 bg-[#8B5CF6]"
          style={{ width: `${(current / SECTIONS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ─── MCQ Section ─────────────────────────────────────────────────── */
function McqSection({ section, sectionIdx, answers, onChange }) {
  return (
    <div className="space-y-4">
      {section.questions.map((q, qi) => (
        <div key={qi} className="p-5 rounded-xl bg-[#171A22] border border-[#282D38]">
          <p className="font-semibold text-[#F5F7FA] text-sm mb-4 leading-relaxed flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-[#8B5CF6]/20 text-[#A78BFA] shrink-0 mt-0.5">
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
                  className="text-left px-4 py-3 rounded-lg text-xs font-medium transition-all duration-150 border"
                  style={{
                    background: selected ? 'rgba(139, 92, 246, 0.15)' : '#1B1E27',
                    borderColor: selected ? '#8B5CF6' : '#282D38',
                    color: selected ? '#A78BFA' : '#A7ADBA',
                  }}
                >
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs mr-2 font-bold"
                    style={{
                      background: selected ? '#8B5CF6' : '#282D38',
                      color: selected ? '#FFF' : '#737B8C',
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
    <div className="space-y-4">
      {section.questions.map((q, qi) => (
        <div key={qi} className="p-5 rounded-xl bg-[#171A22] border border-[#282D38]">
          <p className="font-semibold text-[#F5F7FA] text-sm mb-3 leading-relaxed flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-[#8B5CF6]/20 text-[#A78BFA] shrink-0 mt-0.5">
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
            className="w-full px-4 py-3 rounded-lg text-xs text-[#F5F7FA] resize-none outline-none transition-all duration-150 bg-[#1B1E27] border border-[#282D38] focus:border-[#8B5CF6]"
          />
          <p className="text-[11px] text-[#737B8C] mt-1.5 text-right">
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
    { label: 'Aptitude', value: scores.aptitude, color: '#8B5CF6' },
    { label: 'Coding', value: scores.coding, color: '#3B82F6' },
    { label: 'Technical', value: scores.technical, color: '#06B6D4' },
    { label: 'Communication', value: scores.communication, color: '#34D399' },
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
        className="p-8 rounded-2xl bg-[#171A22] border border-[#282D38] w-full max-w-md text-center"
        style={{ animation: 'resultPop 0.5s cubic-bezier(.34,1.56,.64,1) both' }}
      >
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-[#F5F7FA] mb-1">Assessment Complete!</h2>
        <p className="text-[#A7ADBA] text-xs mb-8">Your skill profile has been calculated.</p>

        <div className="space-y-4 text-left">
          {bars.map(({ label, value, color }, i) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-semibold text-[#F5F7FA]">{label}</span>
                <span className="text-xs font-bold" style={{ color }}>{value}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#1B1E27] overflow-hidden">
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

        <p className="text-xs text-[#737B8C] mt-8 animate-pulse">
          Saving results & heading to your dashboard…
        </p>
      </div>
    </div>
  );
}

/* ─── Main Assessment Page ──────────────────────────────────────── */
export default function AssessmentPage() {
  const { student, setStudent, setCurrentPage } = useApp();

  const [sectionIdx, setSectionIdx] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState([{}, {}, {}]);
  const [textAnswers, setTextAnswers] = useState(['', '']);
  const [submitting, setSubmitting] = useState(false);
  const [scores, setScores] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!scores) return;
    const t = setTimeout(() => setCurrentPage('dashboard'), 2500);
    return () => clearTimeout(t);
  }, [scores, setCurrentPage]);

  const section = SECTIONS[sectionIdx];
  const isLast = sectionIdx === SECTIONS.length - 1;

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
      const sectionScores = computeScores(mcqAnswers, textAnswers);
      const aptScore = sectionScores.aptitude;
      const codScore = sectionScores.coding;
      const techScore = sectionScores.technical;
      const commScore = sectionScores.communication;

      const updatedSkills = (student?.skills || []).map((skill) => {
        let current = skill.current;
        switch (skill.name) {
          case 'DSA':           current = Math.round(aptScore * 0.4 + codScore * 0.6); break;
          case 'Backend':       current = Math.round(codScore * 0.6 + techScore * 0.4); break;
          case 'DBMS':          current = Math.round(techScore * 0.7 + aptScore * 0.3); break;
          case 'Aptitude':      current = aptScore; break;
          case 'Communication': current = commScore; break;
          case 'Interview':     current = Math.round(commScore * 0.6 + aptScore * 0.4); break;
          case 'System Design': current = Math.round(techScore * 0.5); break;
          case 'Testing':       current = Math.round(techScore * 0.5 + codScore * 0.2); break;
          default:              current = Math.round((aptScore + codScore + techScore) / 3);
        }
        current = Math.min(100, Math.max(5, current + Math.round((Math.random() - 0.5) * 10)));
        return { ...skill, current };
      });

      setScores(sectionScores);

      if (student?._id) {
        // 1. Submit assessment record to backend
        await api.submitAssessment({
          studentId: student._id,
          type: 'aptitude',
          scores: sectionScores,
          totalScore: Math.round((aptScore + codScore + techScore + commScore) / 4),
        });

        // 2. Update skills on student
        const updatedStudent = await api.updateSkills(
          student._id,
          updatedSkills,
          'Initial assessment completed'
        );
        setStudent(updatedStudent);
      }
    } catch (err) {
      console.error('Assessment submission error:', err);
      setError(err.message || 'Failed to save results. Please try again.');
      setSubmitting(false);
    }
  };

  if (scores) return <ResultsScreen scores={scores} />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F5F7FA]">Initial Assessment</h1>
        <p className="text-[#A7ADBA] text-xs mt-1">
          Complete all 4 sections so we can calibrate your skill profile accurately.
        </p>
      </div>

      <ProgressBar current={sectionIdx} />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          ⚠️ {error}
        </div>
      )}

      <div key={section.id}>
        <div className="flex items-center gap-2 mb-5">
          <span className="text-2xl">{section.icon}</span>
          <div>
            <h2 className="text-base font-bold text-[#F5F7FA]">{section.label}</h2>
            <p className="text-xs text-[#737B8C]">
              {answeredCount}/{totalCount} answered
              {sectionComplete && (
                <span className="ml-2 text-[#34D399] font-semibold">✓ Complete</span>
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

      <div className="flex items-center gap-3 mt-8">
        {sectionIdx > 0 && (
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-xl font-semibold text-[#F5F7FA] border border-[#282D38] bg-[#171A22] hover:bg-[#1B1E27] transition-colors text-xs"
          >
            ← Back
          </button>
        )}

        <div className="flex-1" />

        <span className="text-xs text-[#737B8C] font-medium hidden sm:block">
          Section {sectionIdx + 1} of {SECTIONS.length}
        </span>

        {isLast ? (
          <button
            id="submit-assessment-btn"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 rounded-xl font-semibold text-white bg-[#8B5CF6] transition-all duration-200 flex items-center gap-2 text-xs"
            style={{
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
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
            className="px-8 py-3 rounded-xl font-semibold text-white bg-[#8B5CF6] transition-all duration-200 text-xs"
          >
            Next Section →
          </button>
        )}
      </div>
    </div>
  );
}
