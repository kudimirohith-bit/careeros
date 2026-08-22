/**
 * Fetches public repository and profile metadata from GitHub API for a given username.
 */
export async function fetchGitHubProfile(username) {
  if (!username || typeof username !== 'string') return null;

  const cleanUser = username.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\/$/, '');
  if (!cleanUser) return null;

  try {
    const userRes = await fetch(`https://api.github.com/users/${cleanUser}`, {
      headers: { 'User-Agent': 'CareerOS-App' },
    });

    if (!userRes.ok) {
      return {
        username: cleanUser,
        error: `GitHub user '${cleanUser}' not found or rate limited`,
        repos: [],
        languages: [],
      };
    }

    const userData = await userRes.json();

    // Fetch public repositories
    const reposRes = await fetch(`https://api.github.com/users/${cleanUser}/repos?sort=updated&per_page=15`, {
      headers: { 'User-Agent': 'CareerOS-App' },
    });

    let reposData = [];
    if (reposRes.ok) {
      reposData = await reposRes.json();
    }

    const languagesSet = new Set();
    const repositorySummaries = (Array.isArray(reposData) ? reposData : []).map((repo) => {
      if (repo.language) languagesSet.add(repo.language);
      return {
        name: repo.name,
        description: repo.description || 'No description provided',
        language: repo.language || 'Unknown',
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        topics: repo.topics || [],
        updatedAt: repo.updated_at,
      };
    });

    return {
      username: cleanUser,
      name: userData.name || cleanUser,
      publicRepos: userData.public_repos || 0,
      followers: userData.followers || 0,
      bio: userData.bio || '',
      detectedLanguages: Array.from(languagesSet),
      repositories: repositorySummaries,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('GitHub API fetch error:', err.message);
    return {
      username: cleanUser,
      error: err.message,
      repos: [],
      languages: [],
    };
  }
}
