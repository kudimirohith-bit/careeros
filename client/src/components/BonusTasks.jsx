import { useState } from 'react';
import { api } from '../api/api';

export default function BonusTasks({ studentId, allDone }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  if (!allDone) return null;

  const fetchBonus = async () => {
    setLoading(true);
    try {
      const result = await api.getBonusTasks(studentId, 30);
      setTasks(result.tasks || []);
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
          <p className="text-sm font-bold text-[#34D399]">🎉 All tasks done!</p>
          <p className="text-xs text-[#A7ADBA]">Want bonus challenges?</p>
        </div>
        {!fetched && (
          <button
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
