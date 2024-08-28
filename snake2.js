//teroooss
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.getElementById('game-area').appendChild(canvas);

let snake, direction, food, intervalId;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let numCellsX, numCellsY;
let gridSize, speed = 200;
let level = 1;
let currentFoodColor, snakeColor = '#FFFFFF'; // Warna default ular
let mouthOpen = false; // Status mulut terbuka/tutup

function setCanvasSize(widthGrids, heightGrids) {
    numCellsX = widthGrids;
    numCellsY = heightGrids;

    const cellWidth = Math.floor(window.innerWidth / numCellsX);
    const cellHeight = Math.floor(window.innerHeight / numCellsY);
    gridSize = Math.min(cellWidth, cellHeight);

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
    speed = 200;

    snakeColor = '#FFFFFF'; // Warna default ular
    mouthOpen = false; // Mulut tertutup pada awal permainan
    hideGameOverPopup();

    if (intervalId) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(gameLoop, speed);
}

function generateFood() {
    currentFoodColor = getRandomColor();
    return {
        x: Math.floor(Math.random() * numCellsX) * gridSize,
        y: Math.floor(Math.random() * numCellsY) * gridSize
    };
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function updateSpeed() {
    const newLevel = Math.floor(score / 20) + 1;
    if (newLevel > level) {
        level = newLevel;
        speed = Math.max(100, 150 - (level - 1) * 10);
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

    // Cek jika ular akan memakan makanan (jarak dekat)
    mouthOpen = (Math.abs(head.x - food.x) <= gridSize && Math.abs(head.y - food.y) <= gridSize);

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        updateSpeed();
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
        snakeColor = currentFoodColor; // Ubah warna ular sesuai dengan makanan yang dimakan
        food = generateFood();
        mouthOpen = false; // Mulut tertutup setelah makan
    } else {
        snake.pop(); // Hanya buang ekor jika tidak makan
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Menggambar ular
    ctx.fillStyle = snakeColor;
    snake.forEach((s, index) => {
        if (index === 0) {
            drawSnakeHead(s.x, s.y); // Menggambar kepala ular dengan mulut
        } else {
            ctx.fillRect(s.x, s.y, gridSize, gridSize);
        }
    });

    // Menggambar makanan
    ctx.fillStyle = currentFoodColor;
    ctx.fillRect(food.x, food.y, gridSize, gridSize);

    // Menampilkan skor, high score, dan level di kanan atas
    ctx.fillStyle = 'white';
    ctx.font = `${gridSize * 0.8}px Arial`;
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, canvas.width - 10, gridSize);
    ctx.fillText(`High Score: ${highScore}`, canvas.width - 10, gridSize * 2);
    ctx.fillText(`Level: ${level}`, canvas.width - 10, gridSize * 3);
}

function drawSnakeHead(x, y) {
    ctx.fillStyle = snakeColor;
    ctx.fillRect(x, y, gridSize, gridSize);

    // Menggambar mulut (buka/tutup)
    if (mouthOpen) {
        ctx.fillStyle = 'black';
        const mouthSize = gridSize / 4;
        ctx.fillRect(x + gridSize / 2 - mouthSize / 2, y + gridSize / 2, mouthSize, mouthSize);
    }
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
        hideGameOverPopup();
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('input-area').style.display = 'block';
        document.getElementById('instruction').style.display = 'none';
        document.getElementById('width-grid').value = '50';
        document.getElementById('height-grid').value = '50';
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

// Fungsi untuk mendeteksi apakah perangkat adalah mobile
function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

// Membuat tombol panah transparan untuk kontrol jika di mobile
if (isMobileDevice()) {
    const arrowKeys = document.createElement('div');
    arrowKeys.id = 'arrow-keys';
    arrowKeys.innerHTML = `
        <button id="up-arrow" class="arrow" style="position:absolute; top:10%; left:50%; transform:translateX(-50%); opacity:0.5;">▲</button>
        <button id="down-arrow" class="arrow" style="position:absolute; bottom:10%; left:50%; transform:translateX(-50%); opacity:0.5;">▼</button>
        <button id="left-arrow" class="arrow" style="position:absolute; top:50%; left:10%; transform:translateY(-50%); opacity:0.5;">◄</button>
        <button id="right-arrow" class="arrow" style="position:absolute; top:50%; right:10%; transform:translateY(-50%); opacity:0.5;">►</button>
    `;
    document.getElementById('game-area').appendChild(arrowKeys);

// Membuat tombol panah transparan untuk kontrol
const arrowKeys = document.createElement('div');
arrowKeys.id = 'arrow-keys';
arrowKeys.innerHTML = `
    <button id="up-arrow" class="arrow" style="position:absolute; top:10%; left:50%; transform:translateX(-50%); opacity:0.5;">▲</button>
    <button id="down-arrow" class="arrow" style="position:absolute; bottom:10%; left:50%; transform:translateX(-50%); opacity:0.5;">▼</button>
    <button id="left-arrow" class="arrow" style="position:absolute; top:50%; left:10%; transform:translateY(-50%); opacity:0.5;">◄</button>
    <button id="right-arrow" class="arrow" style="position:absolute; top:50%; right:10%; transform:translateY(-50%); opacity:0.5;">►</button>
`;
document.getElementById('game-area').appendChild(arrowKeys);

// Tambahkan event listener untuk tombol panah
document.getElementById('up-arrow').addEventListener('click', () => {
    if (direction.y === 0) direction = { x: 0, y: -gridSize };
});
document.getElementById('down-arrow').addEventListener('click', () => {
    if (direction.y === 0) direction = { x: 0, y: gridSize };
});
document.getElementById('left-arrow').addEventListener('click', () => {
    if (direction.x === 0) direction = { x: -gridSize, y: 0 };
});
document.getElementById('right-arrow').addEventListener('click', () => {
    if (direction.x === 0) direction = { x: gridSize, y: 0 };
});

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && direction.y === 0) direction = { x: 0, y: -gridSize };
    if (e.key === 'ArrowDown' && direction.y === 0) direction = { x: 0, y: gridSize };
    if (e.key === 'ArrowLeft' && direction.x === 0) direction = { x: -gridSize, y: 0 };
    if (e.key === 'ArrowRight' && direction.x === 0) direction = { x: gridSize, y: 0 };
});
