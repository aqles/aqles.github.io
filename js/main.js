// Update Year
document.getElementById('year').textContent = new Date().getFullYear();

// Fetch GitHub Repos
const repoContainer = document.getElementById('repo-list');
const username = 'aqles';

async function fetchRepos() {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=6`);
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const repos = await response.json();
        
        // Clear loader
        repoContainer.innerHTML = '';
        
        if (repos.length === 0) {
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

            card.innerHTML = `
                <div class="repo-top">
                    <span class="repo-name"><i class="fa-regular fa-folder"></i> ${repo.name}</span>
                    <span style="font-size: 0.8rem;"><i class="fa-regular fa-star"></i> ${repo.stargazers_count}</span>
                </div>
                <p class="repo-desc">${repo.description || 'No description available for this cool project.'}</p>
                <div class="repo-meta">
                    <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${langColor};margin-right:4px;"></span>${repo.language || 'Code'}</span>
                </div>
            `;
            
            repoContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching repos:', error);
        repoContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center;">
                <p style="color: #ff6b6b; margin-bottom: 1rem;">Unable to load projects right now.</p>
                <a href="https://github.com/${username}" target="_blank" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">View on GitHub</a>
            </div>
        `;
    }
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
        'PHP': '#4F5D95'
    };
    return colors[language] || '#ffffff';
}

// Init
fetchRepos();
