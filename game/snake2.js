// Tambah jadi ada multi cuy

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.getElementById('game-area').appendChild(canvas);

let snake, direction, food, intervalId;
let score = 0, highScore = localStorage.getItem('highScore') || 0;
let numCellsX, numCellsY, gridSize, speed = 200;
let mode;

// Multiplayer Variables
const socket = new WebSocket('wss://your-glitch-project.glitch.me');
let playerId;
let players = {};

// Setup Canvas Size
function setCanvasSize(widthGrids, heightGrids) {
    numCellsX = widthGrids;
    numCellsY = heightGrids;
    const cellWidth = Math.floor(window.innerWidth / numCellsX);
    const cellHeight = Math.floor(window.innerHeight / numCellsY);
    gridSize = Math.min(cellWidth, cellHeight);
    canvas.width = numCellsX * gridSize;
    canvas.height = numCellsY * gridSize;
}

// Init Single Player Mode
function initSinglePlayer() {
    setCanvasSize(30, 30);
    snake = [{ x: Math.floor(numCellsX / 2) * gridSize, y: Math.floor(numCellsY / 2) * gridSize }];
    direction = { x: 0, y: -gridSize };
    food = generateFood();
    score = 0;
    speed = 200;
    clearInterval(intervalId);
    intervalId = setInterval(gameLoop, speed);
}

// Init Multiplayer Mode
function initMultiPlayer(playerName) {
    setCanvasSize(30, 30);
    document.getElementById('leaderboard').style.display = 'block';

    socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'join', name: playerName }));
    };

    socket.onmessage = (event) => {
        let data = JSON.parse(event.data);
        if (data.type === 'init') {
            playerId = data.playerId;
            players = data.players;
            food = data.food;
        } else if (data.type === 'update') {
            players = data.players;
            food = data.food;
        } else if (data.type === 'leaderboard') {
            updateLeaderboard(data.leaderboard);
        }
    };

    clearInterval(intervalId);
    intervalId = setInterval(gameLoopMulti, speed);
}


// Bikin posisi makanan
function generateFood() {
    return {
        x: Math.floor(Math.random() * numCellsX) * gridSize,
        y: Math.floor(Math.random() * numCellsY) * gridSize
    };
}

// Single Player Game Loop
function gameLoop() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    if (head.x < 0) head.x = canvas.width - gridSize;
    else if (head.x >= canvas.width) head.x = 0;
    if (head.y < 0) head.y = canvas.height - gridSize;
    else if (head.y >= canvas.height) head.y = 0;
    if (snake.slice(1).some(s => s.x === head.x && s.y === head.y)) {
        gameOver();
        return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score++;
        food = generateFood();
    } else {
        snake.pop();
    }
    drawGame();
}

// Multiplayer Game Loop
function gameLoopMulti() {
    if (!players[playerId]) return;
    drawGameMulti();
}

// Bikin Single Player Game
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, gridSize, gridSize);
    ctx.fillStyle = 'white';
    snake.forEach(part => ctx.fillRect(part.x, part.y, gridSize, gridSize));
}

// Bikin Multiplayer Game
function drawGameMulti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, gridSize, gridSize);
    Object.values(players).forEach(player => {
        ctx.fillStyle = playerId === player.id ? 'blue' : 'green';
        ctx.fillRect(player.x, player.y, gridSize, gridSize);
    });
}

// Update Leaderboard
function updateLeaderboard(leaderboard) {
    const leaderboardDiv = document.getElementById('leaderboard');
    leaderboardDiv.innerHTML = "<h3>🏆 Leaderboard 🏆</h3>";
    leaderboard.forEach((entry, index) => {
        leaderboardDiv.innerHTML += `<p>${index + 1}. ${entry.name} - ${entry.score}</p>`;
    });
}

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    let newDirection;
    if (e.key === 'ArrowUp') newDirection = { x: 0, y: -gridSize };
    if (e.key === 'ArrowDown') newDirection = { x: 0, y: gridSize };
    if (e.key === 'ArrowLeft') newDirection = { x: -gridSize, y: 0 };
    if (e.key === 'ArrowRight') newDirection = { x: gridSize, y: 0 };
    if (newDirection) {
        if (mode === 'multi' && players[playerId]) {
            socket.send(JSON.stringify({ type: 'move', playerId, direction: newDirection }));
        } else {
            direction = newDirection;
        }
    }
});

// Start Game berdasarkan mode
function startGame(selectedMode) {
    mode = selectedMode;
    document.getElementById('game-area').style.display = 'block';
    document.getElementById('input-area').style.display = 'none';
    
    const playerName = document.getElementById('player-name').value || "Guest"; // Ambil nama dari input

    if (mode === 'single') {
        initSinglePlayer();
    } else {
        initMultiPlayer(playerName);
    }
}

