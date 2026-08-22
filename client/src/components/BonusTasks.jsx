import { useState } from 'react';
import { callGemini } from '../utils/ai';
import { useApp } from '../context/AppContext';

function parseJSON(raw) {
  try {
    const s = raw.indexOf('[');
    const e = raw.lastIndexOf(']');
    if (s !== -1 && e !== -1) return JSON.parse(raw.substring(s, e + 1));
    return JSON.parse(raw);
  } catch { return []; }
}

export default function BonusTasks({ allDone }) {
  const { student } = useApp();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  if (!allDone) return null;

  const fetchBonus = async () => {
    setLoading(true);
    try {
      const system = 'Return ONLY a JSON array of 3 bonus task objects: [{"title":string,"estimatedMinutes":number,"whyNow":string}]. No markdown.';
      const user = `Generate 3 short bonus practice tasks for a student targeting ${student?.targetRole || 'Software Engineer'}.`;
      const raw = await callGemini(system, user);
      const parsed = parseJSON(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setTasks(parsed);
      } else {
        setTasks([
          { title: 'Read System Design whitepaper', estimatedMinutes: 15, whyNow: 'Build architectural intuition' },
          { title: 'Solve 1 Medium LeetCode problem', estimatedMinutes: 20, whyNow: 'Reinforce algorithm speed' },
        ]);
      }
      setFetched(true);
    } catch (err) {
      console.error('Bonus tasks error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-[rgba(52,211,153,0.08)] to-[rgba(139,92,246,0.08)] border border-[rgba(52,211,153,0.3)]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-[#34D399]">🎉 All daily tasks done!</p>
          <p className="text-xs text-[#A7ADBA]">Want bonus AI challenges?</p>
        </div>
        {!fetched && (
          <button
            id="get-bonus-tasks-btn"
            onClick={fetchBonus}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#8B5CF6] text-white disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Get Bonus Tasks'}
          </button>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="space-y-2 mt-3">
          {tasks.map((t, i) => (
            <div key={i} className="p-3 rounded-xl bg-[#1B1E27] border border-[#282D38]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#F5F7FA]">{t.title}</p>
                <span className="text-[10px] text-[#737B8C]">~{t.estimatedMinutes} min</span>
              </div>
              <p className="text-[10px] text-[#A78BFA] mt-1">{t.whyNow}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
