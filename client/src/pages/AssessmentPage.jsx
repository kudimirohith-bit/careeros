import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { callGemini } from '../utils/ai';

function parseJSON(raw) {
  try {
    // Try array first
    const ai = raw.indexOf('[');
    const ao = raw.lastIndexOf(']');
    if (ai !== -1 && ao !== -1 && (raw.indexOf('{') === -1 || ai < raw.indexOf('{')))
      return JSON.parse(raw.substring(ai, ao + 1));
    const oi = raw.indexOf('{');
    const oo = raw.lastIndexOf('}');
    if (oi !== -1 && oo !== -1) return JSON.parse(raw.substring(oi, oo + 1));
    return JSON.parse(raw);
  } catch { return null; }
}

function clamp(v) { return Math.min(100, Math.max(0, Math.round(v))); }

/* ── Static section shells (questions loaded from Claude) ────────── */
const SECTION_DEFS = [
  { id: 'aptitude',      label: 'Aptitude',      icon: '🧮', color: '#8B5CF6' },
  { id: 'coding',        label: 'Coding',         icon: '💻', color: '#3B82F6' },
  { id: 'communication', label: 'Communication',  icon: '🎤', color: '#34D399' },
  { id: 'database',      label: 'Database',       icon: '🗄️', color: '#FBBF24' },
];

/* ── Progress Bar ────────────────────────────────────────────────── */
function ProgressBar({ current }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-0 mb-3">
        {SECTION_DEFS.map((s, i) => {
          const done   = i < current;
          const active = i === current;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold transition-all duration-300 mb-1.5"
                  style={{
                    background: done ? '#8B5CF6' : active ? 'rgba(139,92,246,0.15)' : '#1B1E27',
                    color:      done ? '#FFF'     : active ? '#A78BFA'               : '#737B8C',
                    border:     active ? '2px solid #8B5CF6' : '2px solid transparent',
                  }}
                >
                  {done ? '✓' : s.icon}
                </div>
                <span className="text-xs font-semibold" style={{ color: active ? '#A78BFA' : done ? '#737B8C' : '#525966' }}>
                  {s.label}
                </span>
              </div>
              {i < SECTION_DEFS.length - 1 && (
                <div className="h-0.5 flex-1 mx-1 mb-5 rounded-full transition-all duration-500"
                  style={{ background: done ? '#8B5CF6' : '#282D38' }} />
              )}
            </div>
          );
        })}
      </div>
      <div className="h-1 rounded-full bg-[#1B1E27] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500 bg-[#8B5CF6]"
          style={{ width: `${(current / SECTION_DEFS.length) * 100}%` }} />
      </div>
    </div>
  );
}

/* ── MCQ Question Card ───────────────────────────────────────────── */
function McqCard({ q, qi, sectionIdx, answer, onAnswer }) {
  const submitted = answer !== undefined;
  const isCorrect = answer === q.correct;

  return (
    <div className="p-5 rounded-xl bg-[#171A22] border border-[#282D38] space-y-3">
      <p className="font-semibold text-[#F5F7FA] text-sm leading-relaxed flex items-start gap-2">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-[#8B5CF6]/20 text-[#A78BFA] shrink-0 mt-0.5">
          {qi + 1}
        </span>
        {q.q}
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {q.options.map((opt, oi) => {
          const selected  = answer === oi;
          const isRight   = oi === q.correct;
          let bg          = '#1B1E27';
          let border      = '#282D38';
          let color       = '#A7ADBA';

          if (submitted) {
            if (isRight)            { bg = 'rgba(52,211,153,0.12)'; border = 'rgba(52,211,153,0.4)'; color = '#34D399'; }
            else if (selected)      { bg = 'rgba(248,113,113,0.12)'; border = 'rgba(248,113,113,0.4)'; color = '#F87171'; }
          } else if (selected) {
            bg = 'rgba(139,92,246,0.15)'; border = '#8B5CF6'; color = '#A78BFA';
          }

          return (
            <button
              key={oi}
              id={`q${sectionIdx}-${qi}-opt${oi}`}
              onClick={() => !submitted && onAnswer(qi, oi)}
              disabled={submitted}
              className="text-left px-4 py-3 rounded-lg text-xs font-medium transition-all duration-150 border"
              style={{ background: bg, borderColor: border, color }}
            >
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs mr-2 font-bold"
                style={{ background: submitted ? (isRight ? '#34D399' : selected ? '#F87171' : '#282D38') : (selected ? '#8B5CF6' : '#282D38'), color: '#FFF' }}
              >
                {String.fromCharCode(65 + oi)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation shown after answering */}
      {submitted && q.explanation && (
        <div
          className="px-3 py-2 rounded-lg text-xs font-medium border"
          style={{
            background:   isCorrect ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.08)',
            borderColor:  isCorrect ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.25)',
            color:        isCorrect ? '#34D399' : '#FBBF24',
          }}
        >
          {isCorrect ? '✅' : '⚠️'} {q.explanation}
        </div>
      )}
    </div>
  );
}

/* ── Results Screen ─────────────────────────────────────────────── */
function ResultsScreen({ sectionScores, aiInsight, aiSkillDeltas, onContinue }) {
  const bars = SECTION_DEFS.map((s, i) => ({
    label: s.label,
    value: sectionScores[i] ?? 0,
    color: s.color,
  }));

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
        className="p-8 rounded-2xl bg-[#171A22] border border-[#282D38] w-full max-w-lg text-center space-y-6"
        style={{ animation: 'resultPop 0.5s cubic-bezier(.34,1.56,.64,1) both' }}
      >
        <div>
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-[#F5F7FA]">Assessment Complete!</h2>
          <p className="text-[#A7ADBA] text-xs mt-1">Your skill profile has been updated with AI analysis.</p>
        </div>

        {/* Score bars */}
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
                  style={{ width: `${value}%`, background: color, animation: `barGrow 0.8s ease ${i * 0.15}s both` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* AI insight */}
        {aiInsight && (
          <div className="px-4 py-3 rounded-xl bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.25)] text-left">
            <p className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-wider mb-1">🤖 AI Insight</p>
            <p className="text-xs text-[#C4B5FD] leading-relaxed">{aiInsight}</p>
          </div>
        )}

        {/* Skill deltas */}
        {aiSkillDeltas?.length > 0 && (
          <div className="space-y-1.5 text-left">
            <p className="text-[10px] font-bold text-[#737B8C] uppercase tracking-wider">Skill Updates Applied</p>
            {aiSkillDeltas.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-[#1B1E27] border border-[#282D38]">
                <span className="text-[#F5F7FA] font-medium">{s.name}</span>
                <span className="font-bold" style={{ color: s.delta >= 0 ? '#34D399' : '#F87171' }}>
                  {s.delta >= 0 ? '+' : ''}{s.delta}%
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onContinue}
          className="w-full py-3 rounded-xl font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] transition-colors text-sm"
        >
          Go to Dashboard →
        </button>
      </div>
    </div>
  );
}

/* ── Main Assessment Page ───────────────────────────────────────── */
export default function AssessmentPage() {
  const { student, setStudent, updateStudentSkills, recordTimelineEvent, showToast, setCurrentPage } = useApp();
  const targetRole = student?.targetRole ?? 'Software Engineer';

  const [sectionIdx,   setSectionIdx]   = useState(0);
  const [questions,    setQuestions]    = useState({}); // { sectionId: [{q,options,correct,explanation}] }
  const [loadingQs,    setLoadingQs]    = useState(false);
  const [answers,      setAnswers]      = useState({}); // { sectionId: { qi: oi } }
  const [submitting,   setSubmitting]   = useState(false);
  const [results,      setResults]      = useState(null);
  const [error,        setError]        = useState('');

  const section = SECTION_DEFS[sectionIdx];

  /* Load questions for the current section */
  useEffect(() => {
    const sid = section.id;
    if (questions[sid]) return; // already loaded
    setLoadingQs(true);
    const system = 'You generate skill assessment MCQs. Return ONLY a JSON array of 5 objects: [{"q":string,"options":[string,string,string,string],"correct":number,"explanation":string}] correct is 0-indexed. explanation is 1 sentence shown after answer. Difficulty: intermediate. No markdown.';
    const user   = `Generate 5 MCQ questions for assessing ${section.label} skills in a ${targetRole} interview context.`;
    callGemini(system, user)
      .then((raw) => {
        const parsed = parseJSON(raw);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          setQuestions((prev) => ({ ...prev, [sid]: parsed.slice(0, 5) }));
        } else {
          // minimal fallback
          setQuestions((prev) => ({ ...prev, [sid]: [{ q: `Describe a core ${section.label} concept.`, options: ['Option A', 'Option B', 'Option C', 'Option D'], correct: 0, explanation: 'Correct!' }] }));
        }
      })
      .catch(() => {
        setQuestions((prev) => ({ ...prev, [sid]: [{ q: `Describe a core ${section.label} concept.`, options: ['Option A', 'Option B', 'Option C', 'Option D'], correct: 0, explanation: 'Correct!' }] }));
      })
      .finally(() => setLoadingQs(false));
  }, [sectionIdx]); // eslint-disable-line

  const sectionQs   = questions[section.id] ?? [];
  const sectionAns  = answers[section.id]   ?? {};
  const answeredCount = Object.keys(sectionAns).length;
  const totalCount    = sectionQs.length;
  const sectionComplete = totalCount > 0 && answeredCount === totalCount;
  const isLast = sectionIdx === SECTION_DEFS.length - 1;

  const handleAnswer = (qi, oi) => {
    const sid = section.id;
    setAnswers((prev) => ({
      ...prev,
      [sid]: { ...(prev[sid] ?? {}), [qi]: oi },
    }));
  };

  const handleNext = () => setSectionIdx((p) => p + 1);
  const handleBack = () => setSectionIdx((p) => p - 1);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      // Compute per-section scores (percentage)
      const sectionScores = SECTION_DEFS.map((s) => {
        const qs  = questions[s.id] ?? [];
        const ans = answers[s.id]   ?? {};
        if (!qs.length) return 0;
        const correct = qs.filter((q, i) => ans[i] === q.correct).length;
        return Math.round((correct / qs.length) * 100);
      });

      // Ask Claude for skill gap analysis
      const scoreStr = SECTION_DEFS.map((s, i) => `${s.label}: ${sectionScores[i]}/100`).join(', ');
      const system2  = 'Return ONLY JSON: {"updatedSkills":[{"name":string,"delta":number,"advice":string}],"overallInsight":string} delta is +/- integer (0–10). advice is 1 sentence per skill.';
      const user2    = `Student completed skill assessment. Scores: ${scoreStr}. Role: ${targetRole}. Return skill adjustments and insight.`;

      let aiInsight    = '';
      let aiSkillDeltas = [];

      try {
        const raw2   = await callGemini(system2, user2);
        const parsed = parseJSON(raw2);
        if (parsed?.updatedSkills) {
          aiSkillDeltas = parsed.updatedSkills;
          aiInsight     = parsed.overallInsight ?? '';

          // Apply deltas to student.skills
          if (student?.skills) {
            const updatedSkills = student.skills.map((skill) => {
              const match = aiSkillDeltas.find((d) => d.name?.toLowerCase() === skill.name?.toLowerCase());
              const delta = match?.delta ?? 0;
              return { ...skill, current: clamp(skill.current + delta) };
            });
            await updateStudentSkills(updatedSkills, 'Completed Skill Assessment');
          }
        }
      } catch (e) {
        console.error('AI skill analysis failed:', e);
      }

      if (recordTimelineEvent) {
        const avgScore = Math.round(sectionScores.reduce((a, b) => a + b, 0) / (sectionScores.length || 1));
        recordTimelineEvent('Completed Skill Assessment', 'assessment', `Average Score: ${avgScore}%`);
      }
      if (showToast) showToast('Skill Assessment Completed & Saved! 🎉', 'success');

      setResults({ sectionScores, aiInsight, aiSkillDeltas });
    } catch (err) {
      console.error('Assessment error:', err);
      setError(err.message || 'Failed to complete assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (results) {
    return (
      <ResultsScreen
        sectionScores={results.sectionScores}
        aiInsight={results.aiInsight}
        aiSkillDeltas={results.aiSkillDeltas}
        onContinue={() => setCurrentPage('dashboard')}
      />
    );
  }

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
        {/* Section header */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-2xl">{section.icon}</span>
          <div>
            <h2 className="text-base font-bold text-[#F5F7FA]">{section.label}</h2>
            <p className="text-xs text-[#737B8C]">
              {loadingQs
                ? 'Generating questions…'
                : `${answeredCount}/${totalCount} answered`}
              {sectionComplete && <span className="ml-2 text-[#34D399] font-semibold">✓ Complete</span>}
            </p>
          </div>
        </div>

        {/* Loading skeleton */}
        {loadingQs && (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-5 rounded-xl bg-[#171A22] border border-[#282D38] space-y-3">
                <div className="h-3 bg-[#1B1E27] rounded-full w-4/5" />
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((o) => <div key={o} className="h-9 bg-[#1B1E27] rounded-lg" />)}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center gap-2 py-2">
              <span className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-[#A78BFA] font-medium">
                🤖 Claude is generating {section.label} questions…
              </span>
            </div>
          </div>
        )}

        {/* Questions */}
        {!loadingQs && (
          <div className="space-y-4">
            {sectionQs.map((q, qi) => (
              <McqCard
                key={qi}
                q={q}
                qi={qi}
                sectionIdx={sectionIdx}
                answer={sectionAns[qi]}
                onAnswer={handleAnswer}
              />
            ))}
          </div>
        )}
      </div>

      {/* Nav buttons */}
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
          Section {sectionIdx + 1} of {SECTION_DEFS.length}
        </span>

        {isLast ? (
          <button
            id="submit-assessment-btn"
            onClick={handleSubmit}
            disabled={submitting || loadingQs || !sectionComplete}
            className="px-8 py-3 rounded-xl font-semibold text-white bg-[#8B5CF6] transition-all duration-200 flex items-center gap-2 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analysing…</>
            ) : (
              'Submit Assessment →'
            )}
          </button>
        ) : (
          <button
            id={`next-section-${sectionIdx}`}
            onClick={handleNext}
            disabled={loadingQs || !sectionComplete}
            className="px-8 py-3 rounded-xl font-semibold text-white bg-[#8B5CF6] transition-all duration-200 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Next Section →
          </button>
        )}
      </div>
    </div>
  );
}
