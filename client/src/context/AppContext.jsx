import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../api/api';
import { setAiStatusHandler } from '../utils/ai';

const AppContext = createContext(null);

const LS_KEY = 'careeros_student';
const TOKEN_KEY = 'careeros_token';
const TIMELINE_KEY = 'careeros_timeline';

function readLocalStudent() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeLocalStudent(student) {
  try {
    if (student) localStorage.setItem(LS_KEY, JSON.stringify(student));
    else         localStorage.removeItem(LS_KEY);
  } catch { /* ignore quota errors */ }
}

export function recordTimelineEvent(title, type = 'activity', details = '') {
  try {
    const raw = localStorage.getItem(TIMELINE_KEY);
    const timeline = raw ? JSON.parse(raw) : [];
    const newEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      type,
      details,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    timeline.unshift(newEvent);
    localStorage.setItem(TIMELINE_KEY, JSON.stringify(timeline.slice(0, 30)));
  } catch (e) {
    console.error('Failed to record timeline event:', e);
  }
}

export const NAV_PAGES = [
  { id: 'dashboard',      label: 'Dashboard' },
  { id: 'evidence-hub',   label: 'Evidence Hub' },
  { id: 'career-twin',    label: 'Career Twin' },
  { id: 'learning-plan',  label: 'Learning Plan' },
  { id: 'practice',       label: 'Practice & Tests' },
  { id: 'mock-interview', label: 'Mock Interview' },
  { id: 'simulator',      label: 'What-If Simulator' },
  { id: 'progress',       label: 'Progress' },
];

export function AppProvider({ children }) {
  const savedStudent = readLocalStudent();

  const [student,         _setStudent]        = useState(savedStudent);
  const [authMode,        setAuthMode]        = useState(savedStudent ? (savedStudent.onboardingCompleted ? 'app' : 'onboarding') : 'auth');
  const [currentPage,     setCurrentPage]     = useState('dashboard');
  const [toast,           setToast]           = useState(null);
  const [profileAnalysis, setProfileAnalysis] = useState(null);
  const [selectedPath,    setSelectedPath]    = useState(null);
  const [aiOnline,        setAiOnline]        = useState(true);
  const [loadingSession,  setLoadingSession]  = useState(true);

  // Hook up global AI status handler
  useEffect(() => {
    setAiStatusHandler(setAiOnline);
  }, []);

  // Restore authenticated session on mount
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const res = await api.getMe();
          if (res?.user) {
            _setStudent(res.user);
            writeLocalStudent(res.user);
            setAuthMode(res.user.onboardingCompleted ? 'app' : 'onboarding');
          }
        } catch (err) {
          console.warn('Session verification failed, falling back to local state:', err.message);
        }
      }
      setLoadingSession(false);
    }
    restoreSession();
  }, []);

  // Wrapped setter keeping local storage in sync
  const setStudent = useCallback((studentOrUpdater) => {
    _setStudent((prev) => {
      const next = typeof studentOrUpdater === 'function'
        ? studentOrUpdater(prev)
        : studentOrUpdater;
      writeLocalStudent(next);
      return next;
    });
  }, []);

  // Login handler
  const login = useCallback(async (email, password) => {
    const res = await api.login({ email, password });
    if (res?.token && res?.user) {
      localStorage.setItem(TOKEN_KEY, res.token);
      _setStudent(res.user);
      writeLocalStudent(res.user);
      const nextMode = res.user.onboardingCompleted ? 'app' : 'onboarding';
      setAuthMode(nextMode);
      recordTimelineEvent(`User logged in`, 'auth');
      return res;
    }
    throw new Error(res.error || 'Login failed');
  }, []);

  // Signup handler
  const signup = useCallback(async (formData) => {
    const res = await api.signup(formData);
    if (res?.token && res?.user) {
      localStorage.setItem(TOKEN_KEY, res.token);
      _setStudent(res.user);
      writeLocalStudent(res.user);
      setAuthMode('onboarding');
      recordTimelineEvent(`New account created`, 'auth');
      return res;
    }
    throw new Error(res.error || 'Signup failed');
  }, []);

  // Complete onboarding handler
  const finishOnboarding = useCallback(async (onboardingData) => {
    try {
      const res = await api.completeOnboarding(onboardingData);
      const updatedUser = res.user || { ...student, ...onboardingData, onboardingCompleted: true };
      _setStudent(updatedUser);
      writeLocalStudent(updatedUser);
      setAuthMode('app');
      recordTimelineEvent('Completed Career Onboarding', 'onboarding');
      return updatedUser;
    } catch (err) {
      console.warn('Backend onboarding failed, saving locally:', err.message);
      const updatedUser = { ...student, ...onboardingData, onboardingCompleted: true };
      _setStudent(updatedUser);
      writeLocalStudent(updatedUser);
      setAuthMode('app');
      return updatedUser;
    }
  }, [student]);

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    writeLocalStudent(null);
    _setStudent(null);
    setAuthMode('auth');
    setCurrentPage('dashboard');
  }, []);

  const updateStudentSkills = useCallback(async (skills, note) => {
    setStudent((prev) => {
      if (!prev) return prev;
      return { ...prev, skills };
    });
    if (note) {
      recordTimelineEvent(`Updated Skills: ${note}`, 'skills');
    }
    return { ...student, skills };
  }, [student, setStudent]);

  const saveLearningPlan = useCallback(async (learningPlan, checkedTasks = {}) => {
    try {
      const res = await api.saveLearningPlan({ learningPlan, checkedTasks });
      if (res?.user) {
        _setStudent(res.user);
        writeLocalStudent(res.user);
      }
      return res;
    } catch (err) {
      console.warn('Failed to save learning plan to MongoDB, updating local state:', err.message);
      _setStudent((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, learningPlan, checkedTasks };
        writeLocalStudent(updated);
        return updated;
      });
    }
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  return (
    <AppContext.Provider
      value={{
        student,
        setStudent,
        authMode,
        setAuthMode,
        login,
        signup,
        finishOnboarding,
        logout,
        currentPage,
        setCurrentPage,
        toast,
        showToast,
        updateStudentSkills,
        saveLearningPlan,
        profileAnalysis,
        setProfileAnalysis,
        selectedPath,
        setSelectedPath,
        aiOnline,
        setAiOnline,
        loadingSession,
        recordTimelineEvent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
