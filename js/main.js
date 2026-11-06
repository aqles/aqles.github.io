const EXCLUDED_REPOS = ['aqles.github.io', 'scroll-test'];
const REPO_CACHE_KEY = 'aqles-repos-v1';
const REPO_CACHE_TTL_MS = 30 * 60 * 1000;

// Keep the copyright year fresh automatically
function init() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    const profileImg = document.getElementById('profile-img');
    if (profileImg) {
        profileImg.addEventListener('error', () => { profileImg.src = '/assets/favicon.ico'; }, { once: true });
        if (profileImg.complete && profileImg.naturalWidth === 0) {
            profileImg.src = '/assets/favicon.ico';
        }
    }

    // Let's sprinkle some magic ✨
    initEasterEggs();

    // Grabbing my latest cool stuff from GitHub
    const repoContainer = document.getElementById('repo-list');
    const username = 'aqles';

    if (!repoContainer) return;

    const cachedRepos = readCachedRepos();
    if (cachedRepos) {
        renderRepos(repoContainer, cachedRepos);
    } else {
        fetchRepos();
    }

    // Repeat visits in the same tab reuse the cached list for 30 minutes,
    // so they do not burn through the GitHub API rate limit (60/hour/IP).
    function readCachedRepos() {
        try {
            const raw = sessionStorage.getItem(REPO_CACHE_KEY);
            if (!raw) return null;

            const cached = JSON.parse(raw);
            if (!cached || !Array.isArray(cached.repos)) return null;
            if (Date.now() - cached.savedAt >= REPO_CACHE_TTL_MS) return null;

            return cached.repos;
        } catch (error) {
            return null;
        }
    }

    function cacheRepos(repos) {
        try {
            sessionStorage.setItem(REPO_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), repos }));
        } catch (error) {
            // Storage can be unavailable (e.g. private mode). The list is
            // already on the page by then, so not caching is not an error.
        }
    }

    async function fetchRepos() {
        try {
            // Don't keep them waiting too long (5s timeout)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

            const repos = await response.json();

            // Hide forks, archived repos, and the ones named in
            // EXCLUDED_REPOS (this site itself, test repos). Filter before
            // caching, so the cache only holds the list we actually show.
            const visibleRepos = Array.isArray(repos)
                ? repos
                    .filter(repo => !repo.fork && !repo.archived && !EXCLUDED_REPOS.includes(repo.name))
                    .slice(0, 6)
                : [];

            renderRepos(repoContainer, visibleRepos);
            cacheRepos(visibleRepos);

        } catch (error) {
            console.error('Error fetching repos:', error);
            // Oops, something went wrong. Show a friendly error.
            repoContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center;">
                    <p style="color: #ff6b6b; margin-bottom: 1rem;">
                        <i class="fa-solid fa-circle-exclamation"></i>
                        Unable to load projects (${error.name === 'AbortError' ? 'Timeout' : 'Error'}).
                    </p>
                    <a href="https://github.com/${username}?tab=repositories" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                        View on GitHub
                    </a>
                </div>
            `;
        }
    }
}

function renderRepos(repoContainer, repos) {
    // Clear the loading spinner
    repoContainer.innerHTML = '';

    if (!Array.isArray(repos) || repos.length === 0) {
        repoContainer.innerHTML = '<p style="text-align:center; color:#888;">No repositories found.</p>';
        return;
    }

    repos.forEach(repo => {
        const card = document.createElement('a');
        card.href = (typeof repo.html_url === 'string' && repo.html_url.startsWith('https://github.com/'))
            ? repo.html_url
            : 'https://github.com/aqles?tab=repositories';
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'repo-card';

        // Give it a splash of color based on the tech stack
        const langColor = getLanguageColor(repo.language);

        // Sanitizing inputs because safety first! 🛡️
        const repoName = escapeHtml(repo.name);
        const repoDesc = escapeHtml(repo.description || 'No description available.');
        const repoLang = escapeHtml(repo.language || 'Code');
        const stars = Number(repo.stargazers_count) || 0;

        card.innerHTML = `
            <div class="repo-top">
                <span class="repo-name"><i class="fa-regular fa-folder"></i> ${repoName}</span>
                <span style="font-size: 0.8rem;"><i class="fa-regular fa-star"></i> ${stars}</span>
            </div>
            <p class="repo-desc">${repoDesc}</p>
            <div class="repo-meta">
                <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${langColor};margin-right:4px;"></span>${repoLang}</span>
            </div>
        `;

        repoContainer.appendChild(card);
    });
}

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

// Let's get this party started! 🚀
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 🥚 Easter Egg Logic - Because why not?
function initEasterEggs() {
    const snowBtn = document.getElementById('snow-btn');
    const fireworkBtn = document.getElementById('firework-btn');

    if (snowBtn) {
        snowBtn.addEventListener('click', toggleSnow);
    }

    if (fireworkBtn) {
        fireworkBtn.addEventListener('click', triggerFirework);
    }
}

// ❄️ Let it Snow Logic
let snowInterval = null;
let isSnowing = false;

function toggleSnow() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const btn = document.getElementById('snow-btn');
    isSnowing = !isSnowing;

    if (isSnowing) {
        btn.classList.add('btn-active');
        btn.innerHTML = '<i class="fa-regular fa-snowflake"></i> Stop Snow';
        startSnow();
    } else {
        btn.classList.remove('btn-active');
        btn.innerHTML = '<i class="fa-regular fa-snowflake"></i> Let it Snow';
        stopSnow();
    }
    btn.setAttribute('aria-pressed', String(isSnowing));
}

function startSnow() {
    if (snowInterval) return;
    // Start with a little flurry
    for (let i = 0; i < 5; i++) createSnowflake();
    snowInterval = setInterval(createSnowflake, 200);
}

function stopSnow() {
    clearInterval(snowInterval);
    snowInterval = null;
    document.querySelectorAll('.snowflake').forEach(el => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 1000);
    });
}

function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.setAttribute('aria-hidden', 'true');
    snowflake.textContent = '\u2744';
    snowflake.style.left = Math.random() * 100 + 'vw';

    const duration = Math.random() * 3 + 5; // Melt away!
    snowflake.style.animationName = 'fall, sway';
    snowflake.style.animationDuration = `${duration}s, ${Math.random() * 2 + 2}s`; // Sway 2-4s
    snowflake.style.animationDelay = `0s, ${Math.random() * -5}s`;
    snowflake.style.animationTimingFunction = 'linear, ease-in-out';
    snowflake.style.animationIterationCount = '1, infinite';

    snowflake.style.opacity = Math.random() * 0.7 + 0.3;
    snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';

    document.body.appendChild(snowflake);

    setTimeout(() => {
        snowflake.remove();
    }, duration * 1000);
}

// 🎆 Firework Logic - Boom!
const particles = [];
const colors = ['#ff0040', '#00ff80', '#4080ff', '#ffff00', '#ff8000', '#ff00ff', '#ffffff'];
let isFireworking = false;
let fireworkInterval = null;

function triggerFirework() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const btn = document.getElementById('firework-btn');
    isFireworking = !isFireworking;

    if (isFireworking) {
        btn.classList.add('btn-active');
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Stop Firework';
        startFirework();
    } else {
        btn.classList.remove('btn-active');
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Start Firework';
        stopFirework();
    }
    btn.setAttribute('aria-pressed', String(isFireworking));
}

function startFirework() {
    let canvas = document.getElementById('firework-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'firework-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Make sure we handle window resizing so the show goes on perfectly
    if (!window.fireworkResizeHandler) {
        window.fireworkResizeHandler = true;
        window.addEventListener('resize', () => {
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        });
    }

    // Fire start!
    launchEffect(canvas, ctx);

    // Keep the show going with a loop
    fireworkInterval = setInterval(() => {
        launchEffect(canvas, ctx);
    }, 800); // A nice steady rhythm
}

function stopFirework() {
    if (fireworkInterval) {
        clearInterval(fireworkInterval);
        fireworkInterval = null;
    }
}

function launchEffect(canvas, ctx) {
    createExplosion(
        Math.random() * canvas.width * 0.8 + canvas.width * 0.1,
        Math.random() * canvas.height * 0.5 + canvas.height * 0.1,
        colors[Math.floor(Math.random() * colors.length)],
        ctx
    );

    if (!window.fireworkLoopActive) {
        window.fireworkLoopActive = true;
        animateFireworks(canvas, ctx);
    }
}

function createExplosion(x, y, color, ctx) {
    const particleCount = 80;
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 5 + 2;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            alpha: 1,
            color: color,
            decay: Math.random() * 0.015 + 0.005,
            gravity: 0.1
        });
    }
}

function animateFireworks(canvas, ctx) {
    requestAnimationFrame(() => {
        // Create that lovely trailing effect
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Fade out fast enough to keep it clean
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.globalCompositeOperation = 'lighter';

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.96; // Air resistance is a thing
            p.vy *= 0.96;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
            } else {
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.globalCompositeOperation = 'source-over'; // Back to normal drawing

        if (particles.length > 0 || isFireworking) {
            animateFireworks(canvas, ctx);
        } else {
            window.fireworkLoopActive = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });
}

