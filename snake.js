// Coba coba aja ya

const canvas = document.createElement('canvas');
canvas.width = 320;
canvas.height = 320;
const ctx = canvas.getContext('2d');
document.getElementById('game-area').appendChild(canvas);

let snake = [{ x: 160, y: 160 }];
let direction = { x: 0, y: -20 };
let food = { x: 80, y: 80 };

function gameLoop() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x < 0 || head.x >= 320 || head.y < 0 || head.y >= 320 || snake.some(s => s.x === head.x && s.y === head.y)) {
        return alert('Game Over!');
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        food = { x: Math.floor(Math.random() * 16) * 20, y: Math.floor(Math.random() * 16) * 20 };
    } else {
        snake.pop();
    }

    ctx.clearRect(0, 0, 320, 320);
    ctx.fillStyle = 'green';
    snake.forEach(s => ctx.fillRect(s.x, s.y, 20, 20));

    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, 20, 20);
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && direction.y === 0) direction = { x: 0, y: -20 };
    if (e.key === 'ArrowDown' && direction.y === 0) direction = { x: 0, y: 20 };
    if (e.key === 'ArrowLeft' && direction.x === 0) direction = { x: -20, y: 0 };
    if (e.key === 'ArrowRight' && direction.x === 0) direction = { x: 20, y: 0 };
});

setInterval(gameLoop, 100);
