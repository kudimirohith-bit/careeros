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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#737B8C]">Career Trajectory</p>
        <h1 className="text-2xl font-bold text-[#F5F7FA] mt-0.5">🔮 What-If Simulator</h1>
        <p className="text-[#A7ADBA] text-sm mt-1">
          Simulate how adjusting your weekly study hours impacts your skill levels & career readiness over time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Control Sliders */}
        <div className="md:col-span-2 card p-6 space-y-6 bg-[#171A22] border border-[#282D38]">
          <div className="flex items-center justify-between border-b border-[#282D38] pb-3">
            <h2 className="text-base font-bold text-[#F5F7FA]">Weekly Learning Allocation</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-md bg-[rgba(139,92,246,0.12)] text-[#A78BFA] border border-[rgba(139,92,246,0.25)]">
              Total: {totalWeeklyHours} hrs/week
            </span>
          </div>

          <div className="space-y-5">
            {skills.map((s) => {
              const hours = weeklyHours[s.name] ?? 2;
              const projected3M = predictSkillBoost(s.current, hours, 3);

              return (
                <div key={s.name} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-[#F5F7FA] font-semibold">{s.name}</span>
                    <span className="text-[#A78BFA] font-bold">{hours} hrs/week</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    value={hours}
                    onChange={(e) =>
                      setWeeklyHours({ ...weeklyHours, [s.name]: parseInt(e.target.value) })
                    }
                    className="w-full h-1.5 bg-[#11131A] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
                  />
                  <div className="flex justify-between text-[11px] text-[#737B8C]">
                    <span>Current: {s.current}%</span>
                    <span className="text-[#34D399] font-semibold">3-Month Forecast: {projected3M}%</span>
                    <span>Target: {s.target}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Forecast Card */}
        <div className="card p-6 flex flex-col justify-between space-y-6 bg-[#171A22] border border-[#282D38]">
          <div>
            <span className="text-xs font-semibold text-[#A78BFA] uppercase tracking-wider">Growth Projection</span>
            <h3 className="text-base font-bold text-[#F5F7FA] mt-1 mb-5">Career Readiness Trajectory</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#1B1E27] border border-[#282D38]">
                <span className="text-xs text-[#737B8C]">Today</span>
                <span className="text-base font-bold text-[#F5F7FA]">{currentReadiness}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#1B1E27] border border-[#282D38]">
                <span className="text-xs text-[#A78BFA]">In 1 Month</span>
                <span className="text-base font-bold text-[#A78BFA]">+{readiness1M - currentReadiness}% → {readiness1M}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#1B1E27] border border-[rgba(52,211,153,0.3)]">
                <span className="text-xs text-[#34D399]">In 3 Months</span>
                <span className="text-lg font-bold text-[#34D399]">+{readiness3M - currentReadiness}% → {readiness3M}%</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1B1E27] border border-[rgba(139,92,246,0.25)] text-xs text-[#A7ADBA] leading-relaxed">
            💡 <span className="font-semibold text-[#F5F7FA]">Insight:</span> Devoting {weeklyHours['DSA'] ?? 0} hrs/week to DSA yields highest readiness growth for target backend role.
          </div>
        </div>
      </div>
    </div>
  );
}
