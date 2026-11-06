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
                <span class="repo-stars"><i class="fa-regular fa-star"></i> ${stars}</span>
            </div>
            <p class="repo-desc">${repoDesc}</p>
            <div class="repo-meta">
                <span><span class="lang-dot" style="background:${langColor};"></span>${repoLang}</span>
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
// Always open at the top. Browsers restore the last scroll position on
// reload and tab restore, which buried the hero after a visit to the
// create form further down the page, and a leftover #create in the URL
// jumped straight to the form. This runs before init on purpose: the
// browser restores scroll around DOMContentLoaded, so setting it inside
// init is too late. Clicking an in-page link later still scrolls.
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
}
window.scrollTo(0, 0);
window.addEventListener('load', () => {
    if (!window.location.hash) {
        window.scrollTo(0, 0);
    }
});

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

// Both effects draw on their own full-screen canvas. The physics runs on
// delta time (seconds), so speed does not depend on the display's refresh
// rate, and each loop stops by itself once its particles are gone.
function getEffectCanvas(id) {
    let canvas = document.getElementById(id);
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = id;
        canvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(canvas);
    }
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    if (!canvas.dataset.sized) {
        canvas.dataset.sized = '1';
        resize();
        window.addEventListener('resize', resize);
    }
    return canvas;
}

// ❄️ Let it Snow — flakes with depth (far ones are smaller, slower and
// fainter), a gusting wind, and a per-flake flutter, so the fall wobbles
// instead of sliding down a rail.
const snowState = { flakes: [], running: false, last: 0, windPhase: 0, fade: 1, draining: false };
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

function newFlake(canvas, anywhere) {
    const depth = Math.random();
    return {
        x: Math.random() * canvas.width,
        y: anywhere ? Math.random() * canvas.height : -5,
        r: 0.8 + depth * 2.4,
        speed: 22 + depth * 55,
        depth,
        phase: Math.random() * Math.PI * 2,
        flutter: 0.6 + Math.random() * 1.4,
        alpha: 0.35 + depth * 0.6
    };
}

function startSnow() {
    const canvas = getEffectCanvas('snow-canvas');
    snowState.draining = false;
    snowState.fade = 1;

    const target = Math.min(160, Math.floor(canvas.width / 9));
    while (snowState.flakes.length < target) {
        snowState.flakes.push(newFlake(canvas, true));
    }

    if (!snowState.running) {
        snowState.running = true;
        snowState.last = performance.now();
        requestAnimationFrame(t => snowTick(t, canvas));
    }
}

function stopSnow() {
    // Stop spawning and fade what is left; the loop ends itself.
    snowState.draining = true;
}

function snowTick(now, canvas) {
    const ctx = canvas.getContext('2d');
    const dt = Math.min((now - snowState.last) / 1000, 0.05);
    snowState.last = now;

    snowState.windPhase += dt * 0.25;
    const wind = Math.sin(snowState.windPhase) * 14 + Math.sin(snowState.windPhase * 0.37) * 8;

    if (snowState.draining) {
        snowState.fade = Math.max(0, snowState.fade - dt * 1.4);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';

    snowState.flakes = snowState.flakes.filter(f => f.y < canvas.height + 6);
    while (!snowState.draining && snowState.flakes.length < Math.min(160, Math.floor(canvas.width / 9))) {
        snowState.flakes.push(newFlake(canvas, false));
    }

    for (const f of snowState.flakes) {
        f.phase += dt * f.flutter;
        f.x += (wind * (0.4 + f.depth * 0.6) + Math.sin(f.phase) * 10) * dt;
        f.y += f.speed * dt * (1 + 0.15 * Math.sin(f.phase * 0.7));
        if (f.x < -6) f.x = canvas.width + 6;
        if (f.x > canvas.width + 6) f.x = -6;

        ctx.globalAlpha = f.alpha * snowState.fade;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (snowState.draining && snowState.fade <= 0) {
        snowState.running = false;
        snowState.flakes = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    requestAnimationFrame(t => snowTick(t, canvas));
}

// 🎆 Fireworks — a rocket climbs with a spark trail and bursts at its apex.
// Particles vary in size, drag and life; some twinkle, a few crackle into
// mini sparks mid-flight, and some bursts get a tighter inner ring (pistil).
const fwState = { rockets: [], parts: [], running: false, last: 0 };
const FW_HUES = [350, 150, 210, 55, 25, 300, 0];
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
    const canvas = getEffectCanvas('firework-canvas');
    launchRocket(canvas);
    fireworkInterval = setInterval(() => launchRocket(canvas), 750);

    if (!fwState.running) {
        fwState.running = true;
        fwState.last = performance.now();
        requestAnimationFrame(t => fireworkTick(t, canvas));
    }
}

function stopFirework() {
    // No new rockets; what is in the sky burns out and the loop ends itself.
    if (fireworkInterval) {
        clearInterval(fireworkInterval);
        fireworkInterval = null;
    }
}

function launchRocket(canvas) {
    fwState.rockets.push({
        x: canvas.width * (0.12 + Math.random() * 0.76),
        y: canvas.height + 4,
        vx: (Math.random() - 0.5) * 24,
        vy: -(560 + Math.random() * 190),
        targetY: canvas.height * (0.16 + Math.random() * 0.3),
        hue: FW_HUES[Math.floor(Math.random() * FW_HUES.length)],
        wobble: Math.random() * Math.PI * 2
    });
}

function explode(x, y, hue) {
    const count = 70 + Math.floor(Math.random() * 40);
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 90 + 290 * Math.pow(Math.random(), 0.5);
        fwState.parts.push({
            x, y,
            px: x, py: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            ttl: 1.1 + Math.random() * 0.9,
            size: 1 + Math.random() * 1.6,
            hue: hue + (Math.random() - 0.5) * 24,
            light: 55 + Math.random() * 20,
            twinkle: Math.random() < 0.35,
            phase: Math.random() * Math.PI * 2,
            crackle: Math.random() < 0.12,
            crackled: false,
            dragK: 1.6 + Math.random() * 0.8
        });
    }

    // Pistil: a tighter, slower inner ring in a shifted hue.
    if (Math.random() < 0.35) {
        for (let i = 0; i < 24; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + 90 * Math.random();
            fwState.parts.push({
                x, y,
                px: x, py: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0,
                ttl: 0.8 + Math.random() * 0.5,
                size: 1 + Math.random(),
                hue: hue + 40,
                light: 65,
                twinkle: false,
                phase: 0,
                crackle: false,
                crackled: true,
                dragK: 1.8
            });
        }
    }

    if (fwState.parts.length > 500) {
        fwState.parts.splice(0, fwState.parts.length - 500);
    }
}

function fireworkTick(now, canvas) {
    const ctx = canvas.getContext('2d');
    const dt = Math.min((now - fwState.last) / 1000, 0.05);
    fwState.last = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    // Rockets: gravity bleeds their climb until the apex or the target
    // height, where they burst. A short bright streak is their trail.
    fwState.rockets = fwState.rockets.filter(r => {
        r.wobble += dt * 6;
        r.vy += 300 * dt;
        r.x += r.vx * dt + Math.sin(r.wobble) * 6 * dt;
        r.y += r.vy * dt;

        ctx.strokeStyle = 'rgba(255, 240, 200, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(r.x - r.vx * 0.03, r.y - r.vy * 0.03);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();

        // Loose sparks shed on the way up.
        if (Math.random() < 0.6) {
            fwState.parts.push({
                x: r.x, y: r.y,
                px: r.x, py: r.y,
                vx: (Math.random() - 0.5) * 30,
                vy: 40 + Math.random() * 40,
                life: 0,
                ttl: 0.3 + Math.random() * 0.3,
                size: 0.8,
                hue: 45,
                light: 70,
                twinkle: false,
                phase: 0,
                crackle: false,
                crackled: true,
                dragK: 1
            });
        }

        if (r.vy >= -60 || r.y <= r.targetY) {
            explode(r.x, r.y, r.hue);
            return false;
        }
        return true;
    });

    // Particles: exponential drag, gravity, fade-out, optional twinkle and
    // one crackle pop. Drawn as short streaks along their motion.
    fwState.parts = fwState.parts.filter(p => p.life < p.ttl);
    for (const p of fwState.parts) {
        p.px = p.x;
        p.py = p.y;
        const drag = Math.exp(-p.dragK * dt);
        p.vx *= drag;
        p.vy = p.vy * drag + 320 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life += dt;

        if (p.crackle && !p.crackled && p.life > p.ttl * 0.55) {
            p.crackled = true;
            for (let i = 0; i < 3; i++) {
                fwState.parts.push({
                    x: p.x, y: p.y,
                    px: p.x, py: p.y,
                    vx: p.vx + (Math.random() - 0.5) * 120,
                    vy: p.vy + (Math.random() - 0.5) * 120,
                    life: 0,
                    ttl: 0.25 + Math.random() * 0.2,
                    size: 0.7,
                    hue: p.hue,
                    light: 80,
                    twinkle: false,
                    phase: 0,
                    crackle: false,
                    crackled: true,
                    dragK: 1
                });
            }
        }

        let alpha = 1 - p.life / p.ttl;
        alpha *= alpha;
        if (p.twinkle) {
            alpha *= 0.55 + 0.45 * Math.sin(p.life * 40 + p.phase);
        }

        ctx.strokeStyle = `hsla(${p.hue}, 100%, ${p.light}%, ${Math.max(alpha, 0)})`;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';

    if (!isFireworking && fwState.rockets.length === 0 && fwState.parts.length === 0) {
        fwState.running = false;
        return;
    }

    requestAnimationFrame(t => fireworkTick(t, canvas));
}
