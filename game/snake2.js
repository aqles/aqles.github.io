document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById('game-area');
    const ctx = canvas.getContext('2d');
    const GRID_CELLS = 20;
    let GRID_SIZE = Math.min(window.innerWidth, window.innerHeight) / GRID_CELLS;
    let snake = [{ x: 10, y: 10, color: '#00FF00' }];
    let direction = "RIGHT";
    let food = generateFood();
    let gameInterval;
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let level = 1;
    let playerName = "Player";
    let gameActive = false;

    // UI Elements
    const scoreDisplay = document.createElement("div");
    scoreDisplay.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        color: #fff;
        font-family: 'Press Start 2P', cursive;
        background: rgba(0, 0, 0, 0.7);
        padding: 15px;
        border-radius: 10px;
        border: 2px solid #fff;
    `;
    document.body.appendChild(scoreDisplay);

    function adjustCanvasSize() {
        const size = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);
        canvas.width = size;
        canvas.height = size;
        GRID_SIZE = size / GRID_CELLS;
    }

    function generateFood() {
        return {
            x: Math.floor(Math.random() * GRID_CELLS),
            y: Math.floor(Math.random() * GRID_CELLS),
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)]
        };
    }

    function startGame() {
        playerName = document.getElementById('player-name').value || "Player";
        document.getElementById('game-area').style.display = 'block';
        document.getElementById('input-area').style.display = 'none';
        document.getElementById('back-to-menu').style.display = 'block';
        document.getElementById('instruction').style.display = 'block';
        
        adjustCanvasSize();
        resetGame();
        startGameLoop(200);
    }

    function resetGame() {
        snake = [{ x: 10, y: 10, color: '#00FF00' }];
        direction = "RIGHT";
        food = generateFood();
        score = 0;
        level = 1;
        gameActive = true;
        updateScoreDisplay();
    }

    function updateScoreDisplay() {
        scoreDisplay.innerHTML = `
            ${playerName}<br>
            Score: ${score}<br>
            Level: ${level}
        `;
    }

    function updateGame() {
        if (!gameActive) return;
    
        const head = { ...snake[0], color: snake[0].color };
        switch (direction) {
            case "UP": head.y--; break;
            case "DOWN": head.y++; break;
            case "LEFT": head.x--; break;
            case "RIGHT": head.x++; break;
        }
    
        // Collision detection
        if (head.x < 0 || head.y < 0 || 
            head.x >= GRID_CELLS || 
            head.y >= GRID_CELLS ||
            snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            gameOver();
            return;
        }
    
        // Add new head with food color if eating
        if (head.x === food.x && head.y === food.y) {
            // Play eat sound
            const eatSound = document.getElementById('eat-sound');
            eatSound.play();
            
            score += 10;
            if (score % 20 === 0) level++;
            head.color = food.color;
            food = generateFood();
        } else {
            snake.pop();
        }
    
        snake.unshift(head);
        updateScoreDisplay();
        drawGame();
    }

    function drawGame() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw food
        ctx.fillStyle = food.color;
        const foodSize = GRID_SIZE - 2;
        const foodX = food.x * GRID_SIZE + GRID_SIZE/2;
        const foodY = food.y * GRID_SIZE + GRID_SIZE/2;
        
        switch(food.shape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(foodX, foodY, foodSize/2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'square':
                ctx.fillRect(food.x * GRID_SIZE +1, food.y * GRID_SIZE +1, foodSize, foodSize);
                break;
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(foodX, foodY - foodSize/2);
                ctx.lineTo(foodX - foodSize/2, foodY + foodSize/2);
                ctx.lineTo(foodX + foodSize/2, foodY + foodSize/2);
                ctx.closePath();
                ctx.fill();
                break;
        }

        // Draw snake
        snake.forEach((segment, index) => {
            ctx.fillStyle = segment.color;
            const size = GRID_SIZE - 2;
            const x = segment.x * GRID_SIZE + 1;
            const y = segment.y * GRID_SIZE + 1;
            
            if (index === 0) { // Draw head
                // Head shape
                ctx.beginPath();
                ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Eyes
                ctx.fillStyle = '#fff';
                const eyeSize = size/8;
                const eyePositions = {
                    'RIGHT': [{x: x + size/1.5, y: y + size/3}, {x: x + size/1.5, y: y + size/1.5}],
                    'LEFT': [{x: x + size/3, y: y + size/3}, {x: x + size/3, y: y + size/1.5}],
                    'UP': [{x: x + size/3, y: y + size/3}, {x: x + size/1.5, y: y + size/3}],
                    'DOWN': [{x: x + size/3, y: y + size/1.5}, {x: x + size/1.5, y: y + size/1.5}]
                };
                
                eyePositions[direction].forEach(eye => {
                    ctx.beginPath();
                    ctx.arc(eye.x, eye.y, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                });
            } else { // Draw body
                ctx.fillRect(x, y, size, size);
            }
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
        gameInterval = setInterval(updateGame, 200 - (level-1)*10);
    }

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

    // Touch controls
    if ('ontouchstart' in window) {
        joystick.style.display = 'block';
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

    // Keyboard controls
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
            const oppositeDirections = {
                'UP': 'DOWN',
                'DOWN': 'UP',
                'LEFT': 'RIGHT',
                'RIGHT': 'LEFT'
            };
            
            if (direction !== oppositeDirections[newDirection]) {
                direction = newDirection;
            }
        }
    });

    window.addEventListener('resize', () => {
        adjustCanvasSize();
        drawGame();
    });

    window.startGame = startGame;
    window.backToMenu = backToMenu;
});

function backToMenu() {
    document.getElementById('input-area').style.display = 'block';
    document.getElementById('game-area').style.display = 'none';
    document.getElementById('back-to-menu').style.display = 'none';
    document.getElementById('instruction').style.display = 'none';
}
