// why

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.getElementById('game-area').appendChild(canvas);

let snake, direction, food, intervalId;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

function resizeCanvas() {
    const gameArea = document.getElementById('game-area');
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
    canvas.width = size;
    canvas.height = size;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function initGame() {
    snake = [{ x: canvas.width / 2, y: canvas.height / 2 }];
    direction = { x: 0, y: -20 };
    food = {
        x: Math.floor(Math.random() * (canvas.width / 20)) * 20,
        y: Math.floor(Math.random() * (canvas.height / 20)) * 20
    };
    score = 0;

    hideGameOverPopup();

    if (intervalId) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(gameLoop, 100);
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
        food = {
            x: Math.floor(Math.random() * (canvas.width / 20)) * 20,
            y: Math.floor(Math.random() * (canvas.height / 20)) * 20
        };
    } else {
        snake.pop();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'green';
    snake.forEach(s => ctx.fillRect(s.x, s.y, 20, 20));

    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, 20, 20);

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
    if (e.key === 'ArrowUp' && direction.y === 0) direction = { x: 0, y: -20 };
    if (e.key === 'ArrowDown' && direction.y === 0) direction = { x: 0, y: 20 };
    if (e.key === 'ArrowLeft' && direction.x === 0) direction = { x: -20, y: 0 };
    if (e.key === 'ArrowRight' && direction.x === 0) direction = { x: 20, y: 0 };
});

initGame();
