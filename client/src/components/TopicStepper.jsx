import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';

/* ─── Topic content library ──────────────────────────────────────── */
const TOPIC_CONTENT = {
  default: {
    title:   'Arrays & Hashing',
    skill:   'DSA',
    article: [
      'An array is a collection of elements stored at contiguous memory locations. Arrays allow random access in O(1) time, making them extremely efficient for index-based lookups.',
      'Because elements are laid out sequentially in memory, CPUs can leverage cache locality to speed up traversals. However, inserting or deleting at the beginning costs O(n) because every element must shift.',
      'Common array patterns include the Two Pointer technique, Sliding Window, Prefix Sums, and Hash Maps for O(1) lookup. Mastering these patterns is the foundation of most coding interviews.',
    ],
    videoLabel: 'Watch: Arrays in 10 minutes',
    practiceQs: [
      {
        q:    'Given array [2, 7, 11, 15] and target 9, which two numbers add up to the target?',
        hint: '💡 Two Sum — try using a hash map for O(n) time.',
      },
      {
        q:    'Find the maximum element in an array without using max() or Math.max().',
        hint: '💡 Iterate once, track a running max variable.',
      },
    ],
    mcqs: [
      {
        q:       'Array indexing starts from?',
        options: ['1', '0', '-1', 'Depends on language'],
        correct: 1,
      },
      {
        q:       'Time complexity to access an element by index?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
        correct: 2,
      },
      {
        q:       'Which operation is O(n) for a standard array?',
        options: ['Access by index', 'Insert at beginning', 'Update element', 'Delete last element'],
        correct: 1,
      },
    ],
    nextTopic: 'Linked Lists',
  },
};

function getContent(taskLabel = '') {
  const key = Object.keys(TOPIC_CONTENT).find(
    (k) => k !== 'default' && taskLabel.toLowerCase().includes(k.toLowerCase())
  );
  return TOPIC_CONTENT[key ?? 'default'];
}

function useTimer(seconds) {
  const [remaining, setRemaining] = useState(seconds);
  const [running,   setRunning]   = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(ref.current); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [running]);

  const start = () => { setRemaining(seconds); setRunning(true); };
  const stop  = () => { clearInterval(ref.current); setRunning(false); };
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return { display: `${mm}:${ss}`, remaining, start, stop, expired: remaining === 0 };
}

const STEP_LABELS = ['Learn', 'Practice', 'Test', 'Analyze'];
const STEP_ICONS  = ['📖', '✏️', '⚡', '📊'];

function StepBar({ step }) {
  return (
    <div className="flex items-center mb-6">
      {STEP_LABELS.map((label, i) => {
        const done   = i < step;
        const active = i === step;
        return (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 mb-1"
                style={{
                  background: done ? '#7C3AED' : active ? '#252836' : '#14161E',
                  color:      done ? '#fff'     : active ? '#C084FC' : '#64748B',
                  border:     active ? '2px solid #A855F7' : '2px solid #2B2E3C',
                  boxShadow:  active ? '0 0 0 4px rgba(168,85,247,0.2)' : 'none',
                }}
              >
                {done ? '✓' : STEP_ICONS[i]}
              </div>
              <span
                className="text-[10px] font-extrabold uppercase tracking-wide"
                style={{ color: active ? '#C084FC' : done ? '#94A3B8' : '#64748B' }}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className="h-0.5 flex-1 mx-1 mb-4 rounded-full transition-all duration-500"
                style={{ background: done ? '#7C3AED' : '#2B2E3C' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepLearn({ content, onNext }) {
  const [watched, setWatched] = useState(false);

  return (
    <div>
      <h2 className="text-xl font-black text-white mb-1">{content.title}</h2>
      <p className="text-sm text-slate-300 mb-5">Read the material, then watch the video to proceed.</p>

      <div className="space-y-3 mb-5">
        {content.article.map((para, i) => (
          <p key={i} className="text-sm text-slate-200 leading-relaxed bg-[#14161E] p-4 rounded-2xl border border-[#2B2E3C]">
            {para}
          </p>
        ))}
      </div>

      <div
        className="relative rounded-2xl overflow-hidden mb-5 flex items-center justify-center"
        style={{ background: '#0F111A', height: 180, border: '1px solid #2B2E3C' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-lg"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)' }}
            onClick={() => setWatched(true)}
          >
            <span className="text-white text-2xl ml-1">▶</span>
          </div>
          <p className="text-slate-300 text-sm font-semibold">{content.videoLabel}</p>
          {watched && (
            <span className="text-xs text-emerald-400 font-bold bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              ✓ Watched
            </span>
          )}
        </div>
        <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
          YouTube
        </div>
      </div>

      <button
        id="mark-watched-btn"
        onClick={() => { setWatched(true); onNext(); }}
        className="w-full py-3.5 rounded-2xl font-extrabold text-white transition-all shadow-lg hover:shadow-purple-900/50"
        style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)' }}
      >
        {watched ? '✓ Marked as Watched — Continue →' : 'Mark as Watched ✓'}
      </button>
    </div>
  );
}

function StepPractice({ content, onNext }) {
  const [answers, setAnswers] = useState(['', '']);
  const allFilled = answers.every((a) => a.trim().length > 0);

  return (
    <div>
      <h2 className="text-xl font-black text-white mb-1">Practice Problems</h2>
      <p className="text-sm text-slate-300 mb-5">Write your approach — no execution needed. Think it through.</p>

      <div className="space-y-5 mb-6">
        {content.practiceQs.map((q, i) => (
          <div key={i} className="card p-5 border border-[#2B2E3C] bg-[#14161E]">
            <div className="flex gap-2 mb-3">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                style={{ background: '#7C3AED' }}
              >
                {i + 1}
              </span>
              <p className="text-sm font-bold text-white leading-relaxed">{q.q}</p>
            </div>
            <p className="text-xs text-amber-300 bg-amber-950/60 px-3 py-1.5 rounded-xl mb-3 border border-amber-800/60 font-semibold">
              {q.hint}
            </p>
            <textarea
              id={`practice-answer-${i}`}
              rows={3}
              value={answers[i]}
              onChange={(e) => setAnswers((prev) => prev.map((v, idx) => idx === i ? e.target.value : v))}
              placeholder="Write your approach or pseudocode here…"
              className="w-full px-3 py-2.5 text-sm text-white rounded-xl resize-none outline-none bg-[#1E202B] border border-[#2B2E3C] focus:border-purple-500"
            />
            <p className="text-right text-[10px] text-slate-400 mt-1 font-semibold">
              {answers[i].trim().split(/\s+/).filter(Boolean).length} words
            </p>
          </div>
        ))}
      </div>

      <button
        id="submit-practice-btn"
        onClick={onNext}
        disabled={!allFilled}
        className="w-full py-3.5 rounded-2xl font-black text-white transition-all shadow-md"
        style={{
          background: allFilled ? 'linear-gradient(135deg,#7C3AED,#A855F7)' : '#2B2E3C',
          cursor:     allFilled ? 'pointer' : 'not-allowed',
        }}
      >
        Submit Answers →
      </button>
    </div>
  );
}

function StepTest({ content, onNext }) {
  const [selected, setSelected] = useState({});
  const timer = useTimer(120);

  useEffect(() => { timer.start(); }, []); // eslint-disable-line

  const allAnswered = content.mcqs.every((_, i) => selected[i] !== undefined);

  const handleSubmit = () => {
    timer.stop();
    const correct = content.mcqs.filter((q, i) => selected[i] === q.correct).length;
    const score   = Math.round((correct / content.mcqs.length) * 100);
    onNext(score);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-black text-white">Mini Assessment</h2>
          <p className="text-sm text-slate-300">{content.mcqs.length} questions · auto-scored</p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-base"
          style={{
            background: timer.expired ? 'rgba(239,68,68,0.2)' : 'rgba(124,58,237,0.2)',
            color:      timer.expired ? '#F87171' : '#C084FC',
            border:     `1.5px solid ${timer.expired ? '#EF4444' : '#7C3AED'}`,
          }}
        >
          ⏱ {timer.display}
        </div>
      </div>

      {timer.expired && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-sm font-bold">
          ⏰ Time's up! Submit what you have.
        </div>
      )}

      <div className="space-y-5 mb-6">
        {content.mcqs.map((q, qi) => (
          <div key={qi} className="card p-5 border border-[#2B2E3C] bg-[#14161E]">
            <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                style={{ background: '#7C3AED' }}
              >
                {qi + 1}
              </span>
              {q.q}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {q.options.map((opt, oi) => {
                const picked = selected[qi] === oi;
                return (
                  <button
                    key={oi}
                    id={`mcq-${qi}-opt-${oi}`}
                    onClick={() => setSelected((p) => ({ ...p, [qi]: oi }))}
                    className="text-left px-3.5 py-3 rounded-xl text-xs font-semibold transition-all border"
                    style={{
                      background:  picked ? '#252836' : '#1E202B',
                      borderColor: picked ? '#A855F7' : '#2B2E3C',
                      color:       picked ? '#FFFFFF' : '#CBD5E1',
                    }}
                  >
                    <span
                      className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black mr-2"
                      style={{ background: picked ? '#A855F7' : '#2B2E3C', color: '#fff' }}
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

      <button
        id="submit-test-btn"
        onClick={handleSubmit}
        disabled={!allAnswered}
        className="w-full py-3.5 rounded-2xl font-black text-white transition-all shadow-md"
        style={{
          background: allAnswered ? 'linear-gradient(135deg,#7C3AED,#A855F7)' : '#2B2E3C',
          cursor:     allAnswered ? 'pointer' : 'not-allowed',
        }}
      >
        Submit Assessment →
      </button>
    </div>
  );
}

function StepAnalyze({ content, score, skillBefore, skillAfter, onDone }) {
  const [barWidth, setBarWidth] = useState(skillBefore);

  useEffect(() => {
    setTimeout(() => setBarWidth(skillAfter), 150);
  }, [skillAfter]);

  const chips = [
    { label: 'Learning',   icon: '📖', done: true,  extra: '✓' },
    { label: 'Practice',   icon: '✏️', done: true,  extra: '✓' },
    { label: 'Assessment', icon: '⚡', done: true,  extra: `${score}%` },
  ];

  const msg =
    score >= 80 ? `🤖 Great work! Your understanding of ${content.title} is solid. Next: tackle ${content.nextTopic}.` :
    score >= 50 ? `🤖 Decent attempt! Review weak spots to push above 80%. Next up: ${content.nextTopic}.` :
                  `🤖 Keep going — mastery takes repetition. Revisit the content and try again!`;

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">{score >= 80 ? '🎉' : score >= 50 ? '📈' : '💪'}</div>
        <h2 className="text-2xl font-black text-white">Session Complete!</h2>
        <p className="text-slate-300 text-sm mt-1">Here's how you did across all 4 stages.</p>
      </div>

      <div className="flex gap-3 justify-center mb-6">
        {chips.map(({ label, icon, done, extra }) => (
          <div
            key={label}
            className="flex flex-col items-center px-4 py-3 rounded-2xl text-sm font-bold flex-1 border border-[#2B2E3C] bg-[#14161E]"
          >
            <span className="text-2xl mb-1">{icon}</span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{label}</span>
            <span className="font-black text-base mt-0.5 text-emerald-400">
              {extra}
            </span>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-4 border border-[#2B2E3C] bg-[#14161E]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-extrabold text-white">{content.skill}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{skillBefore}%</span>
            <span className="text-xs text-slate-400">→</span>
            <span className="text-sm font-black text-emerald-400">{skillAfter}%</span>
            <span className="text-xs font-bold text-emerald-400">+{skillAfter - skillBefore}%</span>
          </div>
        </div>
        <div className="h-3 rounded-full bg-[#1E202B] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width:      `${barWidth}%`,
              background: 'linear-gradient(90deg,#7C3AED,#10B981)',
              transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>
      </div>

      <div className="p-4 rounded-2xl mb-6 flex items-start gap-3 bg-purple-950/40 border border-purple-800/60">
        <span className="text-2xl">🤖</span>
        <p className="text-sm text-purple-200 leading-relaxed font-medium">{msg}</p>
      </div>

      <button
        id="stepper-done-btn"
        onClick={onDone}
        className="w-full py-3.5 rounded-2xl font-black text-white shadow-xl"
        style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)' }}
      >
        Done — Back to Learning Plan ✓
      </button>
    </div>
  );
}

export default function TopicStepper({ taskLabel, skillName, onClose }) {
  const { student, setStudent } = useApp();
  const content = getContent(taskLabel);

  const [step,        setStep]       = useState(0);
  const [testScore,   setTestScore]  = useState(0);
  const skillObj     = student?.skills?.find((s) => s.name === skillName) ??
                       student?.skills?.[0] ??
                       { name: 'DSA', current: 60 };
  const skillBefore  = skillObj.current;
  const skillAfter   = Math.min(100, skillBefore + 4);

  const advanceTo = (next, score) => {
    if (score !== undefined) setTestScore(score);
    setStep(next);
  };

  const handleDone = async () => {
    if (student?._id && student?.skills) {
      const updated = student.skills.map((s) =>
        s.name === skillObj.name ? { ...s, current: skillAfter } : s
      );
      try {
        const res = await axios.post(
          `/api/student/${student._id}/update-skills`,
          { skills: updated }
        );
        setStudent(res.data);
      } catch {/* silent */}
    }
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="w-full max-w-xl bg-[#1E202B] text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[#2B2E3C]"
          style={{
            maxHeight: '90vh',
            pointerEvents: 'auto',
          }}
        >
          <div className="px-6 py-3 flex items-center gap-2 bg-amber-950/50 border-b border-amber-800/60">
            <span className="text-base">💡</span>
            <p className="text-xs font-bold text-amber-200 leading-snug">
              Watching a video alone doesn't mean mastery. You prove it by practicing and testing.
            </p>
          </div>

          <div className="px-6 pt-5 pb-4 border-b border-[#2B2E3C]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-0.5">
                  Topic Deep Dive
                </p>
                <p className="text-lg font-black text-white">{taskLabel}</p>
              </div>
              <button
                id="stepper-close-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-[#252836] hover:text-white transition-colors text-lg"
              >
                ×
              </button>
            </div>
            <StepBar step={step} />
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {step === 0 && <StepLearn    content={content} onNext={() => advanceTo(1)} />}
            {step === 1 && <StepPractice content={content} onNext={() => advanceTo(2)} />}
            {step === 2 && <StepTest     content={content} onNext={(s) => advanceTo(3, s)} />}
            {step === 3 && (
              <StepAnalyze
                content={content}
                score={testScore}
                skillBefore={skillBefore}
                skillAfter={skillAfter}
                onDone={handleDone}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
