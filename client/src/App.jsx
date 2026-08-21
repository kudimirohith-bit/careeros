import './index.css';
import { lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

// ── Page imports ──────────────────────────────────────────────
import Dashboard     from './pages/Dashboard';
import AssessmentPage from './pages/AssessmentPage';
import CodingTest    from './pages/CodingTest';
import AptitudeTest  from './pages/AptitudeTest';
import Onboarding    from './pages/Onboarding';
import LearningPlan  from './pages/LearningPlan';
import CareerTwin    from './pages/CareerTwin';
import MockInterview from './pages/MockInterview';
import WhatIfSimulator from './pages/WhatIfSimulator';

// Heavy Recharts page — code-split so it doesn't bloat the initial bundle
const ProgressPage = lazy(() => import('./pages/Progress'));

// Practice & Tests hub — tabs between Coding Test and Skill Assessment
import { useState as useSt } from 'react';
function PracticeHub() {
  const [tab, setTab] = useSt('coding');
  const tabs = [
    { id: 'coding',     label: '💻 Coding Test'       },
    { id: 'aptitude',   label: '🧮 Aptitude Test'      },
    { id: 'assessment', label: '🧠 Skill Assessment'   },
  ];
  return (
    <div className="space-y-5">
      <div className="flex gap-2 p-1 rounded-xl bg-slate-100 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`practice-tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
              background: tab === t.id ? '#fff' : 'transparent',
              color:      tab === t.id ? '#6366F1' : '#64748B',
              boxShadow:  tab === t.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'coding'     && <CodingTest />}
      {tab === 'aptitude'   && <AptitudeTest />}
      {tab === 'assessment' && <AssessmentPage />}
    </div>
  );
}

// ── Page router ───────────────────────────────────────────────
function PageRenderer() {
  const { currentPage } = useApp();

  switch (currentPage) {
    case 'dashboard':      return <Dashboard />;
    case 'career-twin':    return <CareerTwin />;
    case 'learning-plan':  return <LearningPlan />;
    case 'practice':       return <PracticeHub />;
    case 'assessment':     return <AssessmentPage />;
    case 'mock-interview': return <MockInterview />;
    case 'simulator':      return <WhatIfSimulator />;
    case 'progress':       return (
      <Suspense fallback={<div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading charts…</div>}>
        <ProgressPage />
      </Suspense>
    );
    default:               return <Dashboard />;
  }
}

// ── Loading skeleton ──────────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      className="flex items-center justify-center h-screen gap-3"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      <span
        className="inline-block w-3 h-3 rounded-full animate-bounce"
        style={{ background: 'var(--accent)', animationDelay: '0ms' }}
      />
      <span
        className="inline-block w-3 h-3 rounded-full animate-bounce"
        style={{ background: 'var(--accent)', animationDelay: '150ms' }}
      />
      <span
        className="inline-block w-3 h-3 rounded-full animate-bounce"
        style={{ background: 'var(--accent)', animationDelay: '300ms' }}
      />
    </div>
  );
}

// ── App shell ─────────────────────────────────────────────────
function AppShell() {
  const { loading, student } = useApp();

  if (loading) return <LoadingScreen />;

  // Show onboarding wizard when no student exists or onboarding not done
  if (!student || !student.onboardingDone) {
    return <Onboarding />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden" style={{ background: 'var(--main-bg)' }}>
        <TopBar />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <PageRenderer />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
