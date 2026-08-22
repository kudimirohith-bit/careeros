const BASE = '/api';
const TOKEN_KEY = 'careeros_token';

function authFetch(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  return fetch(`${BASE}${path}`, { ...options, headers }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
    }
    return data;
  });
}

export const api = {
  // Auth
  signup: (data) =>
    fetch(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(async (r) => {
      const resData = await r.json();
      if (!r.ok) throw new Error(resData.error || 'Signup failed');
      return resData;
    }),

  login: (data) =>
    fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(async (r) => {
      const resData = await r.json();
      if (!r.ok) throw new Error(resData.error || 'Login failed');
      return resData;
    }),

  getMe: () => authFetch('/auth/me'),

  forgotPassword: (email) =>
    fetch(`${BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then((r) => r.json()),

  // Onboarding
  completeOnboarding: (data) =>
    authFetch('/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Evidence Hub
  getEvidence: () => authFetch('/evidence'),
  addEvidence: (data) =>
    authFetch('/evidence', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEvidence: (id, data) =>
    authFetch(`/evidence/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteEvidence: (id) =>
    authFetch(`/evidence/${id}`, {
      method: 'DELETE',
    }),
  analyzeEvidence: () =>
    authFetch('/evidence/analyze', {
      method: 'POST',
    }),

  // AI Learning Plan
  saveLearningPlan: (data) =>
    authFetch('/ai/save-learning-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getLearningPlan: () => authFetch('/ai/plan'),

  // Legacy Student fallback
  getStudent: () => fetch(`${BASE}/student`).then((r) => r.json()),
  updateSkills: (id, skills, activityNote = '') =>
    fetch(`${BASE}/student/${id}/update-skills`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills, activityNote }),
    }).then((r) => r.json()),
};
