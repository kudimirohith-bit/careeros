import { useState, useEffect } from 'react';

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

const TOPIC_STYLES = {
  'Arithmetic':  { bg: 'rgba(96,165,250,0.1)', text: '#60A5FA', border: 'rgba(96,165,250,0.25)' },
  'Logical':     { bg: 'rgba(139,92,246,0.1)', text: '#A78BFA', border: 'rgba(139,92,246,0.25)' },
  'Verbal':      { bg: 'rgba(52,211,153,0.1)', text: '#34D399', border: 'rgba(52,211,153,0.25)' },
  'Data Interp': { bg: 'rgba(251,191,36,0.1)', text: '#FBBF24', border: 'rgba(251,191,36,0.25)' },
};

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

function AnimBar({ value, color='#8B5CF6', delay=0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), delay+80); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div className="h-2 rounded-full bg-[#1B1E27] overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width:`${w}%`, background:color }} />
    </div>
  );
}

function TopicBadge({ topic }) {
  const s = TOPIC_STYLES[topic] ?? TOPIC_STYLES['Logical'];
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
      style={{ background:s.bg, color:s.text, borderColor:s.border }}>{topic}</span>
  );
}

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
    <div className="rounded-xl overflow-hidden border border-[rgba(139,92,246,0.3)] bg-[#171A22]">
      <div className="px-5 py-3.5 flex items-center justify-between bg-[#1B1E27] border-b border-[#282D38]">
        <div className="flex items-center gap-3">
          <span className="text-xl text-[#A78BFA] bg-[rgba(139,92,246,0.12)] p-1.5 rounded-lg">🧠</span>
          <div>
            <p className="text-[#F5F7FA] font-bold text-sm">Adaptive Assessment Active</p>
            <p className="text-[#737B8C] text-xs">Personalised to your weak areas</p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold text-[#A78BFA] bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.25)]">
          ● ADAPTIVE
        </span>
      </div>

      <div className="p-5 space-y-4">
        {worstTopic && (
          <p className="text-xs text-[#A7ADBA] leading-relaxed">
            Your <span className="font-semibold text-[#F5F7FA]">{worstTopic}</span> score ({topicScores[worstTopic]}%) is below target. Next assessment will focus on:
          </p>
        )}
        <ul className="space-y-1.5">
          {(focusTopics.length ? focusTopics : ['Logical Reasoning','Pattern Recognition','Syllogisms']).map(item => (
            <li key={item} className="flex items-center gap-2 text-xs font-medium text-[#F5F7FA]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] flex-shrink-0"/>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Results({ answers, timeLeft, onRetry }) {
  const total   = QUESTIONS.length;
  const correct = QUESTIONS.filter((q,i) => answers[i] === q.correct).length;
  const pct     = Math.round((correct/total)*100);
  const timeTaken = 900 - timeLeft;
  const avgTime   = 540;

  const topics = ['Arithmetic','Logical','Verbal','Data Interp'];
  const topicScores = {};
  topics.forEach(topic => {
    const qs = QUESTIONS.filter(q => q.topic === topic);
    const ok = qs.filter((q,_) => answers[QUESTIONS.indexOf(q)] === q.correct).length;
    topicScores[topic] = qs.length ? Math.round((ok/qs.length)*100) : 0;
  });

  const topicColors = { 'Arithmetic':'#60A5FA','Logical':'#8B5CF6','Verbal':'#34D399','Data Interp':'#FBBF24' };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card p-6 text-center bg-[#171A22] border border-[#282D38]">
        <p className="text-5xl font-black mb-1"
          style={{ color: pct>=70?'#34D399':pct>=50?'#FBBF24':'#F87171' }}>
          {pct}%
        </p>
        <p className="text-[#A7ADBA] text-sm font-semibold">{correct} / {total} correct</p>
        <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-[#282D38]">
          <div className="text-center">
            <p className="text-base font-bold text-[#F5F7FA]">
              {Math.floor(timeTaken/60)}:{String(timeTaken%60).padStart(2,'0')}
            </p>
            <p className="text-[11px] text-[#737B8C]">Time taken</p>
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-[#737B8C]">
              {Math.floor(avgTime/60)}:{String(avgTime%60).padStart(2,'0')}
            </p>
            <p className="text-[11px] text-[#737B8C]">Avg time</p>
          </div>
          <div className="text-center">
            <p className="text-base font-bold" style={{ color: timeTaken<avgTime?'#34D399':'#FBBF24' }}>
              {timeTaken < avgTime ? '⚡ Faster' : '🐢 Slower'}
            </p>
            <p className="text-[11px] text-[#737B8C]">vs avg</p>
          </div>
        </div>
      </div>

      <div className="card p-6 bg-[#171A22] border border-[#282D38]">
        <h3 className="text-sm font-bold text-[#F5F7FA] mb-4">Topic-wise Breakdown</h3>
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
                  <span className="text-xs font-bold" style={{ color }}>{score}%</span>
                </div>
                <AnimBar value={score} color={color} delay={i*120} />
              </div>
            );
          })}
        </div>
      </div>

      <AdaptiveBanner topicScores={topicScores} />

      <div className="card p-6 bg-[#171A22] border border-[#282D38]">
        <h3 className="text-sm font-bold text-[#F5F7FA] mb-4">Answer Review</h3>
        <div className="space-y-2">
          {QUESTIONS.map((q, i) => {
            const chose   = answers[i];
            const correct = chose === q.correct;
            return (
              <div key={q.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#1B1E27] border border-[#282D38]">
                <span className="text-sm flex-shrink-0">{correct?'✅':'❌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#F5F7FA] mb-0.5 truncate">Q{q.id}: {q.q}</p>
                  <p className="text-[11px]" style={{ color: correct?'#34D399':'#F87171' }}>
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
        className="w-full py-2.5 rounded-xl font-semibold text-xs text-white transition-colors bg-[#8B5CF6] hover:bg-[#7C3AED]">
        🔄 Retry Test
      </button>
    </div>
  );
}

export default function AptitudeTest() {
  const [current,  setCurrent]  = useState(0);
  const [answers,  setAnswers]  = useState({});
  const [submitted,setSubmitted]= useState(false);
  const timer = useCountdown(900);

  useEffect(() => {
    if (timer.expired && !submitted) { timer.stop(); setSubmitted(true); }
  }, [timer.expired]); // eslint-disable-line

  const q         = QUESTIONS[current];
  const answered  = Object.keys(answers).length;
  const timerPct  = (timer.remaining / 900) * 100;
  const timerColor= timer.remaining>300?'#8B5CF6':timer.remaining>60?'#FBBF24':'#F87171';

  const handleAnswer = (oi) => {
    setAnswers(prev => ({ ...prev, [current]: oi }));
  };

  const handleSubmit = () => { timer.stop(); setSubmitted(true); };

  if (submitted) {
    return <Results answers={answers} timeLeft={timer.remaining} onRetry={() => { setAnswers({}); setCurrent(0); setSubmitted(false); }} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5 max-w-6xl mx-auto" style={{ minHeight:'calc(100vh - 160px)' }}>
      {/* Left: Question */}
      <div className="space-y-4">
        <div key={current} className="card p-6 bg-[#171A22] border border-[#282D38]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white bg-[#8B5CF6]">{q.id}</span>
              <TopicBadge topic={q.topic} />
            </div>
            <span className="text-xs text-[#737B8C]">Question {current+1} of {QUESTIONS.length}</span>
          </div>

          {q.topic === 'Data Interp' && (
            <div className="mb-4 rounded-xl flex items-center justify-center gap-4 px-6 bg-[#1B1E27] border border-[#282D38]" style={{ height:110 }}>
              {[{l:'Q1',h:50},{l:'Q2',h:70},{l:'Q3',h:35},{l:'Q4',h:45}].map(b => (
                <div key={b.l} className="flex flex-col items-center gap-1">
                  <div className="w-8 rounded-t" style={{ height:b.h, background:'#8B5CF6', opacity:0.7 }} />
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
                <button key={oi} id={`opt-${current}-${oi}`}
                  onClick={() => handleAnswer(oi)}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-medium border transition-colors flex items-center gap-3"
                  style={{
                    background:  picked ? 'rgba(139, 92, 246, 0.12)' : '#1B1E27',
                    borderColor: picked ? 'rgba(139, 92, 246, 0.3)' : '#282D38',
                    color:       picked ? '#F5F7FA' : '#A7ADBA',
                  }}>
                  <span className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                    style={{ background: picked ? '#8B5CF6' : '#11131A', color: picked ? '#fff' : '#737B8C' }}>
                    {String.fromCharCode(65+oi)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setCurrent(c=>Math.max(0,c-1))} disabled={current===0}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#282D38] text-[#F5F7FA] bg-[#171A22] hover:bg-[#20242E] disabled:opacity-40 transition-colors">
            ← Previous
          </button>
          <span className="flex-1 text-center text-xs text-[#737B8C]">
            {answered} of {QUESTIONS.length} answered
          </span>
          {current < QUESTIONS.length-1 ? (
            <button onClick={() => setCurrent(c=>Math.min(QUESTIONS.length-1,c+1))}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] transition-colors">
              Next →
            </button>
          ) : (
            <button id="submit-aptitude-btn" onClick={handleSubmit}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#34D399] text-[#0F1117] transition-colors">
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
            <span className="font-mono font-bold text-base" style={{ color:timerColor }}>
              {timer.display}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[#1B1E27] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width:`${timerPct}%`, background:timerColor }} />
          </div>
        </div>

        <div className="card p-4 bg-[#171A22] border border-[#282D38]">
          <p className="text-xs font-semibold text-[#737B8C] uppercase tracking-wider mb-3">Questions</p>
          <div className="grid grid-cols-5 gap-2">
            {QUESTIONS.map((_, i) => {
              const ans     = answers[i] !== undefined;
              const isCur   = i === current;
              return (
                <button key={i} id={`nav-q-${i+1}`}
                  onClick={() => setCurrent(i)}
                  className="w-full aspect-square rounded-lg text-xs font-bold transition-colors"
                  style={{
                    background:  isCur ? '#8B5CF6' : ans ? 'rgba(52,211,153,0.12)' : '#1B1E27',
                    color:       isCur ? '#FFFFFF' : ans ? '#34D399' : '#737B8C',
                    border:      `1px solid ${isCur ? '#8B5CF6' : ans ? 'rgba(52,211,153,0.3)' : '#282D38'}`,
                  }}>
                  {i+1}
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
