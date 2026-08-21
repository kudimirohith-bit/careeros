import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api';

const AppContext = createContext(null);

export const NAV_PAGES = [
  { id: 'dashboard',     label: 'Dashboard' },
  { id: 'career-twin',   label: 'Career Twin' },
  { id: 'learning-plan', label: 'Learning Plan' },
  { id: 'practice',      label: 'Practice & Tests' },
  { id: 'mock-interview', label: 'Mock Interview' },
  { id: 'simulator',     label: 'What-If Simulator' },
  { id: 'progress',      label: 'Progress' },
];

export function AppProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [profileAnalysis, setProfileAnalysis] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);

  useEffect(() => {
    api.getStudent()
      .then((data) => {
        if (data && !data.error) {
          setStudent(data);
          console.log('Student loaded from DB:', data.name, data.targetRole);
          if (!data.onboardingDone && currentPage === 'landing') {
            setCurrentPage('onboarding');
          }
        }
      })
      .catch((err) => console.error('Failed to fetch student:', err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateStudentSkills = async (skills, note) => {
    if (!student?._id) return;
    const updated = await api.updateSkills(student._id, skills, note);
    setStudent(updated);
    return updated;
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <AppContext.Provider
      value={{
        student,
        setStudent,
        loading,
        currentPage,
        setCurrentPage,
        toast,
        showToast,
        updateStudentSkills,
        profileAnalysis,
        setProfileAnalysis,
        selectedPath,
        setSelectedPath,
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
