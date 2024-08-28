const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.getElementById('game-area').appendChild(canvas);

let snake, direction, food, intervalId;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gridSize = 20; // Ukuran grid selalu tetap

function resizeCanvas() {
    const gameArea = document.getElementById('game-area');
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
    canvas.width = size;
    canvas.height = size;

    // ini harus dinamis juga
    snake.forEach(segment => {
        segment.x = Math.floor(segment.x / gridSize) * gridSize;
        segment.y = Math.floor(segment.y / gridSize) * gridSize;
    });
    
    food.x = Math.floor(food.x / gridSize) * gridSize;
    food.y = Math.floor(food.y / gridSize) * gridSize;
}

window.addEventListener('resize', resizeCanvas);

function initGame() {
    snake = [{ x: Math.floor(canvas.width / 2 / gridSize) * gridSize, y: Math.floor(canvas.height / 2 / gridSize) * gridSize }];
    direction = { x: 0, y: -gridSize };
    food = generateFood();
    score = 0;

    hideGameOverPopup();

    if (intervalId) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(gameLoop, 100);
}

function generateFood() {
    return {
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
    };
}

function gameLoop() {
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    if (
        head.x < 0 ||
        head.x >= canvas.width ||
        head.y < 0 ||
        head.y >= canvas.height ||
        snake.some(s => s.x === head.x && s.y === head.y)
    ) {
        gameOver();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
        food = generateFood();
    } else {
        snake.pop();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'green';
    snake.forEach(s => ctx.fillRect(s.x, s.y, gridSize, gridSize));

    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, gridSize, gridSize);

    ctx.fillStyle = 'white';
    ctx.font = `${canvas.width / 20}px Arial`;
    ctx.fillText(`Score: ${score}`, 10, canvas.width / 20);
    ctx.fillText(`High Score: ${highScore}`, 10, canvas.width / 10);
}

function gameOver() {
    clearInterval(intervalId);
    showGameOverPopup();
}

function showGameOverPopup() {
    const popup = document.createElement('div');
    popup.id = 'game-over-popup';
    popup.innerHTML = `
        <div id="popup-content">
            <h2>Game Over</h2>
            <p>Your score: ${score}</p>
            <p>High score: ${highScore}</p>
            <button id="restart-button">Start Again</button>
        </div>
    `;
    document.body.appendChild(popup);

    document.getElementById('restart-button').addEventListener('click', initGame);
}

function hideGameOverPopup() {
    const popup = document.getElementById('game-over-popup');
    if (popup) {
        popup.remove();
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && direction.y === 0) direction = { x: 0, y: -gridSize };
    if (e.key === 'ArrowDown' && direction.y === 0) direction = { x: 0, y: gridSize };
    if (e.key === 'ArrowLeft' && direction.x === 0) direction = { x: -gridSize, y: 0 };
    if (e.key === 'ArrowRight' && direction.x === 0) direction = { x: gridSize, y: 0 };
});

initGame();
