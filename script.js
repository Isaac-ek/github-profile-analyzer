const analyzeButton = document.getElementById('analyze-btn');
const usernameInput = document.getElementById('username');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error-message');
const resultsDiv = document.getElementById('results');

const GITHUB_API_BASE = 'https://api.github.com';
const MAX_REPOS = 6;
const MAX_EVENTS = 5;

analyzeButton.addEventListener('click', handleAnalyze);
usernameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleAnalyze();
  }
});

async function handleAnalyze() {
  const rawInput = usernameInput.value.trim();
  const username = extractUsername(rawInput);

  if (!username) {
    showError('Enter a GitHub username or paste a valid GitHub profile link.');
    return;
  }

  usernameInput.value = username;

  setLoading(true);
  clearMessages();

  try {
    const [profile, repos, events] = await Promise.all([
      fetchGitHubJson(`/users/${username}`),
      fetchGitHubJson(`/users/${username}/repos?per_page=100&sort=updated`),
      fetchGitHubJson(`/users/${username}/events?per_page=10`),
    ]);

    renderResults(profile, repos, events);
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
}

async function fetchGitHubJson(path) {
  const response = await fetch(`${GITHUB_API_BASE}${path}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('GitHub user not found.');
    }

    if (response.status === 403) {
      throw new Error('GitHub API rate limit reached. Please wait a little and try again.');
    }

    throw new Error('Unable to fetch GitHub data right now.');
  }

  return response.json();
}

function extractUsername(input) {
  if (!input) {
    return '';
  }

  const normalizedInput = input.trim().replace(/^@/, '');

  if (!normalizedInput) {
    return '';
  }

  if (!normalizedInput.includes('/')) {
    return isLikelyUsername(normalizedInput) ? normalizedInput : '';
  }

  try {
    const candidateUrl = normalizedInput.startsWith('http')
      ? new URL(normalizedInput)
      : new URL(`https://${normalizedInput}`);

    const hostname = candidateUrl.hostname.replace(/^www\./, '').toLowerCase();

    if (hostname !== 'github.com') {
      return '';
    }

    const pathSegments = candidateUrl.pathname
      .split('/')
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (pathSegments.length !== 1) {
      return '';
    }

    return isLikelyUsername(pathSegments[0]) ? pathSegments[0] : '';
  } catch {
    return '';
  }
}

function isLikelyUsername(value) {
  return /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(value);
}

function renderResults(profile, repos, events) {
  const sortedRepos = [...repos].sort(sortRepositories);
  const topRepos = sortedRepos.slice(0, MAX_REPOS);
  const languageBreakdown = getTopLanguages(repos);
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

  resultsDiv.innerHTML = `
    <section class="card profile-card">
      <div>
        <div class="identity">
          <img class="avatar" src="${profile.avatar_url}" alt="${escapeHtml(profile.login)} avatar">
          <div>
            <h2>${escapeHtml(profile.name || profile.login)}</h2>
            <div class="identity-meta">
              <span>@${escapeHtml(profile.login)}</span>
              ${profile.location ? `<span>${escapeHtml(profile.location)}</span>` : ''}
              ${profile.company ? `<span>${escapeHtml(profile.company)}</span>` : ''}
              ${profile.blog ? `<span>${createLink(sanitizeUrl(profile.blog), formatUrlLabel(profile.blog))}</span>` : ''}
            </div>
            <p class="bio">${escapeHtml(profile.bio || 'No bio available.')}</p>
            <div class="quick-links">
              ${createPillLink(profile.html_url, 'View GitHub Profile')}
              ${profile.twitter_username ? createPillLink(`https://x.com/${profile.twitter_username}`, 'View X Profile') : ''}
            </div>
          </div>
        </div>
      </div>
      <div class="stats-grid">
        ${createStatCard(profile.public_repos, 'Public repositories')}
        ${createStatCard(profile.followers, 'Followers')}
        ${createStatCard(profile.following, 'Following')}
        ${createStatCard(formatDate(profile.created_at), 'GitHub member since')}
      </div>
    </section>

    <section class="summary-grid">
      <article class="summary-card">
        <span class="value">${totalStars}</span>
        <span class="label">Total stars across public repositories</span>
      </article>
      <article class="summary-card">
        <span class="value">${totalForks}</span>
        <span class="label">Total forks across public repositories</span>
      </article>
      <article class="summary-card">
        <span class="value">${languageBreakdown.length || 0}</span>
        <span class="label">Languages detected in public repositories</span>
      </article>
    </section>

    <section class="card">
      <div class="section-heading">
        <h3>Top Languages</h3>
        <span>Based on public repositories</span>
      </div>
      ${
        languageBreakdown.length
          ? `<div class="language-list">${languageBreakdown
              .map(
                (language) => `
                <span class="chip">
                  <span class="dot"></span>
                  ${escapeHtml(language.name)} (${language.count})
                </span>
              `
              )
              .join('')}</div>`
          : '<p class="empty-state">No language information was available for this profile.</p>'
      }
    </section>

    <section class="card">
      <div class="section-heading">
        <h3>Highlighted Repositories</h3>
        <span>Sorted by stars, forks, and recent updates</span>
      </div>
      <div class="repo-list">
        ${
          topRepos.length
            ? topRepos.map(renderRepository).join('')
            : '<p class="empty-state">No public repositories found.</p>'
        }
      </div>
    </section>

    <section class="card">
      <div class="section-heading">
        <h3>Recent Public Activity</h3>
        <span>Latest visible GitHub events</span>
      </div>
      <div class="activity-list">
        ${
          events.length
            ? events.slice(0, MAX_EVENTS).map((event) => renderEvent(profile.login, event)).join('')
            : '<p class="empty-state">No recent public activity was available.</p>'
        }
      </div>
    </section>
  `;
}

function renderRepository(repo) {
  return `
    <article class="repo-item">
      <div class="repo-header">
        <div>
          <a class="repo-name" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(repo.name)}
          </a>
          <p class="repo-description">${escapeHtml(repo.description || 'No description provided.')}</p>
        </div>
      </div>
      <div class="repo-meta">
        <span class="chip">Stars ${repo.stargazers_count}</span>
        <span class="chip">Forks ${repo.forks_count}</span>
        <span class="chip">Open issues ${repo.open_issues_count}</span>
        ${repo.language ? `<span class="chip">${escapeHtml(repo.language)}</span>` : ''}
        <span class="chip">Updated ${formatDate(repo.updated_at)}</span>
      </div>
    </article>
  `;
}

function renderEvent(username, event) {
  const repoName = event.repo?.name || 'Unknown repository';
  const repoUrl = `https://github.com/${repoName}`;
  const eventSummary = describeEvent(event);
  const activityUrl = getEventTargetUrl(username, event, repoUrl);

  return `
    <article class="activity-item">
      <div class="activity-header">
        <a class="activity-title" href="${activityUrl}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(event.type)}
        </a>
        <span class="chip">${formatDateTime(event.created_at)}</span>
      </div>
      <p class="activity-description">${escapeHtml(eventSummary)}</p>
      <div class="activity-meta">
        <a class="pill-link" href="${repoUrl}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(repoName)}
        </a>
      </div>
    </article>
  `;
}

function describeEvent(event) {
  const payload = event.payload || {};

  switch (event.type) {
    case 'PushEvent':
      return `Pushed ${payload.commits?.length || 0} commit(s) to ${payload.ref?.replace('refs/heads/', '') || 'a branch'}.`;
    case 'CreateEvent':
      return `Created a new ${payload.ref_type || 'resource'}${payload.ref ? ` named ${payload.ref}` : ''}.`;
    case 'PullRequestEvent':
      return `${payload.action || 'Updated'} pull request #${payload.pull_request?.number || ''}.`.trim();
    case 'IssuesEvent':
      return `${payload.action || 'Updated'} issue #${payload.issue?.number || ''}.`.trim();
    case 'IssueCommentEvent':
      return `${payload.action || 'Updated'} a comment on issue #${payload.issue?.number || ''}.`.trim();
    case 'WatchEvent':
      return 'Starred a repository.';
    case 'ForkEvent':
      return 'Forked a repository.';
    default:
      return 'Public GitHub activity recorded on this account.';
  }
}

function getEventTargetUrl(username, event, fallbackUrl) {
  const payload = event.payload || {};

  if (payload.pull_request?.html_url) {
    return payload.pull_request.html_url;
  }

  if (payload.issue?.html_url) {
    return payload.issue.html_url;
  }

  if (payload.comment?.html_url) {
    return payload.comment.html_url;
  }

  if (event.type === 'PushEvent' && payload.ref) {
    return `${fallbackUrl}/tree/${encodeURIComponent(payload.ref.replace('refs/heads/', ''))}`;
  }

  return fallbackUrl || `https://github.com/${username}`;
}

function getTopLanguages(repos) {
  const languageCounts = new Map();

  repos.forEach((repo) => {
    if (!repo.language) {
      return;
    }

    languageCounts.set(repo.language, (languageCounts.get(repo.language) || 0) + 1);
  });

  return [...languageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));
}

function sortRepositories(a, b) {
  if (b.stargazers_count !== a.stargazers_count) {
    return b.stargazers_count - a.stargazers_count;
  }

  if (b.forks_count !== a.forks_count) {
    return b.forks_count - a.forks_count;
  }

  return new Date(b.updated_at) - new Date(a.updated_at);
}

function createStatCard(value, label) {
  return `
    <article class="stat-card">
      <span class="value">${escapeHtml(String(value))}</span>
      <span class="label">${escapeHtml(label)}</span>
    </article>
  `;
}

function createPillLink(url, label) {
  return `
    <a class="pill-link" href="${url}" target="_blank" rel="noopener noreferrer">
      ${escapeHtml(label)}
    </a>
  `;
}

function createLink(url, label) {
  return `
    <a href="${url}" target="_blank" rel="noopener noreferrer">
      ${escapeHtml(label)}
    </a>
  `;
}

function setLoading(isLoading) {
  loadingDiv.classList.toggle('is-hidden', !isLoading);
  analyzeButton.disabled = isLoading;
  analyzeButton.textContent = isLoading ? 'Analyzing...' : 'Analyze Profile';
}

function clearMessages() {
  errorDiv.textContent = '';
  errorDiv.classList.add('is-hidden');
  resultsDiv.innerHTML = '';
}

function showError(message) {
  resultsDiv.innerHTML = '';
  errorDiv.textContent = message;
  errorDiv.classList.remove('is-hidden');
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(value) {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatUrlLabel(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function sanitizeUrl(url) {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `https://${url}`;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
