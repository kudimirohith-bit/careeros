import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function WhatIfSimulator() {
  const { student } = useApp();
  const skills = student?.skills ?? [
    { name: 'DSA', current: 55, target: 85 },
    { name: 'Node.js', current: 60, target: 80 },
    { name: 'System Design', current: 40, target: 80 },
    { name: 'React', current: 65, target: 85 },
  ];

  const [weeklyHours, setWeeklyHours] = useState({
    DSA: 5,
    'System Design': 3,
    'Node.js': 4,
    React: 2,
  });

  const totalWeeklyHours = Object.values(weeklyHours).reduce((a, b) => a + b, 0);

  // Simulation calculations
  const predictSkillBoost = (current, hours, months) => {
    const gain = Math.min(35, Math.round(hours * 0.8 * months));
    return Math.min(100, current + gain);
  };

  const simulatedReadiness = (months) => {
    let sum = 0;
    skills.forEach((s) => {
      const hours = weeklyHours[s.name] ?? 2;
      const boosted = predictSkillBoost(s.current, hours, months);
      sum += (boosted / s.target) * 100;
    });
    return Math.min(100, Math.round(sum / skills.length));
  };

  const currentReadiness = student?.careerReadiness ?? 60;
  const readiness1M = simulatedReadiness(1);
  const readiness3M = simulatedReadiness(3);
  const readiness6M = simulatedReadiness(6);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">🔮 What-If Simulator</h1>
        <p className="text-slate-500 text-sm mt-1">
          Simulate how adjusting your weekly study hours impacts your skill levels & career readiness over time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Control Sliders */}
        <div className="md:col-span-2 card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800">Weekly Learning Allocation</h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
              Total: {totalWeeklyHours} hrs/week
            </span>
          </div>

          <div className="space-y-5">
            {skills.map((s) => {
              const hours = weeklyHours[s.name] ?? 2;
              const projected3M = predictSkillBoost(s.current, hours, 3);

              return (
                <div key={s.name} className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-700 font-semibold">{s.name}</span>
                    <span className="text-indigo-600 font-bold">{hours} hrs/week</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    value={hours}
                    onChange={(e) =>
                      setWeeklyHours({ ...weeklyHours, [s.name]: parseInt(e.target.value) })
                    }
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Current: {s.current}%</span>
                    <span className="text-emerald-600 font-semibold">3-Month Forecast: {projected3M}%</span>
                    <span>Target: {s.target}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Forecast Card */}
        <div className="card p-6 flex flex-col justify-between space-y-6" style={{ background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)', color: '#fff' }}>
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Growth Projection</span>
            <h3 className="text-xl font-bold mt-1 mb-6">Career Readiness Trajectory</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs text-slate-300">Today</span>
                <span className="text-lg font-extrabold text-slate-300">{currentReadiness}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/20">
                <span className="text-xs text-indigo-200">In 1 Month</span>
                <span className="text-xl font-extrabold text-indigo-300">+{readiness1M - currentReadiness}% → {readiness1M}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/20 border border-indigo-400/30">
                <span className="text-xs text-emerald-200">In 3 Months</span>
                <span className="text-2xl font-extrabold text-emerald-400">+{readiness3M - currentReadiness}% → {readiness3M}%</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed">
            💡 <span className="font-bold text-white">Insight:</span> Devoting {weeklyHours['DSA'] ?? 0} hrs/week to DSA will yield the highest readiness impact for backend roles.
          </div>
        </div>
      </div>
    </div>
  );
}
