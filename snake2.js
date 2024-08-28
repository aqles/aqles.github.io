const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.getElementById('game-area').appendChild(canvas);

let snake, direction, food, intervalId;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gridSize = 20;
let numCellsX, numCellsY;

function setCanvasSize(size) {
    switch (size) {
        case 'small':
            numCellsX = 20;
            numCellsY = 20;
            break;
        case 'medium':
            numCellsX = 30;
            numCellsY = 30;
            break;
        case 'large':
            numCellsX = 40;
            numCellsY = 40;
            break;
        default:
            numCellsX = 30;
            numCellsY = 30;
            break;
    }

    canvas.width = numCellsX * gridSize;
    canvas.height = numCellsY * gridSize;
}

function initGame(size = 'medium') {
    setCanvasSize(size);
    snake = [{
        x: Math.floor(numCellsX / 2) * gridSize,
        y: Math.floor(numCellsY / 2) * gridSize,
    }];
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
        x: Math.floor(Math.random() * numCellsX) * gridSize,
        y: Math.floor(Math.random() * numCellsY) * gridSize
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

    document.getElementById('restart-button').addEventListener('click', () => {
        const size = prompt("Choose size: small, medium, large", "medium");
        initGame(size);
    });
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

// Memulai permainan dengan ukuran default 'medium'
const initialSize = prompt("Choose size: small, medium, large", "medium");
initGame(initialSize);
