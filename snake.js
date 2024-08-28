// Cuba cuba aja ya coy

const canvas = document.createElement('canvas');
canvas.width = 320;
canvas.height = 320;
const ctx = canvas.getContext('2d');
document.getElementById('game-area').appendChild(canvas);

let snake, direction, food, intervalId;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

function initGame() {
    snake = [{ x: 160, y: 160 }];
    direction = { x: 0, y: -20 };
    food = { x: 80, y: 80 };
    score = 0;

    if (intervalId) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(gameLoop, 100);
}

function gameLoop() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x < 0 || head.x >= 320 || head.y < 0 || head.y >= 320 || snake.some(s => s.x === head.x && s.y === head.y)) {
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
        food = { x: Math.floor(Math.random() * 16) * 20, y: Math.floor(Math.random() * 16) * 20 };
    } else {
        snake.pop();
    }

    ctx.clearRect(0, 0, 320, 320);
    ctx.fillStyle = 'green';
    snake.forEach(s => ctx.fillRect(s.x, s.y, 20, 20));

    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, 20, 20);

    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`High Score: ${highScore}`, 10, 40);
}

function gameOver() {
    clearInterval(intervalId);
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Game Over', 100, 160);
    ctx.fillText('Press Space to Play Again', 20, 200);
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && direction.y === 0) direction = { x: 0, y: -20 };
    if (e.key === 'ArrowDown' && direction.y === 0) direction = { x: 0, y: 20 };
    if (e.key === 'ArrowLeft' && direction.x === 0) direction = { x: -20, y: 0 };
    if (e.key === 'ArrowRight' && direction.x === 0) direction = { x: 20, y: 0 };
    if (e.key === ' ') initGame(); // Restart the game when the space bar is pressed
});

initGame();
