// Tambah jadi ada multi cuy

const canvas = document.getElementById('game-area');
const ctx = canvas.getContext('2d');

// Game Constants (SESUAI SERVER)
const GRID_SIZE = 20;
const GRID_CELLS = 30;
canvas.width = GRID_CELLS * GRID_SIZE;
canvas.height = GRID_CELLS * GRID_SIZE;

// Game Variables
let snake, direction, food, intervalId;
let score = 0, highScore = localStorage.getItem('highScore') || 0;
let mode, playerId, players = {};

// WebSocket Connection
const socket = new WebSocket('ws://localhost:3000');

// Initialize Game
function initSinglePlayer() {
    snake = [{ 
        x: Math.floor(GRID_CELLS/2) * GRID_SIZE, 
        y: Math.floor(GRID_CELLS/2) * GRID_SIZE 
    }];
    direction = { x: 0, y: -GRID_SIZE };
    food = generateFood();
    startGameLoop(200);
}

function initMultiPlayer(playerName) {
    document.getElementById('leaderboard').style.display = 'block';
    
    socket.onopen = () => {
        socket.send(JSON.stringify({ 
            type: 'join', 
            name: playerName || "Guest" 
        }));
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch(data.type) {
            case 'init':
                playerId = data.playerId;
                players = data.players;
                food = data.food;
                break;
                
            case 'update':
                players = data.players;
                food = data.food;
                break;
                
            case 'leaderboard':
                updateLeaderboard(data.leaderboard);
                break;
        }
    };
}

// Game Logic
function generateFood() {
    return {
        x: Math.floor(Math.random() * GRID_CELLS) * GRID_SIZE,
        y: Math.floor(Math.random() * GRID_CELLS) * GRID_SIZE
    };
}

function gameLoop() {
    const head = { 
        x: (snake[0].x + direction.x + canvas.width) % canvas.width,
        y: (snake[0].y + direction.y + canvas.height) % canvas.height
    };

    // Collision Check
    if (snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Food Check
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('eat-sound').play();
        food = generateFood();
    } else {
        snake.pop();
    }

    drawGame();
}

// Multiplayer Logic
function gameLoopMulti() {
    if (!players[playerId]) return;
    drawGameMulti();
}

// Drawing Functions
function drawGame() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Food
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(food.x, food.y, GRID_SIZE-2, GRID_SIZE-2);
    
    // Draw Snake
    ctx.fillStyle = '#00ff00';
    snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, GRID_SIZE-2, GRID_SIZE-2);
    });
}

function drawGameMulti() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Food
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(food.x, food.y, GRID_SIZE-2, GRID_SIZE-2);
    
    // Draw Players
    Object.values(players).forEach(player => {
        ctx.fillStyle = player.id === playerId ? '#00ff00' : '#0000ff';
        ctx.fillRect(player.x, player.y, GRID_SIZE-2, GRID_SIZE-2);
    });
}

// Game Controls
document.addEventListener('keydown', (e) => {
    if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return;
    
    const newDirection = {
        'ArrowUp': {x: 0, y: -GRID_SIZE},
        'ArrowDown': {x: 0, y: GRID_SIZE},
        'ArrowLeft': {x: -GRID_SIZE, y: 0},
        'ArrowRight': {x: GRID_SIZE, y: 0}
    }[e.key];

    if (mode === 'multi') {
        socket.send(JSON.stringify({
            type: 'move',
            playerId: playerId,
            direction: newDirection
        }));
    } else {
        // Prevent 180° turn
        if (direction.x + newDirection.x === 0 && direction.y + newDirection.y === 0) return;
        direction = newDirection;
    }
});

// Game Management
function startGame(selectedMode) {
    mode = selectedMode;
    const playerName = document.getElementById('player-name').value;
    
    document.getElementById('game-area').style.display = 'block';
    document.getElementById('input-area').style.display = 'none';
    document.getElementById('back-to-menu').style.display = 'block';
    document.getElementById('instruction').style.display = 'block';

    if (mode === 'single') {
        initSinglePlayer();
        startGameLoop(200);
    } else {
        initMultiPlayer(playerName);
        startGameLoop(50); // Faster loop for multiplayer sync
    }
}

function startGameLoop(speed) {
    clearInterval(intervalId);
    intervalId = setInterval(
        mode === 'single' ? gameLoop : gameLoopMulti, 
        speed
    );
}

function gameOver() {
    clearInterval(intervalId);
    alert(`Game Over! Score: ${score}`);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    
    document.getElementById('back-to-menu').click();
}

function updateLeaderboard(leaderboard) {
    const lbDiv = document.getElementById('leaderboard');
    lbDiv.innerHTML = '<h3>🏆 Leaderboard 🏆</h3>';
    leaderboard.forEach((player, index) => {
        lbDiv.innerHTML += `<p>${index+1}. ${player.name} - ${player.score}</p>`;
    });
}

// Initialize Canvas
ctx.imageSmoothingEnabled = false;
