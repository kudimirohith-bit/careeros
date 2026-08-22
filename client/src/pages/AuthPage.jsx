import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AuthPage() {
  const { login, signup, showToast } = useApp();
  const [tab, setTab] = useState('login'); // 'login' | 'signup'

  // Common & Toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Real-time validations
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const passwordCriteria = {
    length: signupPassword.length >= 6,
    hasMatch: signupPassword.length > 0 && signupPassword === signupConfirmPassword,
  };

  // Login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isValidEmail(loginEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      showToast('Welcome back to CareerOS!', 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Signup handler
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!signupName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!isValidEmail(signupEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
      });
      showToast('Account created successfully! Starting onboarding...', 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(forgotEmail)) {
      setForgotMsg('Please enter a valid email address.');
      return;
    }
    setForgotLoading(true);
    setForgotMsg('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset email.');
      setForgotMsg(data.message || 'Reset instructions sent to email!');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotMsg('');
        setForgotEmail('');
      }, 3500);
    } catch (err) {
      setForgotMsg('Error: ' + err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1017] text-[#F5F7FA] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#3B82F6]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#171A22] border border-[#282D38] rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#3B82F6] text-white text-2xl font-black mb-3 shadow-lg shadow-[#8B5CF6]/20">
            ⚡
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">CareerOS</h1>
          <p className="text-xs text-[#737B8C] mt-1">Autonomous Career & Placement Intelligence Platform</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#11131A] p-1 rounded-xl mb-6 border border-[#282D38]">
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === 'login'
                ? 'bg-[#8B5CF6] text-white shadow-md'
                : 'text-[#737B8C] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === 'signup'
                ? 'bg-[#8B5CF6] text-white shadow-md'
                : 'text-[#737B8C] hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
            <span>⚠</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#A7ADBA] mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full px-4 py-2.5 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white placeholder-[#737B8C] focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-[#A7ADBA]">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-[#8B5CF6] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white placeholder-[#737B8C] focus:outline-none focus:border-[#8B5CF6] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#737B8C] hover:text-white"
                >
                  {showPassword ? '👁' : '🙈'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-xs font-bold hover:opacity-95 transition-opacity shadow-lg shadow-[#8B5CF6]/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Log In to CareerOS</span>
              )}
            </button>
          </form>
        )}

        {/* SIGNUP FORM */}
        {tab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Alex Kumar"
                className="w-full px-4 py-2.5 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white placeholder-[#737B8C] focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">Email Address</label>
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="alex@university.edu"
                className="w-full px-4 py-2.5 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white placeholder-[#737B8C] focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white placeholder-[#737B8C] focus:outline-none focus:border-[#8B5CF6] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#737B8C] hover:text-white"
                >
                  {showPassword ? '👁' : '🙈'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7ADBA] mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white placeholder-[#737B8C] focus:outline-none focus:border-[#8B5CF6] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#737B8C] hover:text-white"
                >
                  {showConfirmPassword ? '👁' : '🙈'}
                </button>
              </div>
            </div>

            {/* Validation Micro-Pills */}
            <div className="flex gap-4 pt-1 text-[11px]">
              <span className={passwordCriteria.length ? 'text-[#34D399]' : 'text-[#737B8C]'}>
                {passwordCriteria.length ? '✓' : '○'} Min 6 chars
              </span>
              <span className={passwordCriteria.hasMatch ? 'text-[#34D399]' : 'text-[#737B8C]'}>
                {passwordCriteria.hasMatch ? '✓' : '○'} Passwords match
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-xs font-bold hover:opacity-95 transition-opacity shadow-lg shadow-[#8B5CF6]/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-3"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account & Initializing...</span>
                </>
              ) : (
                <span>Create Account & Start Onboarding</span>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#171A22] border border-[#282D38] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Reset Password</h3>
            <p className="text-xs text-[#737B8C] mb-4">Enter your account email to receive reset instructions.</p>

            {forgotMsg && (
              <div className="mb-3 p-2.5 rounded-lg bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] text-xs">
                {forgotMsg}
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full px-3.5 py-2 rounded-xl bg-[#11131A] border border-[#282D38] text-xs text-white placeholder-[#737B8C] focus:outline-none focus:border-[#8B5CF6]"
              />
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForgotModal(false); setForgotMsg(''); }}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#737B8C] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-1.5 rounded-lg bg-[#8B5CF6] text-white text-xs font-semibold disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
