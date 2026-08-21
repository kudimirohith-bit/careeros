import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3.5 py-2.5 rounded-xl text-xs shadow-xl border bg-[#1B1E27] border-[#282D38] text-[#F5F7FA]">
      <p className="font-bold text-[#A7ADBA] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 font-medium" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <span className="font-bold text-[#F5F7FA]">{p.value}%</span>
        </p>
      ))}
    </div>
  );
}

export default function ProgressPage() {
  const { student } = useApp();
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student?._id) return;
    api
      .getProgress(student._id)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProgressData(
            data.map((p, i) => ({
              day: `Day ${i + 1}`,
              readiness: p.careerReadiness,
              date: new Date(p.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
              ...p.skills,
            }))
          );
        }
      })
      .catch((err) => console.error('Failed to load progress:', err))
      .finally(() => setLoading(false));
  }, [student]);

  if (loading) {
    return <div className="p-8 text-[#737B8C] text-sm">Loading progress history...</div>;
  }

  // Skills comparison: 10 days ago (or first snapshot) vs now
  const trackSkills = ['DSA', 'Backend', 'DBMS', 'Communication'];
  const skillComparison = trackSkills.map((skill) => {
    const studentSkill = student?.skills?.find((s) => s.name === skill);
    return {
      skill,
      before: progressData[0]?.[skill] || studentSkill?.current || 40,
      now: studentSkill?.current || progressData[progressData.length - 1]?.[skill] || 60,
    };
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <p className="text-xs font-semibold text-[#737B8C]">Analytics</p>
        <h1 className="text-2xl font-bold text-[#F5F7FA] mt-0.5">Progress Tracking</h1>
        <p className="text-[#A7ADBA] text-xs mt-1">
          Historical view of your career readiness and skill growth trajectory over time.
        </p>
      </div>

      {/* Line Chart for Career Readiness */}
      <div className="card p-6 bg-[#171A22] border border-[#282D38] rounded-2xl">
        <h2 className="text-base font-bold text-[#F5F7FA] mb-4">Career Readiness Over Time</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#282D38" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#A7ADBA' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#A7ADBA' }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="readiness"
              name="Career Readiness"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={{ r: 4, fill: '#8B5CF6' }}
              activeDot={{ r: 6, fill: '#A78BFA' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart comparing skills: Then vs Now */}
      <div className="card p-6 bg-[#171A22] border border-[#282D38] rounded-2xl">
        <h2 className="text-base font-bold text-[#F5F7FA] mb-4">Skills: Then vs Now</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={skillComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="#282D38" />
            <XAxis dataKey="skill" tick={{ fontSize: 11, fill: '#A7ADBA' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#A7ADBA' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10, color: '#A7ADBA' }} />
            <Bar dataKey="before" name="10 days ago" fill="#374151" radius={[4, 4, 0, 0]} barSize={16} />
            <Bar dataKey="now" name="Now" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
