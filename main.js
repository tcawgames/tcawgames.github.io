let allGamesData = {};
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    await fetchGames();
    setupEventListeners();
});

async function fetchGames() {
    try {
        const response = await fetch('games.json');
        allGamesData = await response.json();
        buildCategories();
        renderGames(allGamesData);
    } catch (error) {
        console.error('Failed to load games.json:', error);
        document.getElementById('game-grid').innerHTML = '<p style="color:var(--text-muted)">Failed to load games catalog.</p>';
    }
}

function buildCategories() {
    const categoriesSet = new Set();
    Object.values(allGamesData).forEach(game => {
        if (game.catagory) {
            game.catagory.split(' ').forEach(cat => categoriesSet.add(cat.trim()));
        }
    });

    const tabsBar = document.getElementById('tabs-bar');
    categoriesSet.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.dataset.category = cat;
        btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        tabsBar.appendChild(btn);
    });
}

function renderGames(gamesObj, searchQuery = '') {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = '';

    const query = searchQuery.toLowerCase().trim();

    const filteredEntries = Object.entries(gamesObj).filter(([id, game]) => {
        const matchesQuery = game.name.toLowerCase().includes(query);
        const matchesCat = currentCategory === 'all' || (game.catagory && game.catagory.toLowerCase().includes(currentCategory));
        return matchesQuery && matchesCat;
    });

    if (filteredEntries.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-muted); grid-column: 1/-1; text-align: center; padding: 40px;">No games found.</p>';
        return;
    }

    filteredEntries.forEach(([id, game], index) => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.style.animationDelay = `${index * 0.03}s`;

        // Covers directory fallback or direct asset
        const coverSrc = game.cover ? `covers/${game.cover}` : 'icons/favicon.png';

        card.innerHTML = `
            <img class="game-thumb" src="${coverSrc}" alt="${game.name}" loading="lazy" onerror="this.src='icons/favicon.png'">
            <div class="game-info">
                <h3 class="game-title">${game.name}</h3>
                <span class="game-category">${game.catagory || 'casual'}</span>
            </div>
        `;

        // Redirects to play.html passing game ID and path configuration
        card.addEventListener('click', () => {
            window.location.href = `play.html?id=${encodeURIComponent(id)}&link=${encodeURIComponent(game.link)}`;
        });

        grid.appendChild(card);
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        renderGames(allGamesData, e.target.value);
    });

    const tabsBar = document.getElementById('tabs-bar');
    tabsBar.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            renderGames(allGamesData, searchInput.value);
        }
    });

    const modal = document.getElementById('settings-modal');
    document.getElementById('open-settings').addEventListener('click', () => modal.classList.add('active'));
    document.getElementById('close-settings').addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    const glowSlider = document.getElementById('glow-slider');
    glowSlider.addEventListener('input', (e) => {
        const val = e.target.value / 100;
        document.documentElement.style.setProperty('--neon-glow', `rgba(0, 255, 102, ${val * 0.5})`);
    });
}
