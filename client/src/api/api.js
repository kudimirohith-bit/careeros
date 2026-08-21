const BASE = '/api';

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
};
