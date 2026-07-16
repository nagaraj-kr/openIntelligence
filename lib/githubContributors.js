/**
 * GitHub Contributors Helper — Open Intelligence Hub
 *
 * NEW LOGIC:
 * DB-ல் உள்ள எல்லா Approved Resources-ஓட GitHub repos-ஐயும் scan பண்ணும்.
 * ஒவ்வொரு repo-வும் யாரு fork பண்றாங்க என்று காட்டும்.
 */

import { parseGitHubUrl } from './github.js';
import { supabaseAdmin } from './supabase-admin.js';

const IS_DEV = process.env.NODE_ENV === 'development';

function ghHeaders() {
  const h = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) {
    h['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

const fetchOpts = IS_DEV
  ? { cache: 'no-store' }
  : { next: { revalidate: 1800 } };

/** Safe GitHub fetch — returns null on error */
async function ghFetch(url) {
  try {
    const res = await fetch(url, { headers: ghHeaders(), ...fetchOpts });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Get fork list for a repo (max 100) */
async function getRepoForks(owner, repo) {
  const data = await ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/forks?per_page=100&sort=newest`
  );
  return Array.isArray(data) ? data : [];
}

/** Get basic repo info (stars, forks count) */
async function getRepoInfo(owner, repo) {
  const data = await ghFetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!data) return null;
  return {
    full_name:       data.full_name,
    html_url:        data.html_url,
    stargazers_count: data.stargazers_count || 0,
    forks_count:     data.forks_count || 0,
    description:     data.description || '',
    language:        data.language || null,
  };
}

/**
 * Main function — scans all approved resources in DB
 * Returns per-resource fork data + global contributor leaderboard
 *
 * Shape:
 * {
 *   resources: [
 *     {
 *       id, title, slug, github_url, owner, repo,
 *       repoInfo: { stargazers_count, forks_count, ... },
 *       forkers: [{ login, avatar_url, profile_url }],
 *     }
 *   ],
 *   leaderboard: [
 *     { login, avatar_url, profile_url, forked_repos: ['title1','title2'], count }
 *   ],
 *   summary: { total_resources, total_forks, unique_forkers }
 * }
 */
export async function buildResourceContributors() {
  // 1. Get all approved resources with github_url
  let resources = [];
  try {
    const { data, error } = await supabaseAdmin.from('resources')
      .select('id, title, slug, github_url')
      .in('status', ['APPROVED', 'FEATURED'])
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;
    resources = data || [];
  } catch {
    return { resources: [], leaderboard: [], summary: { total_resources: 0, total_forks: 0, unique_forkers: 0 } };
  }

  // 2. Parse owner/repo from each github_url
  const repoList = resources
    .map(r => ({ ...r, parsed: parseGitHubUrl(r.github_url) }))
    .filter(r => r.parsed !== null);

  // 3. Fetch repo info + forks in parallel (batched to avoid rate limits)
  const results = await Promise.all(
    repoList.map(async (r) => {
      const { owner, repo } = r.parsed;
      const [repoInfo, forks] = await Promise.all([
        getRepoInfo(owner, repo),
        getRepoForks(owner, repo),
      ]);
      return {
        id:        r.id,
        title:     r.title,
        slug:      r.slug,
        github_url: r.github_url,
        owner,
        repo,
        repoInfo,
        forkers: forks.map(f => ({
          login:       f.owner?.login || '',
          avatar_url:  f.owner?.avatar_url || `https://github.com/${f.owner?.login}.png`,
          profile_url: `https://github.com/${f.owner?.login}`,
        })).filter(f => f.login),
      };
    })
  );

  // 4. Build global leaderboard — who forked the most resources
  const userMap = {};
  for (const r of results) {
    for (const f of r.forkers) {
      if (!userMap[f.login]) {
        userMap[f.login] = {
          login:        f.login,
          avatar_url:   f.avatar_url,
          profile_url:  f.profile_url,
          forked_repos: [],
          count:        0,
        };
      }
      userMap[f.login].forked_repos.push(r.title);
      userMap[f.login].count++;
    }
  }

  const leaderboard = Object.values(userMap).sort((a, b) => b.count - a.count);

  const totalForks = results.reduce((sum, r) => sum + r.forkers.length, 0);

  return {
    resources: results,
    leaderboard,
    summary: {
      total_resources: results.length,
      total_forks:     totalForks,
      unique_forkers:  leaderboard.length,
    },
  };
}

/**
 * Legacy function kept for homepage backward compat.
 * Now delegates to buildResourceContributors.
 */
export async function buildContributorStats() {
  const data = await buildResourceContributors();

  // Map to old shape for homepage leaderboard
  const contributors = data.leaderboard.map(u => ({
    login:       u.login,
    avatar_url:  u.avatar_url,
    profile_url: u.profile_url,
    forked:      true,
    prs:         0,
    merged:      0,
    issues:      0,
    score:       u.count,
  }));

  return {
    repoStats: { forks_count: data.summary.total_forks, html_url: '', full_name: 'All Resources' },
    summary:   {
      forks:        data.summary.total_forks,
      prs:          0,
      merged:       0,
      issues:       0,
      contributors: data.summary.unique_forkers,
    },
    contributors,
    // Extra data for admin panel
    resourceDetails: data.resources,
  };
}
