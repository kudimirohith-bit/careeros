import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';

const TOPIC_CONTENT = {
  default: {
    title:   'Arrays & Hashing',
    skill:   'DSA',
    article: [
      'An array is a collection of elements stored at contiguous memory locations. Arrays allow random access in O(1) time, making them efficient for index-based lookups.',
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
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors mb-1"
                style={{
                  background: done ? '#8B5CF6' : active ? '#1B1E27' : '#11131A',
                  color:      done ? '#FFFFFF' : active ? '#A78BFA' : '#737B8C',
                  border:     active ? '1px solid #8B5CF6' : '1px solid #282D38',
                }}
              >
                {done ? '✓' : STEP_ICONS[i]}
              </div>
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: active ? '#A78BFA' : done ? '#A7ADBA' : '#737B8C' }}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className="h-0.5 flex-1 mx-1 mb-4 rounded-full transition-colors"
                style={{ background: done ? '#8B5CF6' : '#282D38' }}
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
      <h2 className="text-lg font-bold text-[#F5F7FA] mb-1">{content.title}</h2>
      <p className="text-xs text-[#737B8C] mb-4">Read the material, then watch the video to proceed.</p>

      <div className="space-y-3 mb-5">
        {content.article.map((para, i) => (
          <p key={i} className="text-xs text-[#A7ADBA] leading-relaxed bg-[#1B1E27] p-3.5 rounded-xl border border-[#282D38]">
            {para}
          </p>
        ))}
      </div>

      <div
        className="relative rounded-xl overflow-hidden mb-5 flex items-center justify-center bg-[#11131A] border border-[#282D38]"
        style={{ height: 160 }}
      >
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 bg-[#8B5CF6] text-white"
            onClick={() => setWatched(true)}
          >
            <span className="text-base ml-0.5">▶</span>
          </div>
          <p className="text-[#F5F7FA] text-xs font-medium">{content.videoLabel}</p>
          {watched && (
            <span className="text-[10px] text-[#34D399] font-semibold bg-[rgba(52,211,153,0.1)] px-2.5 py-0.5 rounded-full border border-[rgba(52,211,153,0.25)]">
              ✓ Watched
            </span>
          )}
        </div>
      </div>

      <button
        id="mark-watched-btn"
        onClick={() => { setWatched(true); onNext(); }}
        className="w-full py-2.5 rounded-xl font-semibold text-xs text-white transition-colors bg-[#8B5CF6] hover:bg-[#7C3AED]"
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
      <h2 className="text-lg font-bold text-[#F5F7FA] mb-1">Practice Problems</h2>
      <p className="text-xs text-[#737B8C] mb-4">Write your approach — no execution needed.</p>

      <div className="space-y-4 mb-5">
        {content.practiceQs.map((q, i) => (
          <div key={i} className="card p-4 border border-[#282D38] bg-[#1B1E27]">
            <div className="flex gap-2 mb-2">
              <span
                className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white bg-[#8B5CF6]"
              >
                {i + 1}
              </span>
              <p className="text-xs font-semibold text-[#F5F7FA] leading-relaxed">{q.q}</p>
            </div>
            <p className="text-[11px] text-[#FBBF24] bg-[rgba(251,191,36,0.08)] px-2.5 py-1 rounded-md mb-2.5 border border-[rgba(251,191,36,0.2)]">
              {q.hint}
            </p>
            <textarea
              id={`practice-answer-${i}`}
              rows={3}
              value={answers[i]}
              onChange={(e) => setAnswers((prev) => prev.map((v, idx) => idx === i ? e.target.value : v))}
              placeholder="Write your approach or pseudocode here..."
              className="w-full px-3 py-2 text-xs text-[#F5F7FA] rounded-lg resize-none outline-none bg-[#14161E] border border-[#282D38] focus:border-[#8B5CF6] placeholder-[#737B8C]"
            />
          </div>
        ))}
      </div>

      <button
        id="submit-practice-btn"
        onClick={onNext}
        disabled={!allFilled}
        className="w-full py-2.5 rounded-xl font-semibold text-xs text-white transition-colors bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#F5F7FA]">Mini Assessment</h2>
          <p className="text-xs text-[#737B8C]">{content.mcqs.length} questions · auto-scored</p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-lg font-mono font-bold text-xs"
          style={{
            background: timer.expired ? 'rgba(248,113,113,0.1)' : 'rgba(139,92,246,0.1)',
            color:      timer.expired ? '#F87171' : '#A78BFA',
            border:     `1px solid ${timer.expired ? 'rgba(248,113,113,0.25)' : 'rgba(139,92,246,0.25)'}`,
          }}
        >
          ⏱ {timer.display}
        </div>
      </div>

      <div className="space-y-4 mb-5">
        {content.mcqs.map((q, qi) => (
          <div key={qi} className="card p-4 border border-[#282D38] bg-[#1B1E27]">
            <p className="text-xs font-semibold text-[#F5F7FA] mb-2.5 flex items-center gap-2">
              <span
                className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold text-white bg-[#8B5CF6]"
              >
                {qi + 1}
              </span>
              {q.q}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, oi) => {
                const picked = selected[qi] === oi;
                return (
                  <button
                    key={oi}
                    id={`mcq-${qi}-opt-${oi}`}
                    onClick={() => setSelected((p) => ({ ...p, [qi]: oi }))}
                    className="text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors border"
                    style={{
                      background:  picked ? 'rgba(139,92,246,0.12)' : '#14161E',
                      borderColor: picked ? 'rgba(139,92,246,0.3)' : '#282D38',
                      color:       picked ? '#F5F7FA' : '#A7ADBA',
                    }}
                  >
                    <span
                      className="inline-flex items-center justify-center w-3.5 h-3.5 rounded text-[9px] font-bold mr-1.5"
                      style={{ background: picked ? '#8B5CF6' : '#282D38', color: '#fff' }}
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
        className="w-full py-2.5 rounded-xl font-semibold text-xs text-white transition-colors bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed"
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
    { label: 'Learning',   icon: '📖', extra: '✓' },
    { label: 'Practice',   icon: '✏️', extra: '✓' },
    { label: 'Assessment', icon: '⚡', extra: `${score}%` },
  ];

  const msg =
    score >= 80 ? `🤖 Great work! Your understanding of ${content.title} is solid. Next: tackle ${content.nextTopic}.` :
    score >= 50 ? `🤖 Decent attempt! Review weak spots to push above 80%. Next up: ${content.nextTopic}.` :
                  `🤖 Keep going — mastery takes repetition. Revisit the content and try again!`;

  return (
    <div>
      <div className="text-center mb-5">
        <div className="text-4xl mb-1">{score >= 80 ? '🎉' : score >= 50 ? '📈' : '💪'}</div>
        <h2 className="text-xl font-bold text-[#F5F7FA]">Session Complete!</h2>
        <p className="text-[#737B8C] text-xs mt-0.5">Here's how you did across all 4 stages.</p>
      </div>

      <div className="flex gap-2.5 justify-center mb-5">
        {chips.map(({ label, icon, extra }) => (
          <div
            key={label}
            className="flex flex-col items-center p-3 rounded-xl text-xs font-semibold flex-1 border border-[#282D38] bg-[#1B1E27]"
          >
            <span className="text-xl mb-1">{icon}</span>
            <span className="text-[10px] text-[#737B8C] uppercase tracking-wider">{label}</span>
            <span className="font-bold text-xs mt-0.5 text-[#34D399]">
              {extra}
            </span>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-4 border border-[#282D38] bg-[#1B1E27]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#F5F7FA]">{content.skill}</span>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#737B8C]">{skillBefore}%</span>
            <span className="text-[#737B8C]">→</span>
            <span className="font-bold text-[#34D399]">{skillAfter}%</span>
            <span className="text-[11px] font-semibold text-[#34D399]">(+{skillAfter - skillBefore}%)</span>
          </div>
        </div>
        <div className="h-2 rounded-full bg-[#14161E] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#34D399]"
            style={{
              width: `${barWidth}%`,
              transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>
      </div>

      <div className="p-3.5 rounded-xl mb-5 flex items-start gap-2.5 bg-[#1B1E27] border border-[rgba(139,92,246,0.3)]">
        <span className="text-base text-[#A78BFA]">🤖</span>
        <p className="text-xs text-[#A7ADBA] leading-relaxed">{msg}</p>
      </div>

      <button
        id="stepper-done-btn"
        onClick={onDone}
        className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-[#8B5CF6] hover:bg-[#7C3AED] transition-colors"
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
        className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="w-full max-w-xl bg-[#171A22] text-[#F5F7FA] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#282D38]"
          style={{
            maxHeight: '90vh',
            pointerEvents: 'auto',
          }}
        >
          <div className="px-6 py-2.5 flex items-center gap-2 bg-[#1B1E27] border-b border-[#282D38]">
            <span className="text-sm text-[#FBBF24]">💡</span>
            <p className="text-xs text-[#A7ADBA] font-medium leading-snug">
              Prove your understanding by practicing and testing.
            </p>
          </div>

          <div className="px-6 pt-5 pb-4 border-b border-[#282D38]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-semibold text-[#A78BFA] uppercase tracking-wider mb-0.5">
                  Topic Deep Dive
                </p>
                <p className="text-base font-bold text-[#F5F7FA]">{taskLabel}</p>
              </div>
              <button
                id="stepper-close-btn"
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#737B8C] hover:bg-[#1B1E27] hover:text-[#F5F7FA] transition-colors text-base"
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
