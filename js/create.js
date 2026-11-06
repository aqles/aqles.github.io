const USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
const CACHE_TTL_MS = 30 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10 * 1000;
const GENERIC_ERROR = 'Could not load that profile. Check the username and your connection, then try again.';

let currentPreview = null;

function init() {
    // Keep the copyright year fresh automatically
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    const form = document.getElementById('create-form');
    const input = document.getElementById('username-input');
    const statusEl = document.getElementById('status');
    const previewEl = document.getElementById('preview');
    const downloadBtn = document.getElementById('download-btn');

    if (!form || !input || !statusEl || !previewEl || !downloadBtn) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        loadPreview(input.value.trim());
    });

    downloadBtn.addEventListener('click', downloadPreview);

    // A shared link like /create.html?u=aqles previews that user right away.
    const sharedUsername = new URLSearchParams(window.location.search).get('u');
    if (sharedUsername) {
        input.value = sharedUsername;
        loadPreview(sharedUsername.trim());
    }

    async function loadPreview(username) {
        if (!USERNAME_PATTERN.test(username)) {
            showError('Please enter a valid GitHub username (letters, numbers, and hyphens only).');
            return;
        }

        const cached = readCache(username);
        if (cached) {
            showPreview(cached.user, cached.repos);
            return;
        }

        statusEl.textContent = 'Loading...';

        // Don't keep them waiting too long (10s timeout)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        try {
            const [userResponse, reposResponse] = await Promise.all([
                fetch(`https://api.github.com/users/${username}`, { signal: controller.signal }),
                fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`, { signal: controller.signal })
            ]);

            clearTimeout(timeoutId);

            if (userResponse.status === 404) {
                showError(`GitHub user '${username}' was not found.`);
                return;
            }

            if (userResponse.status === 403 || reposResponse.status === 403) {
                showError('GitHub API rate limit reached (60 requests per hour). Try again later.');
                return;
            }

            if (!userResponse.ok || !reposResponse.ok) {
                showError(GENERIC_ERROR);
                return;
            }

            const user = await userResponse.json();
            const repos = await reposResponse.json();

            // This is someone else's hub, so their own repos are the point:
            // drop forks and archived repos, keep at most six. The API
            // already returns them sorted by most recent push.
            const visibleRepos = Array.isArray(repos)
                ? repos
                    .filter(repo => !repo.fork && !repo.archived)
                    .slice(0, 6)
                : [];

            writeCache(username, user, visibleRepos);
            showPreview(user, visibleRepos);

        } catch (error) {
            clearTimeout(timeoutId);
            showError(GENERIC_ERROR);
        }
    }

    function showPreview(user, repos) {
        currentPreview = { user, repos };
        statusEl.textContent = '';
        previewEl.innerHTML = profileCardHtml(user) + reposSectionHtml(repos);
        previewEl.hidden = false;
        downloadBtn.hidden = false;
    }

    function showError(message) {
        currentPreview = null;
        statusEl.textContent = message;
        previewEl.innerHTML = '';
        previewEl.hidden = true;
        downloadBtn.hidden = true;
    }

    // Repeat previews of the same username in this tab reuse the cached
    // result for 30 minutes, so they make no network requests at all.
    function readCache(username) {
        try {
            const raw = sessionStorage.getItem(`hub-preview-${username.toLowerCase()}`);
            if (!raw) return null;

            const cached = JSON.parse(raw);
            if (!cached || !cached.user || !Array.isArray(cached.repos)) return null;
            if (Date.now() - cached.savedAt >= CACHE_TTL_MS) return null;

            return cached;
        } catch (error) {
            return null;
        }
    }

    function writeCache(username, user, repos) {
        try {
            sessionStorage.setItem(
                `hub-preview-${username.toLowerCase()}`,
                JSON.stringify({ savedAt: Date.now(), user, repos })
            );
        } catch (error) {
            // Storage can be unavailable (e.g. private mode). The preview is
            // already on the page by then, so not caching is not an error.
        }
    }

    async function downloadPreview() {
        if (!currentPreview) return;

        // The downloaded file has to carry its own styles: fetch the
        // stylesheet and embed it. If that fails there is no sensible
        // fallback for a standalone file, so stop with an error.
        let css;
        try {
            const response = await fetch('/css/global.css');
            if (!response.ok) throw new Error(`Failed to fetch CSS: ${response.status}`);
            css = await response.text();
        } catch (error) {
            statusEl.textContent = GENERIC_ERROR;
            return;
        }

        const { user, repos } = currentPreview;
        const page = buildStandalonePage(user, repos, css);
        const blob = new Blob([page], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${user.login}-hub.html`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
    }
}

function displayName(user) {
    return user.name || user.login || '';
}

function avatarUrl(user) {
    return (typeof user.avatar_url === 'string' && user.avatar_url.startsWith('https://avatars.githubusercontent.com/'))
        ? user.avatar_url
        : '/assets/favicon.ico';
}

function profileUrl(user) {
    return (typeof user.html_url === 'string' && user.html_url.startsWith('https://'))
        ? user.html_url
        : `https://github.com/${user.login || ''}`;
}

function websiteUrl(user) {
    if (typeof user.blog !== 'string') return null;

    let blog = user.blog.trim();
    if (!blog) return null;

    // Blog often comes back as a bare domain with no scheme.
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(blog)) {
        blog = `https://${blog}`;
    }

    return blog.startsWith('https://') ? blog : null;
}

function profileCardHtml(user) {
    const name = escapeHtml(displayName(user));
    const login = escapeHtml(user.login || '');
    const roleLine = user.location
        ? `@${login} · ${escapeHtml(user.location)}`
        : `@${login}`;
    const bio = escapeHtml(user.bio || 'No bio available.');
    const stats = `${Number(user.public_repos) || 0} public repos · ${Number(user.followers) || 0} followers · ${Number(user.following) || 0} following`;

    const extraLinks = [];
    const website = websiteUrl(user);
    if (website) {
        extraLinks.push(`<a href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer" aria-label="Website"><i class="fa-solid fa-globe"></i></a>`);
    }
    if (user.twitter_username) {
        extraLinks.push(`<a href="https://x.com/${escapeHtml(user.twitter_username)}" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"><i class="fa-brands fa-x-twitter"></i></a>`);
    }

    return `
    <section class="profile-card glass-panel fade-in-up">
        <div class="profile-image-container">
            <img src="${escapeHtml(avatarUrl(user))}" alt="${name}" class="profile-img">
        </div>
        <h1>${name}</h1>
        <p class="role">${roleLine}</p>
        <p class="bio">${bio}</p>
        <p class="hub-stats">${stats}</p>
        <div class="primary-action">
            <a href="${escapeHtml(profileUrl(user))}" class="btn btn-primary glow-effect" target="_blank" rel="noopener noreferrer">
                <i class="fa-brands fa-github"></i> View GitHub profile
            </a>
        </div>
        ${extraLinks.length ? `<div class="social-links">${extraLinks.join('')}</div>` : ''}
    </section>`;
}

function reposSectionHtml(repos) {
    const cards = (Array.isArray(repos) ? repos : []).map(repoCardHtml).join('');
    const body = cards || '<p style="text-align:center; color:#888;">No repositories found.</p>';

    return `
    <section class="projects-section glass-panel fade-in-up delay-1">
        <div class="section-header">
            <h2>Latest Public Repositories</h2>
        </div>
        <div class="repo-grid">
            ${body}
        </div>
    </section>`;
}

function repoCardHtml(repo) {
    const cardUrl = (typeof repo.html_url === 'string' && repo.html_url.startsWith('https://'))
        ? repo.html_url
        : 'https://github.com';

    // Give it a splash of color based on the tech stack
    const langColor = getLanguageColor(repo.language);

    const repoName = escapeHtml(repo.name);
    const repoDesc = escapeHtml(repo.description || 'No description available.');
    const repoLang = escapeHtml(repo.language || 'Code');
    const stars = Number(repo.stargazers_count) || 0;

    return `
        <a href="${escapeHtml(cardUrl)}" target="_blank" rel="noopener noreferrer" class="repo-card">
            <div class="repo-top">
                <span class="repo-name"><i class="fa-regular fa-folder"></i> ${repoName}</span>
                <span style="font-size: 0.8rem;"><i class="fa-regular fa-star"></i> ${stars}</span>
            </div>
            <p class="repo-desc">${repoDesc}</p>
            <div class="repo-meta">
                <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${langColor};margin-right:4px;"></span>${repoLang}</span>
            </div>
        </a>`;
}

function buildStandalonePage(user, repos, css) {
    const name = escapeHtml(displayName(user));

    return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} | Portfolio Hub</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Space+Grotesk:wght@300;500;700&display=swap"
        rel="stylesheet">

    <!-- Font Awesome for Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
        crossorigin="anonymous" referrerpolicy="no-referrer">

    <style>
${css}
    </style>
</head>

<body>

    <main class="container">
${profileCardHtml(user)}
${reposSectionHtml(repos)}
        <footer>
            <p>Page generated with aqles.github.io/create.html</p>
        </footer>
    </main>
</body>

</html>`;
}

// Duplicated from main.js on purpose, so this page stays independent of the home page script.
function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#3178c6',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Python': '#3572A5',
        'Vue': '#41b883',
        'React': '#61dafb',
        'PHP': '#4F5D95',
        'Shell': '#89e051'
    };
    return colors[language] || '#ffffff';
}

// Duplicated from main.js on purpose, so this page stays independent of the home page script.
function escapeHtml(text) {
    if (!text) return text;
    return text
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
