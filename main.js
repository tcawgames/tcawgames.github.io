let allGamesData = {};
let currentCategory = 'all';

// Embedded SVG Clever icon for consistent rendering across browsers
const cleverIconData = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%231f69ff' d='M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256 256-114.6 256-256S397.4 0 256 0zm0 392c-75.1 0-136-60.9-136-136s60.9-136 136-136 136 60.9 136 136-60.9 136-136 136z'/%3E%3C/svg%3E";

let settings = {
    glow: 50,
    panicKey: '`',
    tabCloak: 'clever'
};

document.addEventListener('DOMContentLoaded', async () => {
    loadSettings();

    // 3-second splash screen fade out & removal
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.add('hidden');
            setTimeout(() => splash.remove(), 600);
        }
    }, 3000);

    await fetchGames();
    setupEventListeners();
});

function loadSettings() {
    const saved = localStorage.getItem('tcawSettings');
    if (saved) settings = JSON.parse(saved);

    if (!settings.tabCloak) settings.tabCloak = 'clever';

    document.getElementById('glow-slider').value = settings.glow;
    document.documentElement.style.setProperty('--neon-glow', `rgba(0, 255, 102, ${settings.glow / 200})`);
    
    document.getElementById('panic-key-btn').textContent = `Key: ${settings.panicKey}`;
    document.getElementById('tab-cloak').value = settings.tabCloak;
    applyTabCloak(settings.tabCloak);
}

function saveSettings() {
    localStorage.setItem('tcawSettings', JSON.stringify(settings));
}

function applyTabCloak(type) {
    const title = document.getElementById('page-title');
    let favicon = document.getElementById('page-favicon');

    if (!favicon) {
        favicon = document.createElement('link');
        favicon.id = 'page-favicon';
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
    }
    
    if (type === 'clever') {
        title.textContent = 'Clever | Portal';
        favicon.href = cleverIconData;
    } else if (type === 'classroom') {
        title.textContent = 'Classes';
        favicon.href = 'https://ssl.gstatic.com/classroom/favicon.png';
    } else if (type === 'drive') {
        title.textContent = 'My Drive - Google Drive';
        favicon.href = 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png';
    } else {
        title.textContent = 'TcawMath';
        favicon.href = '/icons/favicon.png';
    }
}

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
        if (['casual', 'popular', 'recommended', 'all'].includes(cat.toLowerCase())) return;
        
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.dataset.category = cat.toLowerCase();
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
        let matchesCat = false;

        if (currentCategory === 'all') matchesCat = true;
        else if (currentCategory === 'popular' && game.popular) matchesCat = true;
        else if (currentCategory === 'recommended' && game.recommended) matchesCat = true;
        else if (game.catagory && game.catagory.toLowerCase().includes(currentCategory)) matchesCat = true;

        return matchesQuery && matchesCat;
    });

    if (filteredEntries.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-muted); grid-column: 1/-1; text-align: center; padding: 40px;">No games match this category or search.</p>';
        return;
    }

    filteredEntries.forEach(([id, game], index) => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.style.animationDelay = `${index * 0.02}s`;

        let coverSrc = '/icons/favicon.png';
        if (game.cover) {
            if (game.link && game.link.startsWith('../')) {
                const repoFolder = game.link.split('/')[1]; 
                coverSrc = `/${repoFolder}/${game.cover}`;
            } else {
                coverSrc = game.cover;
            }
        }

        card.innerHTML = `
            <img class="game-thumb" src="${coverSrc}" alt="${game.name}" loading="lazy" onerror="this.src='/icons/favicon.png'">
            <div class="game-info">
                <h3 class="game-title">${game.name}</h3>
                <span class="game-category">${game.catagory || 'casual'}</span>
            </div>
        `;

        card.addEventListener('click', () => {
            window.location.href = `learn?id=${encodeURIComponent(id)}&link=${encodeURIComponent(game.link)}`;
        });

        grid.appendChild(card);
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => renderGames(allGamesData, e.target.value));

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
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

    document.getElementById('glow-slider').addEventListener('input', (e) => {
        settings.glow = e.target.value;
        document.documentElement.style.setProperty('--neon-glow', `rgba(0, 255, 102, ${settings.glow / 200})`);
        saveSettings();
    });

    document.getElementById('tab-cloak').addEventListener('change', (e) => {
        settings.tabCloak = e.target.value;
        applyTabCloak(settings.tabCloak);
        saveSettings();
    });

    const panicBtn = document.getElementById('panic-key-btn');
    panicBtn.addEventListener('click', () => {
        panicBtn.textContent = 'Press any key...';
        panicBtn.classList.add('listening');
        
        const keyHandler = (e) => {
            e.preventDefault();
            settings.panicKey = e.key;
            panicBtn.textContent = `Key: ${settings.panicKey}`;
            panicBtn.classList.remove('listening');
            saveSettings();
            document.removeEventListener('keydown', keyHandler);
        };
        document.addEventListener('keydown', keyHandler);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === settings.panicKey && document.activeElement.tagName !== 'INPUT') {
            window.location.href = 'https://classroom.google.com';
        }
    });
}
