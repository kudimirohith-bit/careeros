import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Onboarding() {
  const { finishOnboarding, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [aiStepNotice, setAiStepNotice] = useState('');

  // Form State
  const [degree, setDegree] = useState('B.Tech Computer Science');
  const [gradYear, setGradYear] = useState('2026');
  const [location, setLocation] = useState('Bangalore, India');
  const [experienceLevel, setExperienceLevel] = useState('Entry Level (0-2 Yrs)');

  const [targetRole, setTargetRole] = useState('Backend Engineer');
  const [industry, setIndustry] = useState('Fintech & Cloud Systems');
  const [preferredCompanies, setPreferredCompanies] = useState('Google, Stripe, Razorpay');
  const [careerGoal, setCareerGoal] = useState('Land a high-impact software engineering role at a tier-1 technology company.');

  const [hoursPerWeek, setHoursPerWeek] = useState(15);
  const [learningStyle, setLearningStyle] = useState('Hands-on Projects & Coding');
  const [targetTimeframe, setTargetTimeframe] = useState('6 Months');

  const [githubUsername, setGithubUsername] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  const handleFinishSetup = async () => {
    const hasAnyLink = githubUsername.trim() || linkedinUrl.trim() || portfolioUrl.trim();

    if (!hasAnyLink) {
      const confirmProceed = window.confirm(
        'You have not entered a GitHub username or social link.\n\nWithout social links, Gemini AI cannot inspect your code repositories to assess your actual skill levels. Would you like to proceed with baseline setup and add your GitHub link later in Evidence Hub?'
      );
      if (!confirmProceed) return;
    }

    setSubmitting(true);
    setAiStepNotice('Saving profile to MongoDB...');

    setTimeout(async () => {
      setAiStepNotice(
        hasAnyLink
          ? 'Fetching public GitHub repositories & activity signals...'
          : 'Initializing baseline career diagnostic engine...'
      );
      setTimeout(async () => {
        setAiStepNotice(
          hasAnyLink
            ? 'Gemini AI analyzing repository code & calculating skill scores...'
            : 'Gemini AI constructing initial study roadmap...'
        );
        try {
          await finishOnboarding({
            education: { degree, gradYear },
            experienceLevel,
            targetRole,
            industry,
            preferredCompanies: preferredCompanies.split(',').map((s) => s.trim()).filter(Boolean),
            location,
            careerGoal,
            hoursPerWeek,
            learningStyle,
            targetTimeframe,
            githubUsername,
            linkedinUrl,
            portfolioUrl,
          });
          showToast(
            hasAnyLink
              ? 'AI skill assessment complete! Welcome to your CareerOS Dashboard.'
              : 'Onboarding complete! Add your GitHub profile in Evidence Hub anytime for full AI code analysis.',
            'success'
          );
        } catch (err) {
          showToast(err.message || 'Error saving onboarding profile.', 'error');
        } finally {
          setSubmitting(false);
        }
      }, 1200);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0E1017] text-[#F5F7FA] flex items-center justify-center p-4 relative">
      <div className="w-full max-w-2xl bg-[#171A22] border border-[#282D38] rounded-3xl p-8 shadow-2xl relative">
        {/* Progress Bar & Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B5CF6]">
              Step {step} of 3 — Setup Profile & AI Assessment
            </span>
            <span className="text-xs text-[#737B8C] font-semibold">{Math.round((step / 3) * 100)}% Completed</span>
          </div>
          <div className="w-full h-2 bg-[#11131A] rounded-full overflow-hidden border border-[#282D38]">
            <div
              className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {submitting ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-[#8B5CF6]/30 border-t-[#8B5CF6] rounded-full animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-white">Running AI Skill Assessment & Repository Analysis</h3>
            <p className="text-xs text-[#34D399] font-semibold animate-pulse">{aiStepNotice}</p>
          </div>
        ) : (
          <>
            {/* STEP 1: Background & Education */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-1">Education & Background</h2>
                <p className="text-xs text-[#737B8C] mb-4">Let us understand your foundation.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">Degree / Specialization</label>
                    <input
                      type="text"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">Graduation Year</label>
                    <input
                      type="text"
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">Experience Level</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                    >
                      <option>Student / Internship</option>
                      <option>Entry Level (0-2 Yrs)</option>
                      <option>Mid Level (2-5 Yrs)</option>
                      <option>Senior / Experienced</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Target & Preferences */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-1">Career Goal & Learning Schedule</h2>
                <p className="text-xs text-[#737B8C] mb-4">Define your target role and study availability.</p>

                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">Target Job Role</label>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Backend Engineer, Full Stack Dev"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">Target Industry</label>
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">Preferred Target Companies (Comma separated)</label>
                    <input
                      type="text"
                      value={preferredCompanies}
                      onChange={(e) => setPreferredCompanies(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">Primary Career Goal</label>
                    <textarea
                      rows={2}
                      value={careerGoal}
                      onChange={(e) => setCareerGoal(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#A7ADBA] mb-1">Weekly Learning Hours</label>
                      <input
                        type="number"
                        value={hoursPerWeek}
                        onChange={(e) => setHoursPerWeek(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#A7ADBA] mb-1">Learning Style</label>
                      <select
                        value={learningStyle}
                        onChange={(e) => setLearningStyle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white"
                      >
                        <option>Hands-on Projects & Coding</option>
                        <option>Structured Video Courses</option>
                        <option>Reading Documentation & Books</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#A7ADBA] mb-1">Target Timeframe</label>
                      <select
                        value={targetTimeframe}
                        onChange={(e) => setTargetTimeframe(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white"
                      >
                        <option>3 Months</option>
                        <option>6 Months</option>
                        <option>12 Months</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Social Links for Autonomous AI Skill Assessment */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-1">Social & Code Profiles for AI Analysis</h2>
                <p className="text-xs text-[#737B8C] mb-3">
                  Provide your GitHub username or portfolio link. Gemini AI fetches your public repositories, code languages, and project history to evaluate your actual skill scores.
                </p>

                {/* AI Assessment Info Pill */}
                <div className="p-3.5 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-start gap-3">
                  <span className="text-xl">🤖</span>
                  <div className="text-xs leading-relaxed text-[#A78BFA]">
                    <strong className="font-bold text-white">How Gemini AI Assesses Your Skills:</strong> Providing a GitHub username allows Gemini AI to analyze your repositories, commit activity, and programming languages to calculate genuine skill proficiency levels.
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">
                      GitHub Username / Profile <span className="text-[#8B5CF6] font-bold">(Recommended for AI Code Analysis)</span>
                    </label>
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="e.g. torvalds or https://github.com/username"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white placeholder-[#737B8C] focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">LinkedIn Profile URL</label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white placeholder-[#737B8C] focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">Portfolio / Website Link</label>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yourportfolio.dev"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white placeholder-[#737B8C] focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Nav Buttons */}
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-[#282D38]">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#11131A] border border-[#282D38] text-[#A7ADBA] hover:text-white"
                >
                  Back
                </button>
              ) : <div />}

              <div className="flex gap-3">
                {step < 3 && (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors"
                  >
                    Save & Continue
                  </button>
                )}

                {step === 3 && (
                  <button
                    type="button"
                    onClick={handleFinishSetup}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-lg shadow-[#8B5CF6]/30 hover:opacity-95 transition-opacity"
                  >
                    🚀 Run AI Assessment & Finish Setup
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
