document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById('game-area');
    const ctx = canvas.getContext('2d');
    const tileSize = 20;
    let snake = [{ x: 10, y: 10 }];
    let direction = "RIGHT";
    let food = generateFood();
    let gameInterval;
    let score = 0;
    let level = 1;
    let playerName = "Player";

    // Display elements
    const scoreDisplay = document.createElement("div");
    scoreDisplay.style.position = "absolute";
    scoreDisplay.style.top = "10px";
    scoreDisplay.style.right = "10px";
    scoreDisplay.style.color = "#fff";
    scoreDisplay.style.fontSize = "14px";
    scoreDisplay.style.fontFamily = "'Press Start 2P', cursive";
    document.body.appendChild(scoreDisplay);
    
    // Game Constants
    const GRID_CELLS = 20;
    let GRID_SIZE = Math.min(window.innerWidth, window.innerHeight) / GRID_CELLS;
    
    // Game Variables
    let direction, food, intervalId;
    let score = 0, highScore = localStorage.getItem('highScore') || 0;
    let mode, playerId, players = {};
    
    // WebSocket Connection
    const socket = new WebSocket('wss://dorian-horn-mortarboard.glitch.me');
    
    function toggleMenu() {
        let menu = document.getElementById('dropdownMenu');
        menu.classList.toggle('show');
    }
    
    // Biar menu tertutup kalau klik di luar
    window.onclick = function(e) {
        if (!e.target.closest('.menu-container')) {
            document.getElementById('dropdownMenu').classList.remove('show');
        }
    };
    
    function backToMenu() {
        document.getElementById('input-area').style.display = 'block';
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('back-to-menu').style.display = 'none';
        document.getElementById('instruction').style.display = 'none';
        gameActive = false;
    }

    function updateScoreDisplay() {
        scoreDisplay.innerHTML = `${playerName} | Score: ${score} | Level: ${level}`;
    }
    
    function initSinglePlayer() {
        snake = [{ x: Math.floor(GRID_CELLS/2) * GRID_SIZE, y: Math.floor(GRID_CELLS/2) * GRID_SIZE }];
        direction = { x: 0, y: -GRID_SIZE };
        food = generateFood();
        startGameLoop(200);
    }
    
    function initMultiPlayer(playerName) {
        document.getElementById('leaderboard').style.display = 'block';
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'join', name: playerName || "Guest" }));
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
    
    function adjustCanvasSize() {
        const size = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);
        canvas.width = size;
        canvas.height = size;
        GRID_SIZE = size / GRID_CELLS;
    }
    
    function generateFood() {
        return {
            x: Math.floor(Math.random() * (canvas.width / tileSize)),
            y: Math.floor(Math.random() * (canvas.height / tileSize))
        };
    }

     function updateGame() {
        const head = { ...snake[0] };

        switch (direction) {
            case "UP": head.y--; break;
            case "DOWN": head.y++; break;
            case "LEFT": head.x--; break;
            case "RIGHT": head.x++; break;
        }

        if (head.x < 0 || head.y < 0 || head.x >= canvas.width / tileSize || head.y >= canvas.height / tileSize ||
            snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            clearInterval(gameInterval);
            alert("Game Over!");
            return;
        }

        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            if (score % 50 === 0) {
                level++;
            }
            food = generateFood();
        } else {
            snake.pop();
        }
         
         updateScoreDisplay();
        drawGame();
    }

    function gameLoop() {
        const head = { x: (snake[0].x + direction.x + canvas.width) % canvas.width, y: (snake[0].y + direction.y + canvas.height) % canvas.height };
        if (snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
            gameOver();
            return;
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            document.getElementById('eat-sound').play();
            food = generateFood();
        } else {
            snake.pop();
        }
        drawGame();
    }
    
    function gameLoopMulti() {
        if (!players[playerId]) return;
        drawGameMulti();
    }
    
    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "red";
        ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize, tileSize);
        ctx.fillStyle = "lime";
        snake.forEach(segment => {
            ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
        });
    }
    
    function drawGameMulti() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(food.x, food.y, GRID_SIZE-2, GRID_SIZE-2);
        Object.values(players).forEach(player => {
            ctx.fillStyle = player.id === playerId ? '#00ff00' : '#0000ff';
            ctx.fillRect(player.x, player.y, GRID_SIZE-2, GRID_SIZE-2);
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return;
        const newDirection = {
            'ArrowUp': {x: 0, y: -GRID_SIZE},
            'ArrowDown': {x: 0, y: GRID_SIZE},
            'ArrowLeft': {x: -GRID_SIZE, y: 0},
            'ArrowRight': {x: GRID_SIZE, y: 0}
        }[e.key];
        if (mode === 'multi') {
            socket.send(JSON.stringify({ type: 'move', playerId, direction: newDirection }));
        } else {
            if (direction.x + newDirection.x === 0 && direction.y + newDirection.y === 0) return;
            direction = newDirection;
        }
    });
    
    function startGame(selectedMode) {
        adjustCanvasSize();
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
            startGameLoop(50);
        }
    }
    
    function startGameLoop(speed) {
        clearInterval(intervalId);
        intervalId = setInterval(mode === 'single' ? gameLoop : gameLoopMulti, speed);
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

    function startGameLogic(mode, name) {
        playerName = name || "Player";
        snake = [{ x: 10, y: 10 }];
        direction = "RIGHT";
        score = 0;
        level = 1;
        food = generateFood();
        updateScoreDisplay();
        clearInterval(gameInterval);
        gameInterval = setInterval(updateGame, 150);
    }

    window.addEventListener("keydown", function (e) {
        const keyMap = {
            ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT",
            w: "UP", s: "DOWN", a: "LEFT", d: "RIGHT"
        };
        if (keyMap[e.key] && keyMap[e.key] !== direction) {
            direction = keyMap[e.key];
        }
    });
    
    // Joystick for mobile
    const joystick = document.createElement("div");
    joystick.style.position = "fixed";
    joystick.style.bottom = "50px";
    joystick.style.left = "50px";
    joystick.style.width = "80px";
    joystick.style.height = "80px";
    joystick.style.background = "rgba(255, 255, 255, 0.3)";
    joystick.style.borderRadius = "50%";
    joystick.style.display = "flex";
    joystick.style.alignItems = "center";
    joystick.style.justifyContent = "center";
    joystick.style.fontSize = "20px";
    joystick.style.color = "black";
    joystick.innerHTML = "🎮";
    document.body.appendChild(joystick);

    let touchStartX = 0, touchStartY = 0;
    joystick.addEventListener("touchstart", (e) => {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    });

    joystick.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) {
            direction = dx > 0 ? "RIGHT" : "LEFT";
        } else {
            direction = dy > 0 ? "DOWN" : "UP";
        }
    });
});
