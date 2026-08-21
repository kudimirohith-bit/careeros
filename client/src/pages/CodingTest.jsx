import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const PROBLEM = {
  title:      'Two Sum',
  difficulty: { label: 'Medium', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
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
    { label: '[3,3], target=6',        expected: '[0,1]', pass: false },
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

const AI_METRICS = [
  { label: 'Correctness',  value: 80, color: '#8B5CF6' },
  { label: 'Efficiency',   value: 65, color: '#FBBF24' },
  { label: 'Code Quality', value: 82, color: '#34D399' },
];

const AI_FEEDBACK = [
  { type: 'good', text: 'Good overall structure and readability' },
  { type: 'good', text: 'Correct variable naming conventions (camelCase)' },
  { type: 'warn', text: 'Time complexity O(n²) — consider using a HashMap for O(n)' },
  { type: 'warn', text: 'Missing edge case: empty array input not handled' },
  { type: 'tip',  text: 'Next: Practice HashMap-based problems to improve efficiency score' },
];

function MetricBar({ label, value, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay + 100);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-[#A7ADBA]">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#1B1E27] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            background: color,
            transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  );
}

function CodeEditor({ value, onChange }) {
  const textareaRef  = useRef(null);
  const gutterRef    = useRef(null);
  const lines        = value.split('\n');

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
      className="flex rounded-b-xl overflow-hidden flex-1 min-h-0"
      style={{ background: '#0B0D12', border: '1px solid #282D38', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
    >
      <div
        ref={gutterRef}
        className="select-none overflow-hidden flex-shrink-0"
        style={{
          width: 44,
          background: '#11131A',
          borderRight: '1px solid #282D38',
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
              color: '#737B8C',
              textAlign: 'right',
              paddingRight: 8,
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleTab}
        onScroll={syncScroll}
        spellCheck={false}
        className="flex-1 resize-none outline-none p-3 text-sm leading-[21px]"
        style={{
          background:  '#0B0D12',
          color:       '#F5F7FA',
          fontFamily:  "'JetBrains Mono', 'Fira Code', monospace",
          fontSize:    13,
          lineHeight:  '21px',
          caretColor:  '#8B5CF6',
          tabSize:     2,
        }}
      />
    </div>
  );
}

function TestResults({ results, running }) {
  if (running) {
    return (
      <div className="flex items-center gap-3 py-4 px-4 rounded-xl bg-[#1B1E27] border border-[#282D38]">
        <span className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin flex-shrink-0" />
        <span className="text-xs text-[#A7ADBA] font-medium">Running test cases...</span>
      </div>
    );
  }

  const passed = results.filter((r) => r.pass).length;
  return (
    <div
      className="rounded-xl overflow-hidden border border-[#282D38] bg-[#171A22]"
    >
      <div
        className="px-4 py-2.5 flex items-center justify-between border-b border-[#282D38]"
        style={{
          background: passed === results.length ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
        }}
      >
        <span className="text-xs font-bold" style={{ color: passed === results.length ? '#34D399' : '#F87171' }}>
          {passed === results.length ? '✅' : '⚠️'} Test Results — {passed}/{results.length} Passed
        </span>
        <span className="text-[11px] text-[#737B8C]">~1.5ms runtime</span>
      </div>
      {results.map((r, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-2.5 border-b border-[#282D38] last:border-0 bg-[#171A22]"
        >
          <span className="text-xs flex-shrink-0">{r.pass ? '✅' : '❌'}</span>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-mono text-[#A7ADBA]">{r.label}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] text-[#737B8C]">Expected:</span>
            <code className="text-xs font-mono font-bold text-[#F5F7FA]">{r.expected}</code>
          </div>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded border"
            style={{
              background: r.pass ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
              color:      r.pass ? '#34D399' : '#F87171',
              borderColor: r.pass ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)',
            }}
          >
            {r.pass ? 'PASS' : 'FAIL'}
          </span>
        </div>
      ))}
    </div>
  );
}

function AiReview({ onNavigate }) {
  const ICONS = { good: '✅', warn: '⚠️', tip: '💡' };

  return (
    <div className="rounded-xl overflow-hidden border border-[rgba(139,92,246,0.3)] bg-[#171A22]">
      <div className="px-5 py-3.5 flex items-center gap-3 bg-[#1B1E27] border-b border-[#282D38]">
        <span className="text-lg text-[#A78BFA] bg-[rgba(139,92,246,0.12)] p-1.5 rounded-lg">🤖</span>
        <div>
          <p className="text-[#F5F7FA] font-bold text-sm">AI Code Review</p>
          <p className="text-[#737B8C] text-[11px]">Powered by Career OS Intelligence</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-3">
          {AI_METRICS.map((m, i) => (
            <MetricBar key={m.label} {...m} delay={i * 180} />
          ))}
        </div>

        <div className="h-px bg-[#282D38]" />

        <div className="space-y-2">
          {AI_FEEDBACK.map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs"
              style={{
                background:
                  f.type === 'good' ? 'rgba(52,211,153,0.08)' :
                  f.type === 'warn' ? 'rgba(251,191,36,0.08)' : 'rgba(139,92,246,0.08)',
                border: `1px solid ${
                  f.type === 'good' ? 'rgba(52,211,153,0.2)' :
                  f.type === 'warn' ? 'rgba(251,191,36,0.2)' : 'rgba(139,92,246,0.2)'
                }`,
              }}
            >
              <span className="flex-shrink-0 text-sm">{ICONS[f.type]}</span>
              <span
                className="font-medium"
                style={{
                  color:
                    f.type === 'good' ? '#34D399' :
                    f.type === 'warn' ? '#FBBF24' : '#A78BFA',
                }}
              >
                {f.text}
              </span>
            </div>
          ))}
        </div>

        <button
          id="practice-hashmap-btn"
          onClick={() => onNavigate('learning-plan')}
          className="w-full py-2.5 rounded-xl font-semibold text-xs text-white transition-colors bg-[#8B5CF6] hover:bg-[#7C3AED]"
        >
          Practice HashMap Problems →
        </button>
      </div>
    </div>
  );
}

function DiffBadge({ d }) {
  return (
    <span
      className="text-xs font-semibold px-2.5 py-0.5 rounded-md border"
      style={{ background: d.bg, color: d.color, borderColor: d.border }}
    >
      🟡 {d.label}
    </span>
  );
}

export default function CodingTest() {
  const { setCurrentPage } = useApp();

  const [lang,       setLang]       = useState('javascript');
  const [code,       setCode]       = useState(STARTER.javascript);
  const [running,    setRunning]    = useState(false);
  const [results,    setResults]    = useState(null);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const resultsRef = useRef(null);

  const handleLangChange = (l) => {
    setLang(l);
    setCode(STARTER[l]);
    setResults(null);
    setSubmitted(false);
  };

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
    <div className="flex flex-col h-full gap-0 max-w-6xl mx-auto" style={{ minHeight: 'calc(100vh - 128px)' }}>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#F5F7FA]">{PROBLEM.title}</h1>
          <DiffBadge d={PROBLEM.difficulty} />
          {PROBLEM.tags.map((t) => (
            <span key={t} className="text-xs font-medium px-2 py-0.5 rounded bg-[#171A22] text-[#A7ADBA] border border-[#282D38]">{t}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-[#737B8C]">
          <span className="w-2 h-2 rounded-full bg-[#34D399] inline-block" />
          Auto-save enabled
        </div>
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* LEFT: Problem panel */}
        <div className="card p-5 overflow-y-auto flex flex-col gap-5 bg-[#171A22] border border-[#282D38]">
          <div>
            <h3 className="text-xs font-semibold text-[#737B8C] uppercase tracking-wider mb-2">Problem</h3>
            <p className="text-xs text-[#F5F7FA] leading-relaxed whitespace-pre-line">{PROBLEM.statement}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#737B8C] uppercase tracking-wider mb-3">Examples</h3>
            <div className="space-y-3">
              {PROBLEM.examples.map((ex, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3.5 text-xs font-mono bg-[#1B1E27] border border-[#282D38]"
                >
                  <p className="text-[#737B8C] mb-0.5">Input:</p>
                  <p className="text-[#F5F7FA] font-medium mb-2">{ex.input}</p>
                  <p className="text-[#737B8C] mb-0.5">Output:</p>
                  <p className="text-[#34D399] font-medium mb-2">{ex.output}</p>
                  <p className="text-[#737B8C] italic">// {ex.explain}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#737B8C] uppercase tracking-wider mb-2">Constraints</h3>
            <ul className="space-y-1">
              {PROBLEM.constraints.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#A7ADBA]">
                  <span className="text-[#8B5CF6] mt-0.5 flex-shrink-0">•</span>
                  <code className="font-mono">{c}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT: Editor panel */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col rounded-xl overflow-hidden flex-1 min-h-0 border border-[#282D38] bg-[#0B0D12]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#11131A] border-b border-[#282D38]">
              <div className="flex items-center gap-2">
                <span className="text-[#737B8C] text-xs font-mono">solution.{lang === 'python' ? 'py' : lang === 'java' ? 'java' : 'js'}</span>
              </div>

              <select
                id="lang-selector"
                value={lang}
                onChange={(e) => handleLangChange(e.target.value)}
                className="text-xs font-medium rounded-md px-2 py-1 outline-none bg-[#171A22] text-[#F5F7FA] border border-[#282D38]"
              >
                {LANG_OPTIONS.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </div>

            <CodeEditor value={code} onChange={setCode} />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-shrink-0">
            <button
              id="run-code-btn"
              onClick={handleRun}
              disabled={running}
              className="flex-1 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors bg-[#1B1E27] text-[#F5F7FA] border border-[#282D38] hover:bg-[#20242E]"
            >
              {running
                ? <><span className="w-3 h-3 border-2 border-[#A7ADBA] border-t-transparent rounded-full animate-spin" /> Running...</>
                : '▶ Run Code'
              }
            </button>

            <button
              id="submit-code-btn"
              onClick={handleSubmit}
              disabled={submitting || !results}
              className="flex-[2] py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 text-white transition-colors bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analysing...</>
                : '🚀 Submit & Get AI Review'
              }
            </button>
          </div>

          {/* Results Area */}
          <div
            ref={resultsRef}
            className="overflow-y-auto space-y-4 flex-shrink-0"
            style={{ maxHeight: 300 }}
          >
            {(running || results) && (
              <TestResults results={results ?? []} running={running} />
            )}

            {results && !running && (
              <div
                className="px-4 py-2.5 rounded-xl flex items-center justify-between border"
                style={{
                  background: passCount === results.length ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.08)',
                  borderColor: passCount === results.length ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.25)',
                }}
              >
                <span className="text-xs font-semibold" style={{ color: passCount === results.length ? '#34D399' : '#FBBF24' }}>
                  {passCount === results.length
                    ? '🎉 All tests passed! Ready to submit.'
                    : `⚠️ ${passCount}/${results.length} tests passed. Review your solution.`}
                </span>
                <span className="text-[11px] text-[#737B8C]">O(n²) complexity</span>
              </div>
            )}

            {submitted && <AiReview onNavigate={setCurrentPage} />}
          </div>
        </div>
      </div>
    </div>
  );
}
