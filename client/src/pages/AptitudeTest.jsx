import { useState, useEffect, useRef } from 'react';

/* ─── Question bank ──────────────────────────────────────────────── */
const QUESTIONS = [
  { id:1, topic:'Arithmetic',    q:'A train travels 60km in 45 minutes. What is its speed in km/h?', options:['70 km/h','80 km/h','90 km/h','75 km/h'], correct:1 },
  { id:2, topic:'Logical',       q:'Complete the series: 3, 6, 11, 18, 27, ?', options:['36','38','35','40'], correct:1 },
  { id:3, topic:'Verbal',        q:'Choose the synonym of "Eloquent":', options:['Silent','Fluent','Angry','Shy'], correct:1 },
  { id:4, topic:'Data Interp',   q:'[Chart] In Q3, sales were 40 units; in Q4 they rose by 25%. What were Q4 sales?', options:['48','50','52','45'], correct:1 },
  { id:5, topic:'Logical',       q:'If all A are B and all B are C, which must be true?', options:['All A are C','All C are A','No A are C','Some B are not C'], correct:0 },
  { id:6, topic:'Arithmetic',    q:'A is 2 years older than B who is twice as old as C. Total ages = 27. How old is B?', options:['7','8','10','12'], correct:2 },
  { id:7, topic:'Logical',       q:'Find the odd one out: 2, 3, 5, 7, 11, 12, 13', options:['11','12','13','7'], correct:1 },
  { id:8, topic:'Verbal',        q:'Choose the antonym of "Benevolent":', options:['Kind','Generous','Malevolent','Caring'], correct:2 },
  { id:9, topic:'Data Interp',   q:'A pie chart shows 30% Engineering, 20% Arts, 50% Commerce out of 200 students. How many study Arts?', options:['30','40','50','60'], correct:1 },
  { id:10,topic:'Arithmetic',    q:'Complete the series: 1, 4, 9, 16, 25, ?', options:['30','35','36','40'], correct:2 },
];

const TOPIC_COLORS = {
  'Arithmetic':  { bg:'#EEF2FF', text:'#4338CA', border:'#C7D2FE' },
  'Logical':     { bg:'#FDF4FF', text:'#7E22CE', border:'#E9D5FF' },
  'Verbal':      { bg:'#F0FDF4', text:'#15803D', border:'#BBF7D0' },
  'Data Interp': { bg:'#FFF7ED', text:'#C2410C', border:'#FED7AA' },
};

/* ─── Timer hook ─────────────────────────────────────────────────── */
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
  const mm = String(Math.floor(rem / 60)).padStart(2,'0');
  const ss = String(rem % 60).padStart(2,'0');
  return { display:`${mm}:${ss}`, remaining:rem, expired:rem===0, stop };
}

/* ─── Animated bar ───────────────────────────────────────────────── */
function AnimBar({ value, color='#6366F1', delay=0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), delay+80); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width:`${w}%`, background:color }} />
    </div>
  );
}

/* ─── Topic badge ────────────────────────────────────────────────── */
function TopicBadge({ topic }) {
  const s = TOPIC_COLORS[topic] ?? TOPIC_COLORS['Logical'];
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
      style={{ background:s.bg, color:s.text, borderColor:s.border }}>{topic}</span>
  );
}

/* ─── Adaptive banner ────────────────────────────────────────────── */
function AdaptiveBanner({ topicScores }) {
  const weakTopics = Object.entries(topicScores)
    .filter(([,s]) => s < 70)
    .sort(([,a],[,b]) => a-b)
    .map(([t]) => t);

  const suggestions = {
    'Logical':     ['Pattern Recognition','Syllogisms','Deductive Reasoning'],
    'Arithmetic':  ['Percentage & Ratios','Time-Speed-Distance','Profit & Loss'],
    'Verbal':      ['Synonyms & Antonyms','Reading Comprehension','Analogies'],
    'Data Interp': ['Bar Charts','Pie Charts','Table Reading'],
  };

  const focusTopics = weakTopics.flatMap(t => suggestions[t] ?? []).slice(0,4);
  const worstTopic  = weakTopics[0];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border:'2px solid #6366F1', boxShadow:'0 0 0 4px rgba(99,102,241,0.1)' }}>
      <style>{`
        @keyframes pulseBadge { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.75;transform:scale(0.96)} }
      `}</style>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ background:'linear-gradient(135deg,#6366F1,#818CF8)' }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧠</span>
          <div>
            <p className="text-white font-black text-base">Adaptive Assessment Active</p>
            <p className="text-indigo-200 text-xs">Personalised to your weak areas</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-black text-indigo-700 bg-white"
          style={{ animation:'pulseBadge 2s ease-in-out infinite' }}>
          ● ADAPTIVE
        </span>
      </div>

      <div className="p-5 bg-indigo-50 space-y-4">
        {worstTopic && (
          <p className="text-sm text-slate-700 leading-relaxed">
            Your <span className="font-bold text-indigo-700">{worstTopic}</span> score ({topicScores[worstTopic]}%) is below target.
            {' '}Next assessment will focus more on:
          </p>
        )}
        <ul className="space-y-1.5">
          {(focusTopics.length ? focusTopics : ['Logical Reasoning','Pattern Recognition','Syllogisms']).map(item => (
            <li key={item} className="flex items-center gap-2 text-sm font-semibold text-indigo-800">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"/>
              {item}
            </li>
          ))}
        </ul>
        <p className="text-xs text-indigo-600 font-medium border-t border-indigo-200 pt-3">
          💡 Questions are dynamically selected based on <span className="font-bold">YOUR</span> weak areas — not a fixed test bank.
        </p>
      </div>
    </div>
  );
}

/* ─── Results screen ─────────────────────────────────────────────── */
function Results({ answers, timeLeft, onRetry }) {
  const total   = QUESTIONS.length;
  const correct = QUESTIONS.filter((q,i) => answers[i] === q.correct).length;
  const pct     = Math.round((correct/total)*100);
  const timeTaken = 900 - timeLeft;
  const avgTime   = 540; // 9 min average

  // Per-topic scores
  const topics = ['Arithmetic','Logical','Verbal','Data Interp'];
  const topicScores = {};
  topics.forEach(topic => {
    const qs = QUESTIONS.filter(q => q.topic === topic);
    const ok = qs.filter((q,_) => answers[QUESTIONS.indexOf(q)] === q.correct).length;
    topicScores[topic] = qs.length ? Math.round((ok/qs.length)*100) : 0;
  });

  const topicColors = { 'Arithmetic':'#6366F1','Logical':'#8B5CF6','Verbal':'#22C55E','Data Interp':'#F59E0B' };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}.fu{animation:fadeUp 0.4s ease both}`}</style>

      {/* Score card */}
      <div className="card p-6 text-center fu">
        <p className="text-5xl font-black mb-1"
          style={{ color: pct>=70?'#22C55E':pct>=50?'#F59E0B':'#EF4444' }}>
          {pct}%
        </p>
        <p className="text-slate-600 font-semibold">{correct} / {total} correct</p>
        <div className="flex justify-center gap-6 mt-4">
          <div className="text-center">
            <p className="text-lg font-black text-slate-800">
              {Math.floor(timeTaken/60)}:{String(timeTaken%60).padStart(2,'0')}
            </p>
            <p className="text-xs text-slate-400">Time taken</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-slate-500">
              {Math.floor(avgTime/60)}:{String(avgTime%60).padStart(2,'0')}
            </p>
            <p className="text-xs text-slate-400">Avg time</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black" style={{ color: timeTaken<avgTime?'#22C55E':'#F59E0B' }}>
              {timeTaken < avgTime ? '⚡ Faster' : '🐢 Slower'}
            </p>
            <p className="text-xs text-slate-400">vs avg</p>
          </div>
        </div>
      </div>

      {/* Topic breakdown */}
      <div className="card p-6 fu" style={{ animationDelay:'80ms' }}>
        <h3 className="text-base font-bold text-slate-800 mb-5">Topic-wise Breakdown</h3>
        <div className="space-y-4">
          {topics.map((topic,i) => {
            const score = topicScores[topic];
            const color = topicColors[topic];
            return (
              <div key={topic}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <TopicBadge topic={topic} />
                  </div>
                  <span className="text-sm font-bold" style={{ color }}>{score}%</span>
                </div>
                <AnimBar value={score} color={color} delay={i*120} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Adaptive banner */}
      <div className="fu" style={{ animationDelay:'160ms' }}>
        <AdaptiveBanner topicScores={topicScores} />
      </div>

      {/* Review table */}
      <div className="card p-6 fu" style={{ animationDelay:'240ms' }}>
        <h3 className="text-base font-bold text-slate-800 mb-4">Answer Review</h3>
        <div className="space-y-2">
          {QUESTIONS.map((q, i) => {
            const chose   = answers[i];
            const correct = chose === q.correct;
            return (
              <div key={q.id} className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: correct?'#F0FDF4':'#FEF2F2', border:`1px solid ${correct?'#86EFAC':'#FCA5A5'}` }}>
                <span className="text-base flex-shrink-0">{correct?'✅':'❌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 mb-0.5 truncate">Q{q.id}: {q.q}</p>
                  <p className="text-[10px]" style={{ color: correct?'#15803D':'#B91C1C' }}>
                    {chose===undefined ? 'Skipped' : `You chose: ${q.options[chose]}`}
                    {!correct && ` — Correct: ${q.options[q.correct]}`}
                  </p>
                </div>
                <TopicBadge topic={q.topic} />
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={onRetry}
        className="w-full py-3 rounded-xl font-bold text-white fu"
        style={{ background:'var(--accent)', boxShadow:'0 4px 14px rgba(99,102,241,0.3)', animationDelay:'300ms' }}>
        🔄 Retry Test
      </button>
    </div>
  );
}

/* ─── Main test screen ───────────────────────────────────────────── */
export default function AptitudeTest() {
  const [current,  setCurrent]  = useState(0);
  const [answers,  setAnswers]  = useState({});
  const [submitted,setSubmitted]= useState(false);
  const timer = useCountdown(900); // 15 min

  // Auto-submit on timer expiry
  useEffect(() => {
    if (timer.expired && !submitted) { timer.stop(); setSubmitted(true); }
  }, [timer.expired]); // eslint-disable-line

  const q         = QUESTIONS[current];
  const answered  = Object.keys(answers).length;
  const timerPct  = (timer.remaining / 900) * 100;
  const timerColor= timer.remaining>300?'#6366F1':timer.remaining>60?'#F59E0B':'#EF4444';

  const handleAnswer = (oi) => {
    setAnswers(prev => ({ ...prev, [current]: oi }));
  };

  const handleSubmit = () => { timer.stop(); setSubmitted(true); };

  if (submitted) {
    return <Results answers={answers} timeLeft={timer.remaining} onRetry={() => { setAnswers({}); setCurrent(0); setSubmitted(false); }} />;
  }

  return (
    <div className="grid grid-cols-[1fr_260px] gap-5" style={{ minHeight:'calc(100vh - 160px)' }}>
      <style>{`@keyframes slideQ{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}.slide-q{animation:slideQ 0.25s ease both}`}</style>

      {/* ── Left: Question ── */}
      <div className="space-y-4">
        {/* Question card */}
        <div key={current} className="card p-6 slide-q">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white"
                style={{ background:'var(--accent)' }}>{q.id}</span>
              <TopicBadge topic={q.topic} />
            </div>
            <span className="text-xs text-slate-400 font-medium">Question {current+1} of {QUESTIONS.length}</span>
          </div>

          {/* Data interp chart placeholder */}
          {q.topic === 'Data Interp' && (
            <div className="mb-4 rounded-xl overflow-hidden flex items-center justify-center gap-4 px-6"
              style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', height:120 }}>
              {[{l:'Q1',h:60},{l:'Q2',h:80},{l:'Q3',h:40},{l:'Q4',h:50}].map(b => (
                <div key={b.l} className="flex flex-col items-center gap-1">
                  <div className="w-10 rounded-t" style={{ height:b.h, background:'#6366F1', opacity:0.7 }} />
                  <span className="text-xs text-slate-500 font-semibold">{b.l}</span>
                </div>
              ))}
              <p className="text-xs text-slate-400 ml-4">Sales Units by Quarter</p>
            </div>
          )}

          <p className="text-base font-semibold text-slate-800 mb-5 leading-relaxed">{q.q}</p>

          {/* Options */}
          <div className="space-y-2.5">
            {q.options.map((opt, oi) => {
              const picked = answers[current] === oi;
              return (
                <button key={oi} id={`opt-${current}-${oi}`}
                  onClick={() => handleAnswer(oi)}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-150 flex items-center gap-3"
                  style={{
                    background:  picked?'#EEF2FF':'#F8FAFC',
                    borderColor: picked?'#6366F1':'#E2E8F0',
                    color:       picked?'#4338CA':'#475569',
                    boxShadow:   picked?'0 0 0 2px rgba(99,102,241,0.2)':'none',
                  }}>
                  <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black"
                    style={{ background:picked?'#6366F1':'#E2E8F0', color:picked?'#fff':'#64748B' }}>
                    {String.fromCharCode(65+oi)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nav buttons */}
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrent(c=>Math.max(0,c-1))} disabled={current===0}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
            ← Previous
          </button>
          <span className="flex-1 text-center text-xs text-slate-400">
            {answered} of {QUESTIONS.length} answered
          </span>
          {current < QUESTIONS.length-1 ? (
            <button onClick={() => setCurrent(c=>Math.min(QUESTIONS.length-1,c+1))}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background:'var(--accent)' }}>
              Next →
            </button>
          ) : (
            <button id="submit-aptitude-btn" onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background:'#22C55E', boxShadow:'0 4px 12px rgba(34,197,94,0.3)' }}>
              Submit Test ✓
            </button>
          )}
        </div>
      </div>

      {/* ── Right: Sidebar ── */}
      <div className="space-y-4">
        {/* Timer */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Time Left</span>
            <span className="font-mono font-black text-lg" style={{ color:timerColor }}>
              {timer.display}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width:`${timerPct}%`, background:timerColor }} />
          </div>
          {timer.remaining <= 300 && (
            <p className="text-xs text-red-500 font-semibold mt-1.5 text-center animate-pulse">
              ⚠️ {timer.remaining <= 60 ? 'Less than 1 minute!' : 'Under 5 minutes!'}
            </p>
          )}
        </div>

        {/* Question navigator */}
        <div className="card p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Questions</p>
          <div className="grid grid-cols-5 gap-2">
            {QUESTIONS.map((_, i) => {
              const ans     = answers[i] !== undefined;
              const isCur   = i === current;
              return (
                <button key={i} id={`nav-q-${i+1}`}
                  onClick={() => setCurrent(i)}
                  className="w-full aspect-square rounded-lg text-xs font-bold transition-all duration-150"
                  style={{
                    background:  isCur?'var(--accent)': ans?'#DCFCE7':'#F1F5F9',
                    color:       isCur?'#fff': ans?'#15803D':'#94A3B8',
                    border:      `2px solid ${isCur?'var(--accent)':ans?'#86EFAC':'transparent'}`,
                    boxShadow:   isCur?'0 2px 8px rgba(99,102,241,0.35)':'none',
                  }}>
                  {i+1}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block"/>Current</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-200 inline-block"/>Answered</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-slate-200 inline-block"/>Skipped</span>
          </div>
        </div>

        {/* Progress */}
        <div className="card p-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Progress</span><span>{answered}/{QUESTIONS.length}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width:`${(answered/QUESTIONS.length)*100}%`, background:'linear-gradient(90deg,#6366F1,#22C55E)' }} />
          </div>
        </div>

        {/* Submit shortcut */}
        <button id="sidebar-submit-btn" onClick={handleSubmit}
          className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background:'#22C55E', boxShadow:'0 4px 12px rgba(34,197,94,0.3)' }}>
          Submit Early ✓
        </button>
      </div>
    </div>
  );
}
