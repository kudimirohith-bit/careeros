import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
  const [student, setStudent]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    axios
      .get('/api/student')
      .then((res) => setStudent(res.data))
      .catch((err) => console.error('Failed to fetch student:', err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppContext.Provider value={{ student, setStudent, loading, currentPage, setCurrentPage }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
