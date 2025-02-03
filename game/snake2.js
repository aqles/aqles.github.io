document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById('game-area');
    const ctx = canvas.getContext('2d');
    const GRID_CELLS = 20;
    let GRID_SIZE = Math.min(window.innerWidth, window.innerHeight) / GRID_CELLS;
    let snake = [{ x: 10, y: 10 }];
    let direction = "RIGHT";
    let food = generateFood();
    let gameInterval;
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let level = 1;
    let playerName = "Player";
    let mode = 'single';
    let gameActive = false;
    
    // WebSocket Connection
    const socket = new WebSocket('wss://dorian-horn-mortarboard.glitch.me');
    let playerId = null;
    let players = {};

    // UI Elements
    const scoreDisplay = document.createElement("div");
    scoreDisplay.style.position = "fixed";
    scoreDisplay.style.top = "10px";
    scoreDisplay.style.right = "10px";
    scoreDisplay.style.color = "#fff";
    scoreDisplay.style.fontFamily = "'Press Start 2P', cursive";
    document.body.appendChild(scoreDisplay);

    // Inisialisasi ukuran canvas
    function adjustCanvasSize() {
        const size = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);
        canvas.width = size;
        canvas.height = size;
        GRID_SIZE = size / GRID_CELLS;
    }

    function generateFood() {
        return {
            x: Math.floor(Math.random() * (canvas.width / GRID_SIZE)),
            y: Math.floor(Math.random() * (canvas.height / GRID_SIZE))
        };
    }

    function startGame(selectedMode) {
        mode = selectedMode;
        playerName = document.getElementById('player-name').value || "Player";
        document.getElementById('game-area').style.display = 'block';
        document.getElementById('input-area').style.display = 'none';
        document.getElementById('back-to-menu').style.display = 'block';
        document.getElementById('instruction').style.display = 'block';
        
        adjustCanvasSize();
        resetGame();

        if (mode === 'single') {
            startGameLoop(200);
        } else {
            initMultiPlayer();
            startGameLoop(50);
        }
    }

    function resetGame() {
        snake = [{ x: 10, y: 10 }];
        direction = "RIGHT";
        food = generateFood();
        score = 0;
        level = 1;
        gameActive = true;
        updateScoreDisplay();
    }

    function updateScoreDisplay() {
        scoreDisplay.textContent = `${playerName} | Score: ${score} | Level: ${level}`;
    }

    function initMultiPlayer() {
        document.getElementById('leaderboard').style.display = 'block';
        socket.onopen = () => {
            socket.send(JSON.stringify({ 
                type: 'join', 
                name: playerName,
                position: snake[0]
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

    function updateGame() {
        if (!gameActive) return;

        const head = { ...snake[0] };
        switch (direction) {
            case "UP": head.y--; break;
            case "DOWN": head.y++; break;
            case "LEFT": head.x--; break;
            case "RIGHT": head.x++; break;
        }

        // Collision detection
        if (head.x < 0 || head.y < 0 || 
            head.x >= canvas.width/GRID_SIZE || 
            head.y >= canvas.height/GRID_SIZE ||
            snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            gameOver();
            return;
        }

        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            if (score % 50 === 0) level++;
            food = generateFood();
        } else {
            snake.pop();
        }

        updateScoreDisplay();
        drawGame();
    }

    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw food
        ctx.fillStyle = "red";
        ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE-2, GRID_SIZE-2);
        
        // Draw snake
        ctx.fillStyle = "lime";
        snake.forEach(segment => {
            ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE-2, GRID_SIZE-2);
        });
    }

    function gameOver() {
        gameActive = false;
        clearInterval(gameInterval);
        alert(`Game Over! Score: ${score}`);
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
        backToMenu();
    }

    function startGameLoop(speed) {
        clearInterval(gameInterval);
        gameInterval = setInterval(mode === 'single' ? updateGame : updateMultiplayerGame, speed);
    }

    // Multiplayer functions
    function updateMultiplayerGame() {
        if (!players[playerId]) return;
        drawMultiplayerGame();
    }

    function drawMultiplayerGame() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw food
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(food.x, food.y, GRID_SIZE-2, GRID_SIZE-2);
        
        // Draw players
        Object.values(players).forEach(player => {
            ctx.fillStyle = player.id === playerId ? '#00ff00' : '#0000ff';
            ctx.fillRect(player.x, player.y, GRID_SIZE-2, GRID_SIZE-2);
        });
    }

    // Event listeners
    document.addEventListener('keydown', (e) => {
        if (!gameActive) return;
        
        const newDirection = {
            'ArrowUp': 'UP',
            'ArrowDown': 'DOWN',
            'ArrowLeft': 'LEFT',
            'ArrowRight': 'RIGHT',
            'w': 'UP',
            's': 'DOWN',
            'a': 'LEFT',
            'd': 'RIGHT'
        }[e.key];

        if (newDirection) {
            if (mode === 'multi') {
                socket.send(JSON.stringify({
                    type: 'move',
                    direction: newDirection,
                    playerId
                }));
            } else {
                // Prevent 180-degree turn
                if (
                    (direction === 'UP' && newDirection === 'DOWN') ||
                    (direction === 'DOWN' && newDirection === 'UP') ||
                    (direction === 'LEFT' && newDirection === 'RIGHT') ||
                    (direction === 'RIGHT' && newDirection === 'LEFT')
                ) return;
                
                direction = newDirection;
            }
        }
    });

    window.addEventListener('resize', () => {
        adjustCanvasSize();
        drawGame();
    });

    // Mobile controls
    const joystick = document.createElement("div");
    joystick.style.cssText = `
        position: fixed;
        bottom: 50px;
        left: 50px;
        width: 80px;
        height: 80px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        display: none;
        touch-action: none;
    `;
    document.body.appendChild(joystick);

    if ('ontouchstart' in window) {
        joystick.style.display = 'flex';
        let touchStart = null;

        joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStart = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        });

        joystick.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!touchStart) return;
            
            const deltaX = e.touches[0].clientX - touchStart.x;
            const deltaY = e.touches[0].clientY - touchStart.y;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                direction = deltaX > 0 ? 'RIGHT' : 'LEFT';
            } else {
                direction = deltaY > 0 ? 'DOWN' : 'UP';
            }
        });
    }

    // Expose function to global scope untuk HTML onclick
    window.startGame = startGame;
    window.backToMenu = backToMenu;
});

function backToMenu() {
    document.getElementById('input-area').style.display = 'block';
    document.getElementById('game-area').style.display = 'none';
    document.getElementById('back-to-menu').style.display = 'none';
    document.getElementById('instruction').style.display = 'none';
}
