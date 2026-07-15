/**
 * GitHub API Helper — Open Intelligence Hub
 * Fetches repo metadata from GitHub REST API
 */

/**
 * Extract owner and repo name from a GitHub URL
 * @param {string} url - e.g. https://github.com/langchain-ai/langchain
 * @returns {{ owner: string, repo: string } | null}
 */
export function parseGitHubUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') return null;

    const parts = parsed.pathname.replace(/^\//, '').replace(/\/$/, '').split('/');
    if (parts.length < 2) return null;

    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

/**
 * Fetch GitHub repository metadata
 * @param {string} githubUrl - Full GitHub repo URL
 * @returns {Promise<object>} Repo data formatted for our Resource model
 */
export async function fetchGitHubRepo(githubUrl) {
  const parsed = parseGitHubUrl(githubUrl);

  if (!parsed) {
    throw new Error('Invalid GitHub URL. Please enter a valid GitHub repository URL.');
  }

  const { owner, repo } = parsed;

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // Use token if available (5000 req/hr vs 60 req/hr)
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    { headers, next: { revalidate: 3600 } } // Cache for 1 hour
  );

  if (response.status === 404) {
    throw new Error('Repository not found. Make sure the URL is correct and the repo is public.');
  }

  if (response.status === 403) {
    throw new Error('GitHub API rate limit exceeded. Please try again later.');
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    title: data.name,
    description: data.description || '',
    github_stars: data.stargazers_count || 0,
    github_language: data.language || null,
    github_last_updated: data.updated_at ? new Date(data.updated_at) : null,
    topics: data.topics || [],          // for tag suggestions
    license: data.license?.name || null,
    homepage: data.homepage || null,
    default_branch: data.default_branch || 'main',
  };
}
