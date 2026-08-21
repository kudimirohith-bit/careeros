import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

/* ─── Static data ────────────────────────────────────────────────── */
const PROBLEM = {
  title:      'Two Sum',
  difficulty: { label: 'Medium', color: '#F59E0B', bg: '#FEF9C3', border: '#FDE68A' },
  tags:       ['Array', 'Hash Map'],
  statement:  `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
  examples: [
    { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]',  explain: 'nums[0] + nums[1] = 2 + 7 = 9' },
    { input: 'nums = [3, 2, 4], target = 6',       output: '[1, 2]',  explain: 'nums[1] + nums[2] = 2 + 4 = 6' },
    { input: 'nums = [3, 3], target = 6',           output: '[0, 1]',  explain: 'nums[0] + nums[1] = 3 + 3 = 6' },
  ],
  constraints: [
    '2 ≤ nums.length ≤ 10⁴',
    '-10⁹ ≤ nums[i] ≤ 10⁹',
    '-10⁹ ≤ target ≤ 10⁹',
    'Each input has exactly one solution',
  ],
  testCases: [
    { label: '[2,7,11,15], target=9',  expected: '[0,1]', pass: true  },
    { label: '[3,2,4], target=6',      expected: '[1,2]', pass: true  },
    { label: '[3,3], target=6',        expected: '[0,1]', pass: false }, // simulated fail
  ],
};

const STARTER = {
  javascript: `function twoSum(nums, target) {
  // Write your solution here
  
}`,
  python: `def two_sum(nums: list[int], target: int) -> list[int]:
    # Write your solution here
    pass`,
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}`,
};

const LANG_OPTIONS = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python',     label: 'Python'     },
  { id: 'java',       label: 'Java'       },
];

/* ─── AI review data ─────────────────────────────────────────────── */
const AI_METRICS = [
  { label: 'Correctness',  value: 80, color: '#6366F1' },
  { label: 'Efficiency',   value: 65, color: '#F59E0B' },
  { label: 'Code Quality', value: 82, color: '#22C55E' },
];

const AI_FEEDBACK = [
  { type: 'good', text: 'Good overall structure and readability' },
  { type: 'good', text: 'Correct variable naming conventions (camelCase)' },
  { type: 'warn', text: 'Time complexity O(n²) — consider using a HashMap for O(n)' },
  { type: 'warn', text: 'Missing edge case: empty array input not handled' },
  { type: 'tip',  text: 'Next: Practice HashMap-based problems to improve efficiency score' },
];

/* ─── Animated metric bar ────────────────────────────────────────── */
function MetricBar({ label, value, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay + 100);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-sm font-black" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width:      `${width}%`,
            background: color,
            transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  );
}

/* ─── Line-numbered editor ───────────────────────────────────────── */
function CodeEditor({ value, onChange, lang }) {
  const textareaRef  = useRef(null);
  const gutterRef    = useRef(null);
  const lines        = value.split('\n');

  // Sync scroll between gutter and textarea
  const syncScroll = () => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleTab = (e) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const { selectionStart: ss, selectionEnd: se } = e.target;
    const next = value.slice(0, ss) + '  ' + value.slice(se);
    onChange(next);
    setTimeout(() => {
      e.target.selectionStart = e.target.selectionEnd = ss + 2;
    }, 0);
  };

  return (
    <div
      className="flex rounded-xl overflow-hidden flex-1 min-h-0"
      style={{ background: '#0D1117', border: '1px solid #21262D', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
    >
      {/* Gutter */}
      <div
        ref={gutterRef}
        className="select-none overflow-hidden flex-shrink-0"
        style={{
          width: 44,
          background: '#161B22',
          borderRight: '1px solid #21262D',
          overflowY: 'hidden',
          paddingTop: 12,
          paddingBottom: 12,
        }}
      >
        {lines.map((_, i) => (
          <div
            key={i}
            style={{
              height: 21,
              lineHeight: '21px',
              fontSize: 12,
              color: '#484F58',
              textAlign: 'right',
              paddingRight: 8,
              paddingLeft: 4,
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleTab}
        onScroll={syncScroll}
        spellCheck={false}
        className="flex-1 resize-none outline-none p-3 text-sm leading-[21px]"
        style={{
          background:  '#0D1117',
          color:       '#E6EDF3',
          fontFamily:  "'JetBrains Mono', 'Fira Code', monospace",
          fontSize:    13,
          lineHeight:  '21px',
          caretColor:  '#58A6FF',
          tabSize:     2,
        }}
      />
    </div>
  );
}

/* ─── Test Results ───────────────────────────────────────────────── */
function TestResults({ results, running }) {
  if (running) {
    return (
      <div className="flex items-center gap-3 py-4 px-4 rounded-xl bg-slate-50 border border-slate-200">
        <span className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
        <span className="text-sm text-slate-600 font-medium">Running test cases…</span>
      </div>
    );
  }

  const passed = results.filter((r) => r.pass).length;
  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{ borderColor: passed === results.length ? '#86EFAC' : '#FCA5A5' }}
    >
      {/* Header */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{
          background: passed === results.length ? '#F0FDF4' : '#FEF2F2',
          borderBottom: `1px solid ${passed === results.length ? '#86EFAC' : '#FCA5A5'}`,
        }}
      >
        <span className="text-sm font-bold" style={{ color: passed === results.length ? '#15803D' : '#B91C1C' }}>
          {passed === results.length ? '✅' : '⚠️'} Test Results — {passed}/{results.length} Passed
        </span>
        <span className="text-xs font-medium text-slate-500">~1.5ms runtime</span>
      </div>
      {/* Cases */}
      {results.map((r, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0"
          style={{ borderColor: '#F1F5F9', background: '#fff' }}
        >
          <span className="text-base flex-shrink-0">{r.pass ? '✅' : '❌'}</span>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-mono text-slate-600">{r.label}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-400">Expected:</span>
            <code className="text-xs font-mono font-bold text-slate-700">{r.expected}</code>
          </div>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: r.pass ? '#DCFCE7' : '#FEE2E2',
              color:      r.pass ? '#15803D' : '#DC2626',
            }}
          >
            {r.pass ? 'PASS' : 'FAIL'}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── AI Review Panel ────────────────────────────────────────────── */
function AiReview({ onNavigate }) {
  const ICONS = { good: '✅', warn: '⚠️', tip: '💡' };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: '1px solid #C7D2FE',
        animation: 'reviewSlide 0.45s cubic-bezier(.34,1.56,.64,1) both',
      }}
    >
      <style>{`
        @keyframes reviewSlide {
          from { opacity:0; transform:translateY(20px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
      `}</style>

      {/* Header */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)' }}
      >
        <span className="text-2xl">🤖</span>
        <div>
          <p className="text-white font-black text-base">AI Code Review</p>
          <p className="text-indigo-200 text-xs">Powered by Career OS Intelligence</p>
        </div>
      </div>

      <div className="p-5 bg-white space-y-5">
        {/* Metric bars */}
        <div className="space-y-4">
          {AI_METRICS.map((m, i) => (
            <MetricBar key={m.label} {...m} delay={i * 180} />
          ))}
        </div>

        <div className="h-px bg-slate-100" />

        {/* Feedback list */}
        <div className="space-y-2.5">
          {AI_FEEDBACK.map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-sm"
              style={{
                background:
                  f.type === 'good' ? '#F0FDF4' :
                  f.type === 'warn' ? '#FFFBEB' : '#EEF2FF',
                border: `1px solid ${
                  f.type === 'good' ? '#BBF7D0' :
                  f.type === 'warn' ? '#FDE68A' : '#C7D2FE'
                }`,
              }}
            >
              <span className="flex-shrink-0 text-base leading-snug">{ICONS[f.type]}</span>
              <span
                className="leading-snug font-medium"
                style={{
                  color:
                    f.type === 'good' ? '#15803D' :
                    f.type === 'warn' ? '#92400E' : '#4338CA',
                }}
              >
                {f.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          id="practice-hashmap-btn"
          onClick={() => onNavigate('learning-plan')}
          className="w-full py-3 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          style={{
            background: 'var(--accent)',
            boxShadow:  '0 4px 14px rgba(99,102,241,0.3)',
          }}
        >
          Practice HashMap Problems →
        </button>
      </div>
    </div>
  );
}

/* ─── Difficulty badge ───────────────────────────────────────────── */
function DiffBadge({ d }) {
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full border"
      style={{ background: d.bg, color: d.color, borderColor: d.border }}
    >
      🟡 {d.label}
    </span>
  );
}

/* ─── Main page ──────────────────────────────────────────────────── */
export default function CodingTest() {
  const { setCurrentPage } = useApp();

  const [lang,       setLang]       = useState('javascript');
  const [code,       setCode]       = useState(STARTER.javascript);
  const [running,    setRunning]    = useState(false);
  const [results,    setResults]    = useState(null);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const resultsRef = useRef(null);

  // Switch language resets code to starter
  const handleLangChange = (l) => {
    setLang(l);
    setCode(STARTER[l]);
    setResults(null);
    setSubmitted(false);
  };

  // Simulate run
  const handleRun = () => {
    setRunning(true);
    setResults(null);
    setSubmitted(false);
    setTimeout(() => {
      setRunning(false);
      setResults(PROBLEM.testCases);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }, 1500);
  };

  // Simulate submit → show AI review
  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }, 1200);
  };

  const passCount = PROBLEM.testCases.filter((t) => t.pass).length;

  return (
    <div className="flex flex-col h-full gap-0" style={{ minHeight: 'calc(100vh - 128px)' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.35s ease both; }
      `}</style>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-4 fade-up">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-slate-800">{PROBLEM.title}</h1>
          <DiffBadge d={PROBLEM.difficulty} />
          {PROBLEM.tags.map((t) => (
            <span key={t} className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{t}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          Auto-save enabled
        </div>
      </div>

      {/* ── Split layout ── */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">

        {/* ── LEFT: Problem panel ── */}
        <div
          className="card p-5 overflow-y-auto fade-up flex flex-col gap-5"
          style={{ animationDelay: '40ms', maxHeight: 'calc(100vh - 180px)' }}
        >
          {/* Statement */}
          <div>
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide mb-2">Problem</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{PROBLEM.statement}</p>
          </div>

          {/* Examples */}
          <div>
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide mb-3">Examples</h3>
            <div className="space-y-3">
              {PROBLEM.examples.map((ex, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3.5 text-xs font-mono"
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                >
                  <p className="text-slate-500 mb-0.5">Input:</p>
                  <p className="text-slate-800 font-semibold mb-2">{ex.input}</p>
                  <p className="text-slate-500 mb-0.5">Output:</p>
                  <p className="text-emerald-700 font-semibold mb-2">{ex.output}</p>
                  <p className="text-slate-400 italic">// {ex.explain}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div>
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide mb-2">Constraints</h3>
            <ul className="space-y-1">
              {PROBLEM.constraints.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                  <code className="font-mono">{c}</code>
                </li>
              ))}
            </ul>
          </div>

          {/* Test cases preview */}
          <div>
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide mb-2">Test Cases</h3>
            <div className="space-y-1.5">
              {PROBLEM.testCases.map((tc, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">✓</span>
                  <code className="font-mono text-slate-600">{tc.label}</code>
                  <span className="text-slate-400">→</span>
                  <code className="font-mono font-bold text-slate-700">{tc.expected}</code>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Editor panel ── */}
        <div
          className="flex flex-col gap-3 fade-up"
          style={{ animationDelay: '80ms', maxHeight: 'calc(100vh - 180px)' }}
        >
          {/* Editor card */}
          <div
            className="flex flex-col rounded-2xl overflow-hidden flex-1 min-h-0"
            style={{ background: '#0D1117', border: '1px solid #21262D', boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}
          >
            {/* Editor toolbar */}
            <div
              className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
              style={{ background: '#161B22', borderBottom: '1px solid #21262D' }}
            >
              <div className="flex items-center gap-2">
                {/* Traffic lights */}
                {['#FF5F57','#FEBC2E','#28C840'].map((c) => (
                  <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
                ))}
                <span className="text-slate-500 text-xs ml-2 font-mono">solution.{lang === 'python' ? 'py' : lang === 'java' ? 'java' : 'js'}</span>
              </div>

              {/* Language selector */}
              <select
                id="lang-selector"
                value={lang}
                onChange={(e) => handleLangChange(e.target.value)}
                className="text-xs font-semibold rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                style={{
                  background: '#21262D',
                  color:      '#E6EDF3',
                  border:     '1px solid #30363D',
                }}
              >
                {LANG_OPTIONS.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* Code area */}
            <CodeEditor value={code} onChange={setCode} lang={lang} />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-shrink-0">
            <button
              id="run-code-btn"
              onClick={handleRun}
              disabled={running}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 border"
              style={{
                background: '#161B22',
                color:      running ? '#484F58' : '#E6EDF3',
                borderColor: '#30363D',
              }}
            >
              {running
                ? <><span className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" /> Running…</>
                : '▶ Run Code'
              }
            </button>

            <button
              id="submit-code-btn"
              onClick={handleSubmit}
              disabled={submitting || !results}
              className="flex-[2] py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white transition-all duration-200"
              style={{
                background:  (!results || submitting) ? '#A5B4FC' : 'var(--accent)',
                boxShadow:   (!results || submitting) ? 'none' : '0 4px 14px rgba(99,102,241,0.3)',
                cursor:      (!results || submitting) ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analysing…</>
                : '🚀 Submit & Get AI Review'
              }
            </button>
          </div>

          {/* Results + Review — scrollable area */}
          <div
            ref={resultsRef}
            className="overflow-y-auto space-y-4 flex-shrink-0"
            style={{ maxHeight: 340 }}
          >
            {/* Test results */}
            {(running || results) && (
              <TestResults results={results ?? []} running={running} />
            )}

            {/* Score summary (after run) */}
            {results && !running && (
              <div
                className="px-4 py-3 rounded-xl flex items-center justify-between"
                style={{
                  background: passCount === results.length ? '#F0FDF4' : '#FFFBEB',
                  border:     `1px solid ${passCount === results.length ? '#86EFAC' : '#FDE68A'}`,
                }}
              >
                <span className="text-sm font-semibold" style={{ color: passCount === results.length ? '#15803D' : '#92400E' }}>
                  {passCount === results.length
                    ? '🎉 All tests passed! Ready to submit.'
                    : `⚠️ ${passCount}/${results.length} tests passed. Review your solution.`}
                </span>
                <span className="text-xs text-slate-400">O(n²) complexity detected</span>
              </div>
            )}

            {/* AI Review */}
            {submitted && <AiReview onNavigate={setCurrentPage} />}
          </div>
        </div>
      </div>
    </div>
  );
}
