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

        // Dynamically grab the image from the correct cloud repository
        let coverSrc = 'icons/favicon.png'; // Fallback
        if (game.cover) {
            // Check if the game is in a secondary repo (e.g., "../cloud0/...")
            if (game.link && game.link.startsWith('../')) {
                // Extracts the repository name (e.g., "cloud", "cloud0", "cloud1")
                const repoFolder = game.link.split('/')[1]; 
                
                // Constructs the image URL to point to that repository
                coverSrc = `/${repoFolder}/${game.cover}`; 
            } else {
                coverSrc = game.cover;
            }
        }

        card.innerHTML = `
            <img class="game-thumb" src="${coverSrc}" alt="${game.name}" loading="lazy" onerror="this.src='icons/favicon.png'">
            <div class="game-info">
                <h3 class="game-title">${game.name}</h3>
                <span class="game-category">${game.catagory || 'casual'}</span>
            </div>
        `;

        card.addEventListener('click', () => {
            window.location.href = `play.html?id=${encodeURIComponent(id)}&link=${encodeURIComponent(game.link)}`;
        });

        grid.appendChild(card);
    });
}
