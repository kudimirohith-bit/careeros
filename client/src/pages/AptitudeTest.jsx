import { useState, useEffect } from 'react';
import { callGemini } from '../utils/ai';
import { useApp } from '../context/AppContext';

function parseJSON(raw) {
  try {
    const s = raw.indexOf('[') !== -1 && (raw.indexOf('[') < raw.indexOf('{') || raw.indexOf('{') === -1)
      ? raw.indexOf('[') : raw.indexOf('{');
    const e = raw.lastIndexOf(raw[s] === '[' ? ']' : '}');
    if (s !== -1 && e !== -1) return JSON.parse(raw.substring(s, e + 1));
    return JSON.parse(raw);
  } catch { return null; }
}

/* ── Fallback questions ─────────────────────────────────────────── */
const FALLBACK_QUESTIONS = [
  { id:1,  topic:'Arithmetic',  q:'A train travels 60km in 45 minutes. Speed in km/h?', options:['70','80','90','75'], correct:1 },
  { id:2,  topic:'Logical',     q:'Complete: 3, 6, 11, 18, 27, ?', options:['36','38','35','40'], correct:1 },
  { id:3,  topic:'Verbal',      q:'Synonym of "Eloquent":', options:['Silent','Fluent','Angry','Shy'], correct:1 },
  { id:4,  topic:'Data Interp', q:'Q3 sales were 40 units; Q4 rose 25%. Q4 sales?', options:['48','50','52','45'], correct:1 },
  { id:5,  topic:'Logical',     q:'All A are B; all B are C. Which must be true?', options:['All A are C','All C are A','No A are C','Some B not C'], correct:0 },
  { id:6,  topic:'Arithmetic',  q:'A is 2y older than B, B is twice C. Total=27. B?', options:['7','8','10','12'], correct:2 },
  { id:7,  topic:'Logical',     q:'Odd one out: 2,3,5,7,11,12,13', options:['11','12','13','7'], correct:1 },
  { id:8,  topic:'Verbal',      q:'Antonym of "Benevolent":', options:['Kind','Generous','Malevolent','Caring'], correct:2 },
  { id:9,  topic:'Data Interp', q:'Pie: 30% Eng, 20% Arts, 50% Comm out of 200. Arts?', options:['30','40','50','60'], correct:1 },
  { id:10, topic:'Arithmetic',  q:'Complete: 1, 4, 9, 16, 25, ?', options:['30','35','36','40'], correct:2 },
];

const TOPIC_STYLES = {
  'Arithmetic':  { bg:'rgba(96,165,250,0.1)',  text:'#60A5FA', border:'rgba(96,165,250,0.25)' },
  'Logical':     { bg:'rgba(139,92,246,0.1)',  text:'#A78BFA', border:'rgba(139,92,246,0.25)' },
  'Verbal':      { bg:'rgba(52,211,153,0.1)',  text:'#34D399', border:'rgba(52,211,153,0.25)' },
  'Data Interp': { bg:'rgba(251,191,36,0.1)',  text:'#FBBF24', border:'rgba(251,191,36,0.25)' },
};

const TOPIC_COLORS = { 'Arithmetic':'#60A5FA','Logical':'#8B5CF6','Verbal':'#34D399','Data Interp':'#FBBF24' };

/* ── Sub-components ─────────────────────────────────────────────── */
function useCountdown(seconds) {
  const [rem, setRem] = useState(seconds);
  const [active, setActive] = useState(true);
  useEffect(() => {
    if (!active) return;
    if (rem <= 0) { setActive(false); return; }
    const t = setTimeout(() => setRem(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [rem, active]);
  const stop = () => setActive(false);
  const mm = String(Math.floor(rem / 60)).padStart(2, '0');
  const ss = String(rem % 60).padStart(2, '0');
  return { display: `${mm}:${ss}`, remaining: rem, expired: rem === 0, stop };
}

function AnimBar({ value, color = '#8B5CF6', delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), delay + 80); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div className="h-2 rounded-full bg-[#1B1E27] overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${w}%`, background: color }} />
    </div>
  );
}

function TopicBadge({ topic }) {
  const s = TOPIC_STYLES[topic] ?? TOPIC_STYLES['Logical'];
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}>{topic}</span>
  );
}

function AiAnalysisCard({ analysis, loading }) {
  return (
    <div className="rounded-xl overflow-hidden border border-[rgba(139,92,246,0.3)] bg-[#171A22]">
      <div className="px-5 py-3.5 flex items-center gap-3 bg-[#1B1E27] border-b border-[#282D38]">
        <span className="text-xl text-[#A78BFA] bg-[rgba(139,92,246,0.12)] p-1.5 rounded-lg">🤖</span>
        <div>
          <p className="text-[#F5F7FA] font-bold text-sm">AI Placement Coach</p>
          <p className="text-[#737B8C] text-[11px]">Personalised analysis</p>
        </div>
      </div>
      <div className="p-5 space-y-4">
        {loading ? (
          <div className="space-y-3 animate-pulse py-2">
            <p className="text-xs text-[#A7ADBA] flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
              Analysing your performance…
            </p>
            <div className="h-2.5 bg-[#1B1E27] rounded-full w-full" />
            <div className="h-2.5 bg-[#1B1E27] rounded-full w-5/6" />
            <div className="h-2.5 bg-[#1B1E27] rounded-full w-4/5" />
          </div>
        ) : analysis ? (
          <>
            {analysis.strongAreas?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-[#34D399] uppercase tracking-wider mb-2">Strong Areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.strongAreas.map(a => <TopicBadge key={a} topic={a} />)}
                </div>
              </div>
            )}
            {analysis.weakAreas?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-[#F87171] uppercase tracking-wider mb-2">Weak Areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.weakAreas.map(a => <TopicBadge key={a} topic={a} />)}
                </div>
              </div>
            )}
            {analysis.studyPlan && (
              <div className="p-3 rounded-xl bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.2)]">
                <p className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-wider mb-1">Study Plan</p>
                <p className="text-xs text-[#A7ADBA] leading-relaxed">{analysis.studyPlan}</p>
              </div>
            )}
            {analysis.tips?.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-[#FBBF24] uppercase tracking-wider">Actionable Tips</p>
                {analysis.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#A7ADBA]">
                    <span className="text-[#FBBF24] flex-shrink-0">💡</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

function Results({ questions, answers, timeLeft, onRetry }) {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analysing, setAnalysing] = useState(true);

  const total   = questions.length;
  const correct = questions.filter((q, i) => answers[i] === q.correct).length;
  const pct     = Math.round((correct / total) * 100);
  const timeTaken = 900 - timeLeft;
  const avgTime   = 540;

  const topics = ['Arithmetic', 'Logical', 'Verbal', 'Data Interp'];
  const topicScores = {};
  topics.forEach(topic => {
    const qs = questions.filter(q => q.topic === topic);
    const ok = qs.filter(q => answers[questions.indexOf(q)] === q.correct).length;
    topicScores[topic] = qs.length ? Math.round((ok / qs.length) * 100) : 0;
  });

  const correctTopics = questions.filter((q, i) => answers[i] === q.correct).map(q => q.topic);
  const wrongTopics   = questions.filter((q, i) => answers[i] !== q.correct).map(q => q.topic);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const system = 'You are a placement coach. Return ONLY JSON: {"weakAreas":[string],"strongAreas":[string],"tips":[string],"studyPlan":string} weakAreas/strongAreas: topic names. tips: 3 actionable strings. studyPlan: 2-sentence personalised study advice.';
        const user   = `Student answered ${correct}/${total} correctly. Correct topics: ${correctTopics.join(', ') || 'none'}. Wrong topics: ${wrongTopics.join(', ') || 'none'}. Analyse and advise.`;
        const raw    = await callGemini(system, user);
        const parsed = parseJSON(raw);
        setAiAnalysis(parsed ?? { weakAreas: [], strongAreas: [], tips: ['Review incorrect answers carefully.'], studyPlan: 'Focus on weak topic areas before retaking the test.' });
      } catch {
        setAiAnalysis({ weakAreas: [], strongAreas: [], tips: ['Review incorrect answers carefully.'], studyPlan: 'Focus on weak topic areas before retaking the test.' });
      } finally {
        setAnalysing(false);
      }
    }
    fetchAnalysis();
  }, []); // eslint-disable-line

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Score card */}
      <div className="card p-6 text-center bg-[#171A22] border border-[#282D38]">
        <p className="text-5xl font-black mb-1" style={{ color: pct >= 70 ? '#34D399' : pct >= 50 ? '#FBBF24' : '#F87171' }}>
          {pct}%
        </p>
        <p className="text-[#A7ADBA] text-sm font-semibold">{correct} / {total} correct</p>
        <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-[#282D38]">
          <div className="text-center">
            <p className="text-base font-bold text-[#F5F7FA]">{Math.floor(timeTaken / 60)}:{String(timeTaken % 60).padStart(2, '0')}</p>
            <p className="text-[11px] text-[#737B8C]">Time taken</p>
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-[#737B8C]">{Math.floor(avgTime / 60)}:{String(avgTime % 60).padStart(2, '0')}</p>
            <p className="text-[11px] text-[#737B8C]">Avg time</p>
          </div>
          <div className="text-center">
            <p className="text-base font-bold" style={{ color: timeTaken < avgTime ? '#34D399' : '#FBBF24' }}>
              {timeTaken < avgTime ? '⚡ Faster' : '🐢 Slower'}
            </p>
            <p className="text-[11px] text-[#737B8C]">vs avg</p>
          </div>
        </div>
      </div>

      {/* Topic breakdown */}
      <div className="card p-6 bg-[#171A22] border border-[#282D38]">
        <h3 className="text-sm font-bold text-[#F5F7FA] mb-4">Topic-wise Breakdown</h3>
        <div className="space-y-4">
          {topics.map((topic, i) => {
            const score = topicScores[topic];
            const color = TOPIC_COLORS[topic];
            return (
              <div key={topic}>
                <div className="flex items-center justify-between mb-1.5">
                  <TopicBadge topic={topic} />
                  <span className="text-xs font-bold" style={{ color }}>{score}%</span>
                </div>
                <AnimBar value={score} color={color} delay={i * 120} />
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Analysis */}
      <AiAnalysisCard analysis={aiAnalysis} loading={analysing} />

      {/* Answer review */}
      <div className="card p-6 bg-[#171A22] border border-[#282D38]">
        <h3 className="text-sm font-bold text-[#F5F7FA] mb-4">Answer Review</h3>
        <div className="space-y-2">
          {questions.map((q, i) => {
            const chose   = answers[i];
            const isRight = chose === q.correct;
            return (
              <div key={q.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#1B1E27] border border-[#282D38]">
                <span className="text-sm flex-shrink-0">{isRight ? '✅' : '❌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#F5F7FA] mb-0.5 truncate">Q{q.id}: {q.q}</p>
                  <p className="text-[11px]" style={{ color: isRight ? '#34D399' : '#F87171' }}>
                    {chose === undefined ? 'Skipped' : `You chose: ${q.options[chose]}`}
                    {!isRight && chose !== undefined && ` — Correct: ${q.options[q.correct]}`}
                  </p>
                </div>
                <TopicBadge topic={q.topic} />
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={onRetry} className="w-full py-2.5 rounded-xl font-semibold text-xs text-white transition-colors bg-[#8B5CF6] hover:bg-[#7C3AED]">
        🔄 Start New Test
      </button>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
export default function AptitudeTest() {
  const { student, updateStudentSkills, showToast, recordTimelineEvent } = useApp();
  const [questions,   setQuestions]   = useState(null);
  const [loadingQs,   setLoadingQs]   = useState(true);
  const [current,     setCurrent]     = useState(0);
  const [answers,     setAnswers]     = useState({});
  const [submitted,   setSubmitted]   = useState(false);
  const timer = useCountdown(900);

  async function generateQuestions() {
    setLoadingQs(true);
    setAnswers({});
    setCurrent(0);
    setSubmitted(false);
    try {
      const system = 'You generate aptitude test questions. Return ONLY a JSON array of exactly 10 objects: [{"id":number,"topic":"Arithmetic"|"Logical"|"Verbal"|"Data Interp","q":string,"options":[string,string,string,string],"correct":number}] where correct is 0-indexed. Make questions realistic and varied. No markdown.';
      const user   = `Generate 10 fresh aptitude questions for a student targeting ${student?.targetRole || 'Software Engineering'} job placement tests.`;
      const raw    = await callGemini(system, user);
      const parsed = parseJSON(raw);
      if (Array.isArray(parsed) && parsed.length >= 5) {
        setQuestions(parsed.slice(0, 10));
      } else {
        setQuestions(FALLBACK_QUESTIONS);
      }
    } catch {
      setQuestions(FALLBACK_QUESTIONS);
    } finally {
      setLoadingQs(false);
    }
  }

  useEffect(() => { generateQuestions(); }, []); // eslint-disable-line

  useEffect(() => {
    if (timer.expired && !submitted && !loadingQs) { timer.stop(); handleSubmit(); }
  }, [timer.expired]); // eslint-disable-line

  if (loadingQs) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <div className="card p-10 text-center bg-[#171A22] border border-[#282D38] space-y-6">
          <span className="text-4xl">🤖</span>
          <div>
            <h2 className="text-lg font-bold text-[#F5F7FA] mb-1">Generating your personalised test…</h2>
            <p className="text-xs text-[#737B8C]">Claude is crafting 10 fresh aptitude questions</p>
          </div>
          <div className="space-y-3 animate-pulse">
            <div className="h-2.5 bg-[#1B1E27] rounded-full w-full" />
            <div className="h-2.5 bg-[#1B1E27] rounded-full w-5/6 mx-auto" />
            <div className="h-2.5 bg-[#1B1E27] rounded-full w-4/5 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (submitted && questions) {
    return (
      <Results
        questions={questions}
        answers={answers}
        timeLeft={timer.remaining}
        onRetry={generateQuestions}
      />
    );
  }

  const q         = questions[current];
  const answered  = Object.keys(answers).length;
  const timerPct  = (timer.remaining / 900) * 100;
  const timerColor = timer.remaining > 300 ? '#8B5CF6' : timer.remaining > 60 ? '#FBBF24' : '#F87171';

  const handleAnswer  = (oi) => setAnswers(prev => ({ ...prev, [current]: oi }));
  const handleSubmit  = async () => {
    timer.stop();
    setSubmitted(true);

    if (questions) {
      let correct = 0;
      questions.forEach((item, idx) => {
        if (answers[idx] === item.correct) correct++;
      });
      const pct = Math.round((correct / questions.length) * 100);

      if (student?.skills) {
        const updatedSkills = student.skills.map((s) =>
          s.name.toLowerCase().includes('communication') || s.name.toLowerCase().includes('problem') || s.name.toLowerCase().includes('aptitude')
            ? { ...s, current: Math.min(100, s.current + 3) }
            : s
        );
        await updateStudentSkills(updatedSkills, `Aptitude Test Score: ${pct}%`);
      }
      if (recordTimelineEvent) {
        recordTimelineEvent('Completed Aptitude Test', 'assessment', `Score: ${pct}% (${correct}/${questions.length})`);
      }
      if (showToast) showToast(`Aptitude Test Completed! Score: ${pct}% 🎯`, 'success');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5 max-w-6xl mx-auto" style={{ minHeight: 'calc(100vh - 160px)' }}>
      {/* Left: Question */}
      <div className="space-y-4">
        <div key={current} className="card p-6 bg-[#171A22] border border-[#282D38]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white bg-[#8B5CF6]">{q.id}</span>
              <TopicBadge topic={q.topic} />
            </div>
            <span className="text-xs text-[#737B8C]">Question {current + 1} of {questions.length}</span>
          </div>

          {q.topic === 'Data Interp' && (
            <div className="mb-4 rounded-xl flex items-center justify-center gap-4 px-6 bg-[#1B1E27] border border-[#282D38]" style={{ height: 110 }}>
              {[{ l: 'Q1', h: 50 }, { l: 'Q2', h: 70 }, { l: 'Q3', h: 35 }, { l: 'Q4', h: 45 }].map(b => (
                <div key={b.l} className="flex flex-col items-center gap-1">
                  <div className="w-8 rounded-t" style={{ height: b.h, background: '#8B5CF6', opacity: 0.7 }} />
                  <span className="text-[10px] text-[#737B8C] font-medium">{b.l}</span>
                </div>
              ))}
              <p className="text-xs text-[#A7ADBA] ml-4">Sales Units by Quarter</p>
            </div>
          )}

          <p className="text-sm font-semibold text-[#F5F7FA] mb-5 leading-relaxed">{q.q}</p>

          <div className="space-y-2.5">
            {q.options.map((opt, oi) => {
              const picked = answers[current] === oi;
              return (
                <button key={oi} id={`opt-${current}-${oi}`} onClick={() => handleAnswer(oi)}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-medium border transition-colors flex items-center gap-3"
                  style={{
                    background:  picked ? 'rgba(139,92,246,0.12)' : '#1B1E27',
                    borderColor: picked ? 'rgba(139,92,246,0.3)' : '#282D38',
                    color:       picked ? '#F5F7FA' : '#A7ADBA',
                  }}>
                  <span className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                    style={{ background: picked ? '#8B5CF6' : '#11131A', color: picked ? '#fff' : '#737B8C' }}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#282D38] text-[#F5F7FA] bg-[#171A22] hover:bg-[#20242E] disabled:opacity-40 transition-colors">
            ← Previous
          </button>
          <span className="flex-1 text-center text-xs text-[#737B8C]">{answered} of {questions.length} answered</span>
          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] transition-colors">
              Next →
            </button>
          ) : (
            <button id="submit-aptitude-btn" onClick={handleSubmit}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#0F1117] bg-[#34D399] transition-colors">
              Submit Test ✓
            </button>
          )}
        </div>
      </div>

      {/* Right: Sidebar */}
      <div className="space-y-4">
        <div className="card p-4 bg-[#171A22] border border-[#282D38]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#737B8C] uppercase tracking-wider">Time Left</span>
            <span className="font-mono font-bold text-base" style={{ color: timerColor }}>{timer.display}</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#1B1E27] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${timerPct}%`, background: timerColor }} />
          </div>
        </div>

        <div className="card p-4 bg-[#171A22] border border-[#282D38]">
          <p className="text-xs font-semibold text-[#737B8C] uppercase tracking-wider mb-3">Questions</p>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, i) => {
              const ans   = answers[i] !== undefined;
              const isCur = i === current;
              return (
                <button key={i} id={`nav-q-${i + 1}`} onClick={() => setCurrent(i)}
                  className="w-full aspect-square rounded-lg text-xs font-bold transition-colors"
                  style={{
                    background:  isCur ? '#8B5CF6' : ans ? 'rgba(52,211,153,0.12)' : '#1B1E27',
                    color:       isCur ? '#FFFFFF' : ans ? '#34D399' : '#737B8C',
                    border:      `1px solid ${isCur ? '#8B5CF6' : ans ? 'rgba(52,211,153,0.3)' : '#282D38'}`,
                  }}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        <button id="sidebar-submit-btn" onClick={handleSubmit}
          className="w-full py-2.5 rounded-xl text-xs font-semibold text-[#0F1117] bg-[#34D399] transition-colors">
          Submit Early ✓
        </button>
      </div>
    </div>
  );
}
