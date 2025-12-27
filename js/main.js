// Update Year
function init() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

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
