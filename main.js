let allGamesData = {};
let currentCategory = 'all';

// Default settings state set to Clever
let settings = {
    glow: 50,
    panicKey: '`',
    tabCloak: 'clever'
};

// Typewriter phrases to cycle through
const typewriterPhrases = [
    "unblocked web catalog & retro library.",
    "instant tab disguise with clever & drive cloaks.",
    "panic key routing directly to Google Classroom.",
    "HTML5 canvas, flash ruffle & multi-repo integration."
];

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

    startTypewriter();
    await fetchGames();
    setupEventListeners();
});

// Backspace Typewriter Animation Engine
function startTypewriter() {
    const target = document.getElementById('typewriter-text');
    if (!target) return;

    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    function type() {
        const currentPhrase = typewriterPhrases[phraseIdx];
        
        if (isDeleting) {
            target.textContent = currentPhrase.substring(0, charIdx - 1);
            charIdx--;
        } else {
            target.textContent = currentPhrase.substring(0, charIdx + 1);
            charIdx++;
        }

        let typeSpeed = isDeleting ? 30 : 60;

        if (!isDeleting && charIdx === currentPhrase.length) {
            typeSpeed = 2200; // Pause at full phrase
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            phraseIdx = (phraseIdx + 1) % typewriterPhrases.length;
            typeSpeed = 400; // Pause before typing next phrase
        }

        setTimeout(type, typeSpeed);
    }

    type();
}

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
        favicon.href = 'https://support.highlandschools.org/wp-content/uploads/2020/11/clever1.png';
    } else if (type === 'classroom') {
        title.textContent = 'Classes';
        favicon.href = 'https://ssl.gstatic.com/classroom/favicon.png';
    } else if (type === 'drive') {
        title.textContent = 'My Drive - Google Drive';
        favicon.href = 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png';
    } else {
        title.textContent = 'tcaw';
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

// Generate an SVG data URI for missing game covers
function generateDynamicCover(name) {
    const initial = (name || 'G').charAt(0).toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#0b140b"/>
        <circle cx="100" cy="100" r="70" fill="#102610" stroke="#00ff66" stroke-width="2" stroke-dasharray="4"/>
        <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#00ff66" font-family="Poppins, sans-serif" font-size="64" font-weight="700">${initial}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
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

        let coverSrc = generateDynamicCover(game.name);
        if (game.cover) {
            if (game.link && game.link.startsWith('../')) {
                const repoFolder = game.link.split('/')[1]; 
                coverSrc = `/${repoFolder}/${game.cover}`;
            } else {
                coverSrc = game.cover;
            }
        }

        const fallbackSvg = generateDynamicCover(game.name);

        card.innerHTML = `
            <img class="game-thumb" src="${coverSrc}" alt="${game.name}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackSvg}';">
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
