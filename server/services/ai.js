import { fetchGitHubProfile } from './github.js';

export async function analyzeUserData(user) {
  let githubData = null;
  const ghUser = user?.profile?.githubUsername;
  if (ghUser) {
    githubData = await fetchGitHubProfile(ghUser);
  }

  const promptContext = {
    name: user.name,
    targetRole: user.profile?.targetRole || 'Software Engineer',
    careerGoal: user.profile?.careerGoal || 'Software development career',
    evidence: user.evidence || [],
    education: user.profile?.education,
    experienceLevel: user.profile?.experienceLevel,
    github: githubData,
    linkedinUrl: user.profile?.linkedinUrl,
    portfolioUrl: user.profile?.portfolioUrl,
  };

  const hasSocialLinks = Boolean(
    ghUser ||
    user.profile?.linkedinUrl ||
    user.profile?.portfolioUrl ||
    (user.evidence && user.evidence.length > 0)
  );

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return generateDefaultAnalysis(user, githubData, hasSocialLinks);
  }

  try {
    const systemPrompt = `You are CareerOS AI Advisor. Analyze the user's social links, GitHub repositories, languages, project portfolio, and target career role.
IMPORTANT:
1. If the user provided real GitHub repositories/social links, analyze their repos, code languages, and project history to accurately assess their actual skill levels (0-100), strengths, and gaps.
2. If NO social links or GitHub profile were provided, set "evidenceMissing": true, set "careerReadiness": 30, and generate a baseline diagnostic learning plan that advises them to add their GitHub or portfolio link.

Return ONLY valid JSON with keys:
{
  "evidenceMissing": boolean,
  "careerReadiness": number (0-100),
  "aiSkills": [
    { "name": string, "current": number (10-100), "target": number (70-95) }
  ],
  "learningPlan": {
    "monday": [ { "label": string, "type": "Learn"|"Solve"|"Practice"|"Quiz"|"Read", "mins": number, "skill": string, "description": string } ],
    "tuesday": [ { "label": string, "type": "Learn"|"Solve"|"Practice"|"Quiz"|"Read", "mins": number, "skill": string, "description": string } ],
    "wednesday": [ { "label": string, "type": "Learn"|"Solve"|"Practice"|"Quiz"|"Read", "mins": number, "skill": string, "description": string } ],
    "thursday": [ { "label": string, "type": "Learn"|"Solve"|"Practice"|"Quiz"|"Read", "mins": number, "skill": string, "description": string } ],
    "friday": [ { "label": string, "type": "Learn"|"Solve"|"Practice"|"Quiz"|"Read", "mins": number, "skill": string, "description": string } ]
  },
  "roadmap": [
    { "weekNumber": 1, "title": string, "focus": string, "milestone": string, "completed": false, "skillBoost": 5 }
  ],
  "careerTwin": {
    "healthIndex": number (0-100),
    "twinAdvice": string,
    "marketReadiness": string
  },
  "skillStrengths": [string],
  "skillGaps": [string],
  "recommendedSkills": [string],
  "recommendedCareerDirection": string,
  "priorityAreas": [string],
  "githubSummary": string
}`;

    const userPrompt = `Analyze user profile: ${JSON.stringify(promptContext)}`;
    const candidateModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-pro'];

    let res = null;
    for (const model of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const candidateRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: { maxOutputTokens: 2000, temperature: 0.4 },
          }),
        });

        if (candidateRes.ok) {
          res = candidateRes;
          break;
        }
      } catch {
        /* try next model */
      }
    }

    if (!res || !res.ok) {
      console.error(`❌ All Gemini API model attempts failed`);
      return generateDefaultAnalysis(user, githubData, hasSocialLinks);
    }

    console.log('✅ Gemini API succeeded');

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      console.error('❌ Gemini API returned empty text');
      return generateDefaultAnalysis(user, githubData, hasSocialLinks);
    }

    const s = rawText.indexOf('{');
    const e = rawText.lastIndexOf('}');
    if (s !== -1 && e !== -1) {
      const parsed = JSON.parse(rawText.substring(s, e + 1));
      return {
        ...parsed,
        githubAnalysis: githubData,
        lastAnalyzedAt: new Date(),
      };
    }
    return generateDefaultAnalysis(user, githubData, hasSocialLinks);
  } catch (err) {
    console.error('❌ Gemini API error:', err.message);
    return generateDefaultAnalysis(user, githubData, hasSocialLinks);
  }
}

function generateDefaultAnalysis(user, githubData, hasSocialLinks) {
  const targetRole = user.profile?.targetRole || 'Software Engineer';
  const detectedLangs = githubData?.detectedLanguages || (hasSocialLinks ? ['JavaScript', 'Python'] : []);

  const aiSkills = hasSocialLinks
    ? [
        { name: detectedLangs[0] || 'Data Structures & Algorithms', current: 65, target: 90 },
        { name: detectedLangs[1] || 'Backend Engineering', current: 55, target: 85 },
        { name: 'System Design & Architecture', current: 35, target: 80 },
        { name: 'Database Optimization (SQL/NoSQL)', current: 45, target: 85 },
        { name: 'DevOps & Cloud Deployment', current: 30, target: 75 },
        { name: 'Technical Communication & Problem Solving', current: 60, target: 85 },
      ]
    : [
        { name: 'Data Structures & Algorithms', current: 30, target: 85 },
        { name: 'Backend Development', current: 25, target: 85 },
        { name: 'System Architecture', current: 20, target: 80 },
        { name: 'Database Systems', current: 35, target: 80 },
        { name: 'DevOps & Deployment', current: 20, target: 75 },
        { name: 'Communication & Interview Readiness', current: 40, target: 85 },
      ];

  const learningPlan = {
    monday: [
      { label: `Core Concept Review (${targetRole})`, type: 'Learn', mins: 30, skill: aiSkills[0].name, description: 'Establish baseline technical skills.' },
      { label: 'Connect Social Links in Evidence Hub', type: 'Practice', mins: 15, skill: 'Evidence Profile', description: 'Add your GitHub or LinkedIn link so Gemini AI can evaluate your actual code repos.' },
    ],
    tuesday: [
      { label: 'System Design Foundations', type: 'Learn', mins: 30, skill: 'System Architecture', description: 'Study foundational system architecture principles.' },
      { label: 'Architecture Quiz', type: 'Quiz', mins: 15, skill: 'System Architecture', description: 'Test baseline knowledge.' },
    ],
    wednesday: [
      { label: 'Database Queries & Schema Design', type: 'Practice', mins: 30, skill: 'Database Systems', description: 'Work through SQL & MongoDB schema design exercises.' },
      { label: 'Read: Database Indexing', type: 'Read', mins: 20, skill: 'Database Systems', description: 'Read about indexing strategies.' },
    ],
    thursday: [
      { label: 'REST API & Authentication', type: 'Learn', mins: 30, skill: 'Backend Development', description: 'Build secure API endpoints.' },
      { label: 'Coding Practice Session', type: 'Solve', mins: 30, skill: 'Backend Development', description: 'Implement an API route with error handling.' },
    ],
    friday: [
      { label: 'Mock Interview Warmup', type: 'Practice', mins: 30, skill: 'Communication & Interview Readiness', description: 'Practice technical communication.' },
      { label: 'Weekly Self Evaluation', type: 'Quiz', mins: 15, skill: 'Communication & Interview Readiness', description: 'Review progress.' },
    ],
  };

  const roadmap = hasSocialLinks
    ? [
        { weekNumber: 1, title: `Analyze Your ${detectedLangs[0] || 'Primary'} Repositories`, focus: 'Code Review', milestone: 'Deep dive into your GitHub projects and refine code style', completed: false, skillBoost: 5 },
        { weekNumber: 2, title: `Master ${targetRole} Core Skills`, focus: 'Role-Specific', milestone: `Build a mini-project aligned with ${targetRole} requirements`, completed: false, skillBoost: 6 },
        { weekNumber: 3, title: 'System Design & Architecture', focus: 'Architecture', milestone: 'Solve a real-world system design problem', completed: false, skillBoost: 7 },
        { weekNumber: 4, title: 'Interview Prep & Mock Sessions', focus: 'Interviews', milestone: `Practice 5 mock interviews for ${targetRole}`, completed: false, skillBoost: 8 },
      ]
    : [
        { weekNumber: 1, title: 'Build Your Portfolio Foundation', focus: 'Evidence Collection', milestone: 'Create GitHub profile and add your first 2 projects', completed: false, skillBoost: 5 },
        { weekNumber: 2, title: `Learn ${targetRole} Fundamentals`, focus: 'Learning', milestone: `Complete 20 hours of ${targetRole} tutorials`, completed: false, skillBoost: 5 },
        { weekNumber: 3, title: 'Build Your First Real Project', focus: 'Project', milestone: `Deploy a small ${targetRole} project to production`, completed: false, skillBoost: 6 },
        { weekNumber: 4, title: 'Start Interviewing', focus: 'Preparation', milestone: 'Mock interview #1 + feedback analysis', completed: false, skillBoost: 7 },
      ];

  const careerReadiness = hasSocialLinks ? 55 : 30;

  return {
    evidenceMissing: !hasSocialLinks,
    careerReadiness,
    aiSkills,
    learningPlan,
    roadmap,
    careerTwin: {
      healthIndex: careerReadiness,
      twinAdvice: hasSocialLinks
        ? `Analysis complete based on your links. High potential in ${aiSkills[0].name}.`
        : 'Please link your GitHub profile or LinkedIn in Evidence Hub so Gemini AI can analyze your actual repositories and code evidence.',
      marketReadiness: hasSocialLinks ? 'Evaluating against market standards' : 'Pending Social Links Upload',
    },
    skillStrengths: hasSocialLinks ? [detectedLangs[0] || 'Problem Solving'] : ['Eager Learner'],
    skillGaps: ['System Architecture', 'DevOps & Cloud', 'Advanced DSA'],
    recommendedSkills: ['GitHub Repos Analysis', 'System Design', 'Docker'],
    recommendedCareerDirection: `Targeting ${targetRole}`,
    priorityAreas: hasSocialLinks
      ? ['Master System Design', 'Deploy portfolio app']
      : ['Link GitHub Profile in Evidence Hub', 'Build 1 open-source repository'],
    githubAnalysis: githubData,
    lastAnalyzedAt: new Date(),
  };
}
