import { useState } from 'react';
import { useApp } from '../context/AppContext';

/* ── Circular Progress Ring Component ───────────────────────────── */
function CircularProgress({ value, color = '#34D399', size = 48, strokeWidth = 4 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1B1E27"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span className="absolute text-xs font-black text-[#F5F7FA]">{value}%</span>
    </div>
  );
}

/* ── Default Role Requirements ─────────────────────────────────── */
const ROLE_DEFINITIONS = [
  {
    id: 'backend',
    name: 'Backend Developer',
    icon: '💻',
    color: '#8B5CF6',
    requirements: {
      'Node.js': 80,
      DSA: 85,
      'System Design': 75,
      APIs: 80,
      SQL: 70,
    },
  },
  {
    id: 'frontend',
    name: 'Frontend Developer',
    icon: '🌐',
    color: '#3B82F6',
    requirements: {
      React: 85,
      JavaScript: 85,
      'HTML/CSS': 80,
      APIs: 70,
    },
  },
  {
    id: 'data_analyst',
    name: 'Data Analyst',
    icon: '📊',
    color: '#34D399',
    requirements: {
      Python: 80,
      SQL: 85,
      'Data Viz': 75,
      Analytics: 70,
    },
  },
  {
    id: 'ai_engineer',
    name: 'AI Engineer',
    icon: '🤖',
    color: '#FBBF24',
    requirements: {
      Python: 90,
      'Machine Learning': 85,
      DSA: 80,
      APIs: 75,
    },
  },
];

export default function WhatIfSimulator() {
  const { student } = useApp();

  // Initial skill levels state
  const [skillLevels, setSkillLevels] = useState(() => {
    const userSkills = student?.skills ?? [];
    const baseMap = {
      DSA: 0,
      'Node.js': 0,
      'System Design': 0,
      React: 65,
      JavaScript: 62,
      Python: 30,
      SQL: 45,
      APIs: 0,
      'HTML/CSS': 35,
      'Machine Learning': 20,
    };
    userSkills.forEach((s) => {
      baseMap[s.name] = s.current;
    });
    return baseMap;
  });

  // Tab switcher for additional content
  const [activeTab, setActiveTab] = useState('suitability'); // 'suitability' | 'forecast'

  // Weekly study hours state for forecast section
  const [weeklyHours, setWeeklyHours] = useState({
    DSA: 5,
    'System Design': 3,
    'Node.js': 4,
    React: 2,
    Python: 3,
    SQL: 2,
  });

  const handleSkillChange = (skillName, val) => {
    setSkillLevels((prev) => ({ ...prev, [skillName]: parseInt(val, 10) }));
  };

  // Compute suitability per role
  const roleScores = ROLE_DEFINITIONS.map((role) => {
    let totalReq = 0;
    let totalObtained = 0;
    const gaps = [];

    Object.entries(role.requirements).forEach(([skillName, reqVal]) => {
      totalReq += reqVal;
      const curVal = skillLevels[skillName] ?? 0;
      totalObtained += Math.min(reqVal, curVal);

      if (curVal < reqVal) {
        gaps.push({
          skill: skillName,
          needed: reqVal - curVal,
        });
      }
    });

    const percentage = Math.min(100, Math.round((totalObtained / totalReq) * 100));

    return {
      ...role,
      suitability: percentage,
      gaps: gaps.sort((a, b) => b.needed - a.needed),
    };
  });

  // Best role match
  const bestRole = [...roleScores].sort((a, b) => b.suitability - a.suitability)[0];

  // Helper color for percentage text
  const getPercentColor = (val) => {
    if (val === 0) return '#F87171';
    if (val <= 35) return '#F87171';
    if (val <= 70) return '#FBBF24';
    return '#34D399';
  };

  // Study hours forecast logic
  const totalWeeklyHours = Object.values(weeklyHours).reduce((a, b) => a + b, 0);
  const predictSkillBoost = (current, hours, months) => Math.min(100, current + Math.round(hours * 0.8 * months));

  const currentReadiness = student?.careerReadiness ?? 60;
  const readiness1M = Math.min(100, currentReadiness + Math.round(totalWeeklyHours * 0.4));
  const readiness3M = Math.min(100, currentReadiness + Math.round(totalWeeklyHours * 1.1));

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] flex items-center gap-2">
            <span>📊</span> What-If Simulator
          </h1>
          <p className="text-xs text-[#737B8C] mt-1">
            Drag your skill sliders and instantly see your suitability across multiple roles.
          </p>
        </div>

        <div className="flex bg-[#11131A] p-1 rounded-xl border border-[#282D38] self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('suitability')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'suitability'
                ? 'bg-[#8B5CF6] text-white shadow-md'
                : 'text-[#737B8C] hover:text-white'
            }`}
          >
            Role Suitability
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('forecast')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'forecast'
                ? 'bg-[#8B5CF6] text-white shadow-md'
                : 'text-[#737B8C] hover:text-white'
            }`}
          >
            Study Allocation Forecast
          </button>
        </div>
      </div>

      {activeTab === 'suitability' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT PANEL: SKILL LEVELS (5 cols) */}
          <div className="lg:col-span-5 card p-5 bg-[#171A22] border border-[#282D38] rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#282D38] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#8B5CF6] font-bold text-sm">📊</span>
                  <h2 className="text-xs font-extrabold tracking-wider uppercase text-[#F5F7FA]">SKILL LEVELS</h2>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30">
                  Drag to simulate
                </span>
              </div>

              {/* Sliders list */}
              <div className="space-y-4">
                {Object.entries(skillLevels).map(([skillName, val]) => {
                  const percentColor = getPercentColor(val);
                  return (
                    <div key={skillName} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#A7ADBA]">{skillName}</span>
                        <span className="font-bold text-xs" style={{ color: percentColor }}>
                          {val}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={val}
                        onChange={(e) => handleSkillChange(skillName, e.target.value)}
                        className="w-full h-2 bg-[#11131A] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: BEST MATCH & ROLE CARDS & AI INSIGHT (7 cols) */}
          <div className="lg:col-span-7 space-y-5 flex flex-col">
            {/* BEST ROLE MATCH HERO CARD */}
            <div className="card p-5 bg-gradient-to-r from-[#171A22] via-[#1B1E27] to-[#171A22] border border-[#34D399]/30 rounded-2xl flex items-center justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#34D399]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-1 z-10">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#34D399] tracking-wider uppercase">🏆 BEST ROLE MATCH</span>
                </div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <span>{bestRole.icon}</span>
                  <span>{bestRole.name}</span>
                </h3>
                <p className="text-xs text-[#34D399] font-medium">
                  {bestRole.suitability}% suitability based on current skills
                </p>
              </div>

              <div className="z-10">
                <CircularProgress value={bestRole.suitability} color="#34D399" size={64} strokeWidth={6} />
              </div>
            </div>

            {/* 2x2 GRID OF ROLE CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              {roleScores.map((role) => {
                const isBest = role.id === bestRole.id;
                const strokeColor = isBest ? '#34D399' : role.suitability >= 40 ? '#FBBF24' : '#8B5CF6';

                return (
                  <div
                    key={role.id}
                    className={`card p-4 rounded-2xl bg-[#171A22] border transition-all flex flex-col justify-between ${
                      isBest ? 'border-[#34D399]/50 shadow-lg shadow-[#34D399]/10' : 'border-[#282D38]'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1">
                          <span className="text-xl">{role.icon}</span>
                          <h4 className="text-xs font-bold text-[#F5F7FA]">{role.name}</h4>
                          {isBest && (
                            <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 rounded bg-[#34D399]/20 text-[#34D399] tracking-wider uppercase border border-[#34D399]/40">
                              BEST MATCH
                            </span>
                          )}
                        </div>

                        <CircularProgress value={role.suitability} color={strokeColor} size={44} strokeWidth={4} />
                      </div>

                      {/* Suitability Bar */}
                      <div className="h-1.5 w-full bg-[#11131A] rounded-full overflow-hidden mb-4">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${role.suitability}%`, background: strokeColor }}
                        />
                      </div>

                      {/* Needed Skills Breakdown */}
                      <div className="space-y-1.5 pt-1 border-t border-[#282D38]">
                        {role.gaps.slice(0, 2).map((g) => (
                          <div key={g.skill} className="flex justify-between items-center text-[10px]">
                            <span className="text-[#A7ADBA] font-medium">{g.skill}</span>
                            <span className="text-[#F87171] font-bold">+{g.needed}% needed</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI INSIGHT CARD */}
            <div className="card p-4 rounded-2xl bg-[#1B1E27] border border-[#8B5CF6]/30 flex items-start gap-3 shadow-lg">
              <span className="text-xl p-2 rounded-xl bg-[#8B5CF6]/20 flex-shrink-0">🤖</span>
              <div className="text-xs text-[#A7ADBA] leading-relaxed">
                <span className="font-bold text-[#F5F7FA]">AI Insight:</span> Boosting your{' '}
                <span className="text-[#34D399] font-bold">
                  {bestRole.gaps[0]?.skill ?? 'Python'}
                </span>{' '}
                &{' '}
                <span className="text-[#34D399] font-bold">
                  {bestRole.gaps[1]?.skill ?? 'SQL'}
                </span>{' '}
                skills will have the biggest impact on your{' '}
                <span className="text-[#F5F7FA] font-bold">{bestRole.name}</span> suitability.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORECAST TAB (RETAINED PREVIOUS CONTENT) */}
      {activeTab === 'forecast' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 card p-6 space-y-6 bg-[#171A22] border border-[#282D38] rounded-2xl">
            <div className="flex items-center justify-between border-b border-[#282D38] pb-3">
              <h2 className="text-base font-bold text-[#F5F7FA]">Weekly Learning Allocation</h2>
              <span className="text-xs font-semibold px-3 py-1 rounded-md bg-[rgba(139,92,246,0.12)] text-[#A78BFA] border border-[rgba(139,92,246,0.25)]">
                Total: {totalWeeklyHours} hrs/week
              </span>
            </div>

            <div className="space-y-5">
              {Object.entries(weeklyHours).map(([sName, hours]) => {
                const cur = skillLevels[sName] ?? 50;
                const projected3M = predictSkillBoost(cur, hours, 3);

                return (
                  <div key={sName} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-[#F5F7FA] font-semibold">{sName}</span>
                      <span className="text-[#A78BFA] font-bold">{hours} hrs/week</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={15}
                      value={hours}
                      onChange={(e) =>
                        setWeeklyHours({ ...weeklyHours, [sName]: parseInt(e.target.value, 10) })
                      }
                      className="w-full h-1.5 bg-[#11131A] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
                    />
                    <div className="flex justify-between text-[11px] text-[#737B8C]">
                      <span>Current: {cur}%</span>
                      <span className="text-[#34D399] font-semibold">3-Month Forecast: {projected3M}%</span>
                      <span>Target: 85%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-6 flex flex-col justify-between space-y-6 bg-[#171A22] border border-[#282D38] rounded-2xl">
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
                  <span className="text-base font-bold text-[#A78BFA]">
                    +{readiness1M - currentReadiness}% → {readiness1M}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#1B1E27] border border-[rgba(52,211,153,0.3)]">
                  <span className="text-xs text-[#34D399]">In 3 Months</span>
                  <span className="text-lg font-bold text-[#34D399]">
                    +{readiness3M - currentReadiness}% → {readiness3M}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1B1E27] border border-[rgba(139,92,246,0.25)] text-xs text-[#A7ADBA] leading-relaxed">
              💡 <span className="font-semibold text-[#F5F7FA]">Insight:</span> Devoting {weeklyHours['DSA'] ?? 0} hrs/week to DSA yields highest readiness growth for target backend role.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

