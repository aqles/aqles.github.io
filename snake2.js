//iseng bro
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.getElementById('game-area').appendChild(canvas);

let snake, direction, food, intervalId;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gridSize = 20;
let numCellsX, numCellsY;
let speed = 200; // Kecepatan awal dalam milidetik (lebih lambat)
let level = 1;

function setCanvasSize(widthGrids, heightGrids) {
    numCellsX = widthGrids;
    numCellsY = heightGrids;

    canvas.width = numCellsX * gridSize;
    canvas.height = numCellsY * gridSize;
}

function initGame(widthGrids, heightGrids) {
    setCanvasSize(widthGrids, heightGrids);
    snake = [{
        x: Math.floor(numCellsX / 2) * gridSize,
        y: Math.floor(numCellsY / 2) * gridSize,
    }];
    direction = { x: 0, y: -gridSize };
    food = generateFood();
    score = 0;
    level = 1;
    speed = 200; // Kecepatan awal permainan

    hideGameOverPopup();

    if (intervalId) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(gameLoop, speed);
}

function generateFood() {
    return {
        x: Math.floor(Math.random() * numCellsX) * gridSize,
        y: Math.floor(Math.random() * numCellsY) * gridSize
    };
}

function updateSpeed() {
    const newLevel = Math.floor(score / 20) + 1;
    if (newLevel > level) {
        level = newLevel;
        speed = Math.max(100, 150 - (level - 1) * 10); // Maksimal speed 100 ms
        clearInterval(intervalId);
        intervalId = setInterval(gameLoop, speed);
    }
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
        updateSpeed();
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
    ctx.fillText(`Level: ${level}`, 10, canvas.width / 15);
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
            <p>Level: ${level}</p>
            <button id="restart-button">Start Again</button>
        </div>
    `;
    document.body.appendChild(popup);

    document.getElementById('restart-button').addEventListener('click', () => {
        // Hapus popup
        hideGameOverPopup();
        
        // Tampilkan area input dan sembunyikan area permainan dan instruksi
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('input-area').style.display = 'block';
        document.getElementById('instruction').style.display = 'none';
        
        // Reset permainan
        document.getElementById('width-grid').value = '';
        document.getElementById('height-grid').value = '';
    });
}

function hideGameOverPopup() {
    const popup = document.getElementById('game-over-popup');
    if (popup) {
        popup.remove();
    }
}

document.getElementById('start-game-button').addEventListener('click', () => {
    const widthGrids = parseInt(document.getElementById('width-grid').value, 10);
    const heightGrids = parseInt(document.getElementById('height-grid').value, 10);

    document.getElementById('input-area').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';
    document.getElementById('instruction').style.display = 'block';

    initGame(widthGrids, heightGrids);
});

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && direction.y === 0) direction = { x: 0, y: -gridSize };
    if (e.key === 'ArrowDown' && direction.y === 0) direction = { x: 0, y: gridSize };
    if (e.key === 'ArrowLeft' && direction.x === 0) direction = { x: -gridSize, y: 0 };
    if (e.key === 'ArrowRight' && direction.x === 0) direction = { x: gridSize, y: 0 };
});
