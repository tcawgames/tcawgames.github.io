let allGamesData = {};
let currentCategory = 'all';

let settings = {
    glow: 50,
    panicKey: '`',
    tabCloak: 'clever',
    autoAboutBlank: false
};

const typewriterPhrases = [
    "unblocked web catalog & retro library.",
    "instant tab disguise with clever & drive cloaks.",
    "panic key routing directly to Google Classroom.",
    "HTML5 canvas, flash ruffle & multi-repo integration."
];

const memeImages = [
    "https://i.ibb.co/YBn9YZNZ/image.png",
    "https://i.ibb.co/Wvv0vMNv/image.png",
    "https://i.ibb.co/cXyMT7V4/images-q-tbn-ANd9-Gc-S4za-Cx-Z7-Zri-1-Sdfjh-Oxj-Sm-Yi-PLZwcdtg-5j-KKk-c-Fgy-HE-I06-YEydz-XF9-s-10.jpg"
];

const memeSounds = [
    "icons/angry.mp3",
    "icons/cool.mp3",
    "icons/funny.mp3",
    "icons/wow.mp3",
    "icons/yay.mp3"
];

let lastSoundTime = 0;

document.addEventListener('DOMContentLoaded', async () => {
    loadSettings();
    checkAboutBlankStatus();

    // Auto-launch about:blank if setting enabled and not already inside iframe/about:blank
    if (settings.autoAboutBlank && window.location.protocol !== 'about:' && window.self === window.top) {
        openAboutBlank();
    }

    // 3-second splash screen fade out
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

// Detect if page is running inside about:blank
function isInAboutBlank() {
    try {
        return window.location.protocol === 'about:' || window.top.location.protocol === 'about:';
    } catch (e) {
        return true; // Cross-origin top window context inside about:blank
    }
}

function checkAboutBlankStatus() {
    if (isInAboutBlank()) {
        const card = document.getElementById('about-blank-card');
        const title = document.getElementById('about-blank-title');
        const desc = document.getElementById('about-blank-desc');

        if (card && title && desc) {
            card.classList.add('in-about-blank');
            title.textContent = "you are already in about blank so theres honestly no point in clicking this! ";
            desc.textContent = "Click at your own risk...";
        }
    }
}

function handleAboutBlankClick() {
    if (isInAboutBlank()) {
        // Trigger Meme Easter Egg
        spawnFallingMeme();
        playRandomSound();
    } else {
        openAboutBlank();
    }
}

function spawnFallingMeme() {
    const img = document.createElement('img');
    const randomImg = memeImages[Math.floor(Math.random() * memeImages.length)];
    img.src = randomImg;
    img.className = 'falling-meme';

    // Randomize horizontal start position
    const randomX = Math.random() * (window.innerWidth - 120);
    img.style.left = `${randomX}px`;

    document.body.appendChild(img);

    // Clean up DOM after animation completes
    setTimeout(() => img.remove(), 3600);
}

function playRandomSound() {
    const now = Date.now();
    // 0.5s audio cooldown restriction
    if (now - lastSoundTime >= 500) {
        lastSoundTime = now;
        const randomSound = memeSounds[Math.floor(Math.random() * memeSounds.length)];
        const audio = new Audio(randomSound);
        audio.play().catch(e => console.log('Audio playback prevented or missing file:', e));
    }
}

function showView(viewName) {
    const flashSec = document.getElementById('flash-games-section');
    const retroSec = document.getElementById('retro-console-section');
    const proxySec = document.getElementById('proxy-section');

    flashSec.style.display = 'none';
    retroSec.style.display = 'none';
    proxySec.style.display = 'none';

    if (viewName === 'flash-games') {
        flashSec.style.display = 'block';
    } else if (viewName === 'retro-console') {
        retroSec.style.display = 'block';
    } else if (viewName === 'proxy') {
        proxySec.style.display = 'block';
    }
}

function openAboutBlank() {
    const win = window.open('about:blank', '_blank');
    if (win) {
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Clever | Portal</title>
                <link rel="icon" href="https://support.highlandschools.org/wp-content/uploads/2020/11/clever1.png">
                <style>body,html{margin:0;padding:0;width:100%;height:100%;overflow:hidden;}</style>
            </head>
            <body>
                <iframe src="${window.location.href}" style="width:100%;height:100%;border:none;"></iframe>
            </body>
            </html>
        `);
    }
}

function launchGame(id, game) {
    const playerView = document.getElementById('player-view');
    const titleDisplay = document.getElementById('game-title-display');
    const container = document.getElementById('player-frame-container');
    const iframe = document.getElementById('gameiframe');

    titleDisplay.textContent = game.name.toUpperCase();
    playerView.style.display = 'flex';

    let gameLink = game.link;
    if (gameLink.startsWith('../')) {
        gameLink = gameLink.substring(2);
    }

    if (gameLink.endsWith('.swf')) {
        iframe.style.display = 'none';
        
        const ruffleScript = document.createElement('script');
        ruffleScript.src = "https://unpkg.com/@ruffle-rs/ruffle";
        document.head.appendChild(ruffleScript);

        ruffleScript.onload = () => {
            const ruffle = window.RufflePlayer.newest();
            const player = ruffle.createPlayer();
            player.style.width = '100%';
            player.style.height = '100%';
            player.style.border = 'none';
            player.id = 'ruffle-player-instance';
            container.appendChild(player);
            player.load(gameLink);
        };
    } else {
        iframe.style.display = 'block';
        if (!gameLink.split('/').pop().includes('.') && !gameLink.endsWith('/')) {
            gameLink += '/';
        }
        iframe.src = gameLink;
    }
}

function closePlayer() {
    const playerView = document.getElementById('player-view');
    const iframe = document.getElementById('gameiframe');
    const ruffleInstance = document.getElementById('ruffle-player-instance');

    if (ruffleInstance) ruffleInstance.remove();
    iframe.src = '';
    playerView.style.display = 'none';
}

function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else if (document.exitFullscreen) document.exitFullscreen();
}

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
            typeSpeed = 2200;
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            phraseIdx = (phraseIdx + 1) % typewriterPhrases.length;
            typeSpeed = 400;
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
    document.getElementById('auto-about-blank-toggle').checked = settings.autoAboutBlank || false;
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
        title.textContent = 'tcaw.';
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

        card.addEventListener('click', () => launchGame(id, game));
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

    document.getElementById('auto-about-blank-toggle').addEventListener('change', (e) => {
        settings.autoAboutBlank = e.target.checked;
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
