// Update Year
function init() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Initialize Easter Eggs
    initEasterEggs();

    // Fetch GitHub Repos
    const repoContainer = document.getElementById('repo-list');
    const username = 'aqles';

    if (!repoContainer) return;

    async function fetchRepos() {
        try {
            // Add timeout signal (5 seconds)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=6`, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

            const repos = await response.json();

            // Clear loader
            repoContainer.innerHTML = '';

            if (!Array.isArray(repos) || repos.length === 0) {
                repoContainer.innerHTML = '<p style="text-align:center; color:#888;">No repositories found.</p>';
                return;
            }

            repos.forEach(repo => {
                const card = document.createElement('a');
                card.href = repo.html_url;
                card.target = '_blank';
                card.className = 'repo-card';

                // Format language color (basic)
                const langColor = getLanguageColor(repo.language);

                // Escape HTML content to prevent XSS (basic)
                const repoName = escapeHtml(repo.name);
                const repoDesc = escapeHtml(repo.description || 'No description available.');
                const repoLang = escapeHtml(repo.language || 'Code');
                const stars = repo.stargazers_count || 0;

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

        } catch (error) {
            console.error('Error fetching repos:', error);
            // Fallback UI
            repoContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center;">
                    <p style="color: #ff6b6b; margin-bottom: 1rem;">
                        <i class="fa-solid fa-circle-exclamation"></i>
                        Unable to load projects (${error.name === 'AbortError' ? 'Timeout' : 'Error'}).
                    </p>
                    <a href="https://github.com/${username}?tab=repositories" target="_blank" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                        View on GitHub
                    </a>
                </div>
            `;
        }
    }

    fetchRepos();
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

// Run init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Easter Egg Logic
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

// Snow Logic
let snowInterval = null;
let isSnowing = false;

function toggleSnow() {
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
}

function startSnow() {
    if (snowInterval) return;
    // initial burst
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
    snowflake.textContent = '\u2744';
    snowflake.style.left = Math.random() * 100 + 'vw';

    const duration = Math.random() * 3 + 5; // 5-8s fall
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

// Firework Logic
function triggerFirework() {
    const btn = document.getElementById('firework-btn');
    btn.classList.add('btn-active');

    let canvas = document.getElementById('firework-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'firework-canvas';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, { once: true });

    const particles = [];
    const colors = ['#ff0040', '#00ff80', '#4080ff', '#ffff00', '#ff8000', '#ff00ff', '#ffffff'];

    // Launch sequence
    let launchCount = 0;
    const launchInterval = setInterval(() => {
        launchCount++;
        createExplosion(
            Math.random() * canvas.width * 0.8 + canvas.width * 0.1,
            Math.random() * canvas.height * 0.5 + canvas.height * 0.1,
            colors[Math.floor(Math.random() * colors.length)],
            ctx, particles
        );

        if (launchCount >= 8) {
            clearInterval(launchInterval);
            setTimeout(() => {
                btn.classList.remove('btn-active');
            }, 2000);
        }
    }, 400);

    if (!window.fireworkLoopActive) {
        window.fireworkLoopActive = true;
        animateFireworks(canvas, ctx, particles);
    }
}

function createExplosion(x, y, color, ctx, particles) {
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

function animateFireworks(canvas, ctx, particles) {
    requestAnimationFrame(() => {
        // Create trail effect
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.globalCompositeOperation = 'lighter';

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.96; // air resistance
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

        ctx.globalCompositeOperation = 'source-over'; // Reset

        if (particles.length > 0) {
            animateFireworks(canvas, ctx, particles);
        } else {
            window.fireworkLoopActive = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });
}

