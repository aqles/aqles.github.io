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
    const shapes = ['circle', 'square', 'triangle']; // Tambahkan bentuk lain jika ingin
    return {
        x: Math.floor(Math.random() * numCellsX) * gridSize,
        y: Math.floor(Math.random() * numCellsY) * gridSize,
        shape: shapes[Math.floor(Math.random() * shapes.length)] // Bentuk acak
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

// Elemen audio
const eatSound = document.getElementById('eat-sound');

// Fungsi untuk ular memakan makanan
function handleEating() {
    if (eatSound.paused) {
        eatSound.play().catch(error => {
            console.error("Audio playback failed:", error);
        });
    }
}

function gameLoop() {
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    // Logika untuk menembus dinding
    if (head.x < 0) head.x = canvas.width - gridSize; // Keluar kiri -> masuk kanan
    else if (head.x >= canvas.width) head.x = 0; // Keluar kanan -> masuk kiri

    if (head.y < 0) head.y = canvas.height - gridSize; // Keluar atas -> masuk bawah
    else if (head.y >= canvas.height) head.y = 0; // Keluar bawah -> masuk atas

    // Cek tabrakan dengan tubuh ular (kecuali kepala)
    if (snake.slice(1).some(s => s.x === head.x && s.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Cek jika ular memakan makanan
    if (head.x === food.x && head.y === food.y) {
        console.log("Makanan dimakan!"); // Debugging
        handleEating(); // Mainkan suara
        score++;
        updateSpeed();
        food = generateFood();
    } else {
        snake.pop(); // Hanya kurangi ekor jika tidak makan
    }

    // Gambar ulang layar
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
    switch (food.shape) {
        case 'circle':
            ctx.beginPath();
            ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'triangle':
            ctx.beginPath();
            ctx.moveTo(food.x + gridSize / 2, food.y);
            ctx.lineTo(food.x, food.y + gridSize);
            ctx.lineTo(food.x + gridSize, food.y + gridSize);
            ctx.closePath();
            ctx.fill();
            break;
        default: // square
            ctx.fillRect(food.x, food.y, gridSize, gridSize);
    }

    // Menampilkan skor, high score, dan level di kanan atas
    ctx.fillStyle = 'white';
    ctx.font = `${gridSize * 0.8}px Arial`;
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, canvas.width - 10, gridSize);
    ctx.fillText(`High Score: ${highScore}`, canvas.width - 10, gridSize * 2);
    ctx.fillText(`Level: ${level}`, canvas.width - 10, gridSize * 3);

    // Cek jika ular akan memakan makanan (jarak dekat)
    const currentHead = snake[0];
    mouthOpen = (
        (currentHead.x + direction.x === food.x && currentHead.y + direction.y === food.y) ||
        (currentHead.x === food.x && currentHead.y === food.y)
    );
}

function drawSnakeHead(x, y) {
    ctx.fillStyle = snakeColor;

    // Gambar kepala sebagai lingkaran
    ctx.beginPath();
    ctx.arc(x + gridSize / 2, y + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Gambar mata
    ctx.fillStyle = 'black';
    const eyeRadius = gridSize / 8;
    if (direction.x === 0 && direction.y === -gridSize) { // Bergerak ke atas
        ctx.beginPath();
        ctx.arc(x + gridSize / 4, y + gridSize / 4, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + (gridSize * 3) / 4, y + gridSize / 4, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
    } else if (direction.x === 0 && direction.y === gridSize) { // Bergerak ke bawah
        ctx.beginPath();
        ctx.arc(x + gridSize / 4, y + (gridSize * 3) / 4, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + (gridSize * 3) / 4, y + (gridSize * 3) / 4, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
    } else if (direction.x === -gridSize && direction.y === 0) { // Bergerak ke kiri
        ctx.beginPath();
        ctx.arc(x + gridSize / 4, y + gridSize / 4, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + gridSize / 4, y + (gridSize * 3) / 4, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
    } else if (direction.x === gridSize && direction.y === 0) { // Bergerak ke kanan
        ctx.beginPath();
        ctx.arc(x + (gridSize * 3) / 4, y + gridSize / 4, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + (gridSize * 3) / 4, y + (gridSize * 3) / 4, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Gambar mulut jika terbuka
    if (mouthOpen) {
        ctx.fillStyle = 'black';
        const mouthSize = gridSize / 4;
        if (direction.y === -gridSize) { // Bergerak ke atas
            ctx.fillRect(x + gridSize / 2 - mouthSize / 2, y, mouthSize, mouthSize / 2);
        } else if (direction.y === gridSize) { // Bergerak ke bawah
            ctx.fillRect(x + gridSize / 2 - mouthSize / 2, y + gridSize - mouthSize / 2, mouthSize, mouthSize / 2);
        } else if (direction.x === -gridSize) { // Bergerak ke kiri
            ctx.fillRect(x, y + gridSize / 2 - mouthSize / 2, mouthSize / 2, mouthSize);
        } else if (direction.x === gridSize) { // Bergerak ke kanan
            ctx.fillRect(x + gridSize - mouthSize / 2, y + gridSize / 2 - mouthSize / 2, mouthSize / 2, mouthSize);
        }
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
        document.getElementById('width-grid').value = '30';
        document.getElementById('height-grid').value = '30';
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

// Untuk tombol panah
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
}
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && direction.y === 0) direction = { x: 0, y: -gridSize };
    if (e.key === 'ArrowDown' && direction.y === 0) direction = { x: 0, y: gridSize };
    if (e.key === 'ArrowLeft' && direction.x === 0) direction = { x: -gridSize, y: 0 };
    if (e.key === 'ArrowRight' && direction.x === 0) direction = { x: gridSize, y: 0 };
});
