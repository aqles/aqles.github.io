function startGame(game) {
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = '';
    if (game === 'snake') {
        loadScript('snake.js');
    } else if (game === 'tetris') {
        loadScript('games/tetris.js');
    }
}

function loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    document.body.appendChild(script);
}
