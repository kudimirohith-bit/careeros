const BASE = '/api';

// ── AI fetch helper (attaches Gemini key from localStorage) ──────────
const KEY_STORAGE = 'careeros_gemini_key';

function aiFetch(path, options = {}) {
  const key = localStorage.getItem(KEY_STORAGE);
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (key && key.trim() !== '' && key !== 'null' && key !== 'undefined') {
    headers['x-gemini-key'] = key;
  }
  return fetch(`${BASE}${path}`, { ...options, headers }).then((r) => r.json());
}


export const api = {
  // Student
  getStudent: () =>
    fetch(`${BASE}/student`).then((r) => r.json()),

  createStudent: (data) =>
    fetch(`${BASE}/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateSkills: (id, skills, activityNote = '') =>
    fetch(`${BASE}/student/${id}/update-skills`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills, activityNote }),
    }).then((r) => r.json()),

  completeOnboarding: (id, data) =>
    fetch(`${BASE}/student/${id}/complete-onboarding`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // Assessments
  submitAssessment: (data) =>
    fetch(`${BASE}/assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  getAssessments: (studentId) =>
    fetch(`${BASE}/assessment/${studentId}`).then((r) => r.json()),

  // Progress
  getProgress: (studentId) =>
    fetch(`${BASE}/progress/${studentId}`).then((r) => r.json()),

  // ── AI Endpoints ──────────────────────────────────────────────
  analyzeProfiles: (studentId, profileLinks) =>
    aiFetch('/ai/analyze-profiles', {
      method: 'POST',
      body: JSON.stringify({ studentId, profileLinks }),
    }),

  generatePlan: (data) =>
    aiFetch('/ai/generate-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPlan: (studentId) =>
    aiFetch(`/ai/plan?studentId=${studentId}`),

  completeAiTask: (studentId, taskId) =>
    aiFetch('/ai/complete-task', {
      method: 'POST',
      body: JSON.stringify({ studentId, taskId }),
    }),

  getTodaysTasks: (studentId) =>
    aiFetch(`/ai/todays-tasks?studentId=${studentId}`),

  getCoachMessage: (studentId, userMessage) =>
    aiFetch('/ai/coach-message', {
      method: 'POST',
      body: JSON.stringify({ studentId, userMessage }),
    }),

  getBonusTasks: (studentId, minutes = 30) =>
    aiFetch(`/ai/bonus-tasks?studentId=${studentId}&minutes=${minutes}`),

  updateInterviewDate: (studentId, interviewDate, company, role) =>
    aiFetch('/ai/interview-date', {
      method: 'PATCH',
      body: JSON.stringify({ studentId, interviewDate, company, role }),
    }),
};
