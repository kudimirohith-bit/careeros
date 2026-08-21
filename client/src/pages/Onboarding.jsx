import { useState } from 'react';
import { api } from '../api/api';
import { useApp } from '../context/AppContext';

/* ─── Data ─────────────────────────────────────────────────────────── */

const ROLE_SKILLS = {
  'Backend Developer': [
    { name: 'DSA', current: 0, target: 75 },
    { name: 'Backend', current: 0, target: 80 },
    { name: 'DBMS', current: 0, target: 75 },
    { name: 'System Design', current: 0, target: 65 },
    { name: 'Testing', current: 0, target: 70 },
    { name: 'Communication', current: 0, target: 70 },
    { name: 'Interview', current: 0, target: 65 },
    { name: 'Aptitude', current: 0, target: 70 },
  ],
  'Data Analyst': [
    { name: 'Python', current: 0, target: 75 },
    { name: 'SQL', current: 0, target: 80 },
    { name: 'Statistics', current: 0, target: 70 },
    { name: 'Data Viz', current: 0, target: 70 },
    { name: 'Communication', current: 0, target: 75 },
    { name: 'Aptitude', current: 0, target: 70 },
  ],
  'AI Engineer': [
    { name: 'Python', current: 0, target: 80 },
    { name: 'ML', current: 0, target: 75 },
    { name: 'DSA', current: 0, target: 70 },
    { name: 'Mathematics', current: 0, target: 75 },
    { name: 'Communication', current: 0, target: 70 },
    { name: 'Interview', current: 0, target: 65 },
  ],
  'Frontend Developer': [
    { name: 'JavaScript', current: 0, target: 80 },
    { name: 'React', current: 0, target: 75 },
    { name: 'DSA', current: 0, target: 65 },
    { name: 'UI/UX', current: 0, target: 70 },
    { name: 'Communication', current: 0, target: 70 },
    { name: 'Interview', current: 0, target: 65 },
  ],
};

const ROLES = [
  {
    id: 'backend',
    emoji: '🖥️',
    label: 'Backend Developer',
    desc: 'Build APIs, services, and server-side systems that power applications at scale.',
    tags: ['Node.js', 'Databases', 'System Design'],
  },
  {
    id: 'data-analyst',
    emoji: '📊',
    label: 'Data Analyst',
    desc: 'Turn raw data into insights using SQL, Python, and powerful visualisation tools.',
    tags: ['Python', 'SQL', 'Data Viz'],
  },
  {
    id: 'ai-engineer',
    emoji: '🤖',
    label: 'AI Engineer',
    desc: 'Design and deploy machine learning models and intelligent systems end-to-end.',
    tags: ['Python', 'ML', 'Deep Learning'],
  },
  {
    id: 'frontend',
    emoji: '🌐',
    label: 'Frontend Developer',
    desc: 'Craft pixel-perfect, performant UIs using modern JavaScript frameworks and design systems.',
    tags: ['React', 'JavaScript', 'UI/UX'],
  },
];

/* ─── Step indicator ─────────────────────────────────────────────── */

function StepDots({ step, totalSteps = 4 }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className="rounded-full transition-all duration-300"
            style={{
              width: step >= s ? 28 : 10,
              height: 10,
              background: step >= s ? '#8B5CF6' : '#282D38',
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Step 1 — Career Goal ────────────────────────────────────────── */

function StepGoal({ name, setName, selected, onSelect, onNext }) {
  const canContinue = selected && name && name.trim() !== '';

  return (
    <div className="w-full max-w-2xl mx-auto animate-fadein">
      <p className="text-[#A78BFA] text-xs font-semibold uppercase tracking-wider mb-1">Step 1 of 4</p>
      <h2 className="text-3xl font-bold text-[#F5F7FA] mb-2">Create your profile</h2>
      <p className="text-[#A7ADBA] text-sm mb-6">Enter your details and choose your target role to get started.</p>

      {/* Name Input */}
      <div className="p-5 rounded-2xl border border-[#282D38] bg-[#171A22] mb-6">
        <label className="block text-sm font-semibold text-[#F5F7FA] mb-2">
          What is your name?
        </label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl text-sm bg-[#1B1E27] border border-[#282D38] text-[#F5F7FA] placeholder-[#737B8C] focus:border-[#8B5CF6] focus:outline-none transition-colors"
        />
      </div>

      <p className="text-[#A7ADBA] text-sm mb-4">What's your career goal? We'll personalise your learning path around this role.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {ROLES.map((role) => {
          const isSelected = selected?.id === role.id;
          return (
            <button
              key={role.id}
              id={`goal-card-${role.id}`}
              onClick={() => onSelect(role)}
              className="text-left p-5 rounded-2xl border transition-all duration-200"
              style={{
                background: isSelected ? 'rgba(139, 92, 246, 0.12)' : '#171A22',
                borderColor: isSelected ? '#8B5CF6' : '#282D38',
                boxShadow: isSelected ? '0 0 15px rgba(139, 92, 246, 0.15)' : 'none',
              }}
            >
              <div className="text-3xl mb-3">{role.emoji}</div>
              <div className="font-bold text-[#F5F7FA] text-base mb-1">{role.label}</div>
              <p className="text-[#A7ADBA] text-xs leading-relaxed mb-3">{role.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {role.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded-md font-medium"
                    style={{
                      background: isSelected ? 'rgba(139, 92, 246, 0.2)' : '#1B1E27',
                      color: isSelected ? '#A78BFA' : '#737B8C',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <button
        id="goal-next-btn"
        disabled={!canContinue}
        onClick={onNext}
        className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200"
        style={{
          background: canContinue ? '#8B5CF6' : '#282D38',
          cursor: canContinue ? 'pointer' : 'not-allowed',
        }}
      >
        Continue →
      </button>
    </div>
  );
}

/* ─── Step 2 — Skills Preview ─────────────────────────────────────── */

function SkillPill({ name, index }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border"
      style={{
        background: 'rgba(139, 92, 246, 0.12)',
        borderColor: 'rgba(139, 92, 246, 0.25)',
        color: '#A78BFA',
        animation: `skillPop 0.4s ease both`,
        animationDelay: `${index * 60}ms`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] inline-block" />
      {name}
    </span>
  );
}

function StepSkills({ role, onNext, onBack }) {
  const roleSkills = ROLE_SKILLS[role.label] || [];

  return (
    <div className="w-full max-w-xl mx-auto animate-fadein">
      <p className="text-[#A78BFA] text-xs font-semibold uppercase tracking-wider mb-1">Step 2 of 4</p>
      <h2 className="text-3xl font-bold text-[#F5F7FA] mb-2">Skills we'll track</h2>
      <p className="text-[#A7ADBA] text-sm mb-8">
        For <span className="font-semibold text-[#A78BFA]">{role.label}</span>, we'll assess your current level across these areas:
      </p>

      <div className="p-6 rounded-2xl mb-8 bg-[#171A22] border border-[#282D38]">
        <div className="flex flex-wrap gap-2.5">
          {roleSkills.map((s, i) => (
            <SkillPill key={s.name} name={s.name} index={i} />
          ))}
        </div>
      </div>

      <p className="text-xs text-[#737B8C] text-center mb-6">
        🧠 We'll assess your current level for each of these via short tests &amp; your portfolio.
      </p>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-semibold text-[#F5F7FA] border border-[#282D38] bg-[#171A22] hover:bg-[#1B1E27] transition-colors"
        >
          ← Back
        </button>
        <button
          id="skills-next-btn"
          onClick={onNext}
          className="flex-[2] py-3.5 rounded-xl font-semibold text-white bg-[#8B5CF6] transition-all duration-200"
        >
          Looks good →
        </button>
      </div>
    </div>
  );
}

/* ─── Step 3 — Link Profile Links ─────────────────────────────────── */

function StepProfileLinks({ onAnalyze, onBack, analyzing, error }) {
  const [links, setLinks] = useState({ github: '', leetcode: '', linkedin: '' });

  const hasAnyLink = Object.values(links).some((v) => v.trim());

  return (
    <div className="w-full max-w-xl mx-auto animate-fadein">
      <p className="text-[#A78BFA] text-xs font-semibold uppercase tracking-wider mb-1">Step 3 of 4</p>
      <h2 className="text-3xl font-bold text-[#F5F7FA] mb-2">Link your profiles</h2>
      <p className="text-[#A7ADBA] text-sm mb-8">
        Paste your profile URLs so our AI can analyze your skills. (At least one required)
      </p>

      <div className="space-y-4 mb-6">
        {[
          { key: 'github', emoji: '🐙', label: 'GitHub', placeholder: 'https://github.com/username' },
          { key: 'leetcode', emoji: '💻', label: 'LeetCode', placeholder: 'https://leetcode.com/username' },
          { key: 'linkedin', emoji: '💼', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
        ].map(({ key, emoji, label, placeholder }) => (
          <div key={key} className="p-4 rounded-xl border border-[#282D38] bg-[#171A22]">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#F5F7FA] mb-2">
              <span>{emoji}</span> {label}
            </label>
            <input
              type="url"
              placeholder={placeholder}
              value={links[key]}
              onChange={(e) => setLinks((prev) => ({ ...prev, [key]: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm bg-[#1B1E27] border border-[#282D38] text-[#F5F7FA] placeholder-[#737B8C] focus:border-[#8B5CF6] focus:outline-none transition-colors"
            />
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          ⚠️ {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-semibold text-[#F5F7FA] border border-[#282D38] bg-[#171A22] hover:bg-[#1B1E27] transition-colors"
        >
          ← Back
        </button>
        <button
          disabled={!hasAnyLink || analyzing}
          onClick={() => {
            const profileLinks = Object.entries(links)
              .filter(([, v]) => v.trim())
              .map(([platform, url]) => ({ platform, url: url.trim() }));
            onAnalyze(profileLinks);
          }}
          className="flex-[2] py-3.5 rounded-xl font-semibold text-white bg-[#8B5CF6] transition-all duration-200 flex items-center justify-center gap-2"
          style={{ opacity: !hasAnyLink || analyzing ? 0.6 : 1, cursor: !hasAnyLink || analyzing ? 'not-allowed' : 'pointer' }}
        >
          {analyzing ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing with AI…
            </>
          ) : (
            'Analyze Profiles →'
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Step 4 — Choose Career Path ─────────────────────────────────── */

function StepCareerPaths({ analysis, onSelect, onBack }) {
  const [picked, setPicked] = useState(null);

  return (
    <div className="w-full max-w-2xl mx-auto animate-fadein">
      <p className="text-[#A78BFA] text-xs font-semibold uppercase tracking-wider mb-1">Step 4 of 4</p>
      <h2 className="text-3xl font-bold text-[#F5F7FA] mb-2">Choose your path</h2>
      <p className="text-[#A7ADBA] text-sm mb-2">{analysis.profileSummary}</p>
      <p className="text-xs text-[#737B8C] mb-6">
        Level: <span className="text-[#A78BFA] font-semibold">{analysis.experienceLevel}</span> ·
        Strengths: {analysis.strengthAreas.join(', ')}
      </p>

      <div className="space-y-3 mb-6">
        {analysis.careerPaths.map((path) => {
          const isSelected = picked?.id === path.id;
          return (
            <button
              key={path.id}
              onClick={() => setPicked(path)}
              className="w-full text-left p-5 rounded-2xl border transition-all duration-200"
              style={{
                background: isSelected ? 'rgba(139, 92, 246, 0.12)' : '#171A22',
                borderColor: isSelected ? '#8B5CF6' : '#282D38',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[#F5F7FA]">{path.title}</span>
                <span className="text-xs font-bold text-[#34D399] bg-[rgba(52,211,153,0.1)] px-2 py-0.5 rounded-full">
                  {path.match}% match
                </span>
              </div>
              <p className="text-xs text-[#A7ADBA] mb-2">{path.rationale}</p>
              <div className="flex flex-wrap gap-1.5">
                {path.keyFocusAreas.map((area) => (
                  <span key={area} className="text-[10px] px-2 py-0.5 rounded-md bg-[#1B1E27] text-[#737B8C] border border-[#282D38]">
                    {area}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-semibold text-[#F5F7FA] border border-[#282D38] bg-[#171A22]"
        >
          ← Back
        </button>
        <button
          disabled={!picked}
          onClick={() => onSelect(picked)}
          className="flex-[2] py-3.5 rounded-xl font-semibold text-white bg-[#8B5CF6]"
          style={{ opacity: picked ? 1 : 0.5, cursor: picked ? 'pointer' : 'not-allowed' }}
        >
          Start with this path →
        </button>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const { setStudent, setCurrentPage, setProfileAnalysis, setSelectedPath } = useApp();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [role, setRole] = useState(null);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async (profileLinks) => {
    setAnalyzing(true);
    setError('');
    try {
      // Create student first if not exists, to get studentId
      const selectedRole = role?.label || 'Backend Developer';
      const skills = ROLE_SKILLS[selectedRole] || ROLE_SKILLS['Backend Developer'];
      let student = await api.createStudent({
        name: name.trim() || 'Alex Kumar',
        targetRole: selectedRole,
        skills,
      });
      const result = await api.analyzeProfiles(student._id, profileLinks);
      if (result.error) throw new Error(result.error);
      setAnalysis(result);
      setProfileAnalysis(result);
      setStudent(student);
      setStep(4);
    } catch (err) {
      setError(err.message || 'AI analysis failed. Check your API key.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePathSelect = async (path) => {
    setSaving(true);
    setError('');
    try {
      setSelectedPath(path);
      // Generate AI plan
      const student = await api.getStudent();
      const planResult = await api.generatePlan({
        studentId: student._id,
        selectedPath: path,
        profileAnalysis: analysis,
        preferences: { hoursPerDay: 2 },
      });
      if (planResult.error) throw new Error(planResult.error);
      await api.completeOnboarding(student._id, { targetRole: path.title });
      const updatedStudent = await api.getStudent();
      setStudent(updatedStudent);
      setCurrentPage('dashboard');
    } catch (err) {
      setError(err.message || 'Plan generation failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes skillPop {
          from { opacity: 0; transform: scale(0.75) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein { animation: fadein 0.35s ease both; }
      `}</style>

      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-[#0F1117]">
        {/* Brand mark */}
        <div className="mb-10 flex items-center gap-2">
          <span className="flex items-center justify-center rounded-xl text-white text-lg font-bold w-10 h-10 bg-[#8B5CF6]">
            ⚡
          </span>
          <span className="text-2xl font-bold text-[#F5F7FA]">
            Career <span className="text-[#8B5CF6]">OS</span>
          </span>
        </div>

        {/* Step dots */}
        <StepDots step={step} totalSteps={4} />

        {/* Error */}
        {error && (
          <div className="w-full max-w-xl mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            ⚠️ {error}
          </div>
        )}

        {/* Step content */}
        {step === 1 && (
          <StepGoal
            name={name}
            setName={setName}
            selected={role}
            onSelect={setRole}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StepSkills
            role={role}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepProfileLinks
            onAnalyze={handleAnalyze}
            onBack={() => setStep(2)}
            analyzing={analyzing}
            error={error}
          />
        )}
        {step === 4 && analysis && (
          <StepCareerPaths
            analysis={analysis}
            onSelect={handlePathSelect}
            onBack={() => setStep(3)}
          />
        )}
      </div>
    </>
  );
}
