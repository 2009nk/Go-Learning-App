// Game state
let board = [];
let boardSize = 9;
let currentPlayer = 'black';
let gameMode = 'vsAI';
let gameOver = false;
let blackCaptured = 0;
let whiteCaptured = 0;
let moveHistory = [];
let lastBoardState = null;
let canvas, ctx;
let cellSize;

// Initialize game
function initGame() {
    canvas = document.getElementById('goBoard');
    ctx = canvas.getContext('2d');
    
    resetGame();
    setupEventListeners();
    drawBoard();
}

// Reset game
function resetGame() {
    board = Array(boardSize).fill().map(() => Array(boardSize).fill(null));
    currentPlayer = 'black';
    gameOver = false;
    blackCaptured = 0;
    whiteCaptured = 0;
    moveHistory = [];
    lastBoardState = null;
    
    document.getElementById('blackCaptured').textContent = blackCaptured;
    document.getElementById('whiteCaptured').textContent = whiteCaptured;
    updatePlayerTurn();
    drawBoard();
}

// Change board size
function changeBoardSize() {
    const select = document.getElementById('boardSize');
    boardSize = parseInt(select.value);
    resetGame();
}

// Change game mode
function changeGameMode() {
    const radios = document.getElementsByName('gameMode');
    for (let radio of radios) {
        if (radio.checked) {
            gameMode = radio.value;
            break;
        }
    }
    resetGame();
}

// Setup event listeners
function setupEventListeners() {
    canvas.addEventListener('click', handleCanvasClick);
}

// Handle canvas click
function handleCanvasClick(e) {
    if (gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    cellSize = canvas.width / boardSize;
    
    const x = Math.floor(mouseX / cellSize);
    const y = Math.floor(mouseY / cellSize);
    
    if (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
        makeMove(x, y);
    }
}

// Make a move
function makeMove(x, y) {
    // Check if move is valid
    if (!isValidMove(x, y, currentPlayer)) {
        showMessage('Invalid move!', 'error');
        return;
    }
    
    // Save current board to history
    saveToHistory();
    
    // Place stone
    board[x][y] = currentPlayer;
    
    // Check for captures
    const captured = checkCaptures(x, y, currentPlayer);
    
    // Update captured count
    if (currentPlayer === 'black') {
        whiteCaptured += captured;
    } else {
        blackCaptured += captured;
    }
    
    // Update display
    document.getElementById('blackCaptured').textContent = blackCaptured;
    document.getElementById('whiteCaptured').textContent = whiteCaptured;
    
    // Switch player
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    updatePlayerTurn();
    
    // Redraw board
    drawBoard();
    
    // Check if game over
    if (checkGameOver()) {
        gameOver = true;
        showMessage('Game Over! Calculate score to see winner.', 'info');
    }
    
    // AI move if in vsAI mode
    if (gameMode === 'vsAI' && currentPlayer === 'white' && !gameOver) {
        setTimeout(makeAIMove, 500);
    }
}

// Check if move is valid
function isValidMove(x, y, player) {
    // Check if position is empty
    if (board[x][y] !== null) {
        return false;
    }
    
    // Check for suicide
    if (!wouldCapture(x, y, player) && countLiberties(x, y, player) === 0) {
        return false;
    }
    
    // Check Ko rule
    if (checkKo(x, y, player)) {
        return false;
    }
    
    return true;
}

// Count liberties for a group
function countLiberties(x, y, player, visited = new Set()) {
    const key = `${x},${y}`;
    if (visited.has(key)) return 0;
    visited.add(key);
    
    let liberties = 0;
    const directions = [[1,0], [-1,0], [0,1], [0,-1]];
    
    for (let [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
            if (board[nx][ny] === null) {
                liberties++;
            } else if (board[nx][ny] === player) {
                liberties += countLiberties(nx, ny, player, visited);
            }
        }
    }
    
    return liberties;
}

// Check if move would capture any stones
function wouldCapture(x, y, player) {
    const directions = [[1,0], [-1,0], [0,1], [0,-1]];
    const opponent = player === 'black' ? 'white' : 'black';
    
    for (let [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
            if (board[nx][ny] === opponent) {
                if (countLiberties(nx, ny, opponent) === 0) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

// Check for captures after a move
function checkCaptures(x, y, player) {
    const directions = [[1,0], [-1,0], [0,1], [0,-1]];
    const opponent = player === 'black' ? 'white' : 'black';
    let captured = 0;
    
    for (let [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
            if (board[nx][ny] === opponent) {
                if (countLiberties(nx, ny, opponent) === 0) {
                    captured += removeGroup(nx, ny, opponent);
                }
            }
        }
    }
    
    return captured;
}

// Remove a captured group
function removeGroup(x, y, player) {
    let count = 0;
    const queue = [[x, y]];
    const visited = new Set();
    
    while (queue.length > 0) {
        const [cx, cy] = queue.shift();
        const key = `${cx},${cy}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        if (board[cx][cy] === player) {
            board[cx][cy] = null;
            count++;
            
            const directions = [[1,0], [-1,0], [0,1], [0,-1]];
            for (let [dx, dy] of directions) {
                const nx = cx + dx;
                const ny = cy + dy;
                if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
                    if (board[nx][ny] === player) {
                        queue.push([nx, ny]);
                    }
                }
            }
        }
    }
    
    return count;
}

// Check Ko rule
function checkKo(x, y, player) {
    // Create temporary board with the move
    const tempBoard = JSON.parse(JSON.stringify(board));
    tempBoard[x][y] = player;
    
    // Check captures
    const directions = [[1,0], [-1,0], [0,1], [0,-1]];
    const opponent = player === 'black' ? 'white' : 'black';
    
    for (let [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
            if (tempBoard[nx][ny] === opponent) {
                // This is simplified - you'd need to check if group has liberties
                // For now, just check if board state repeats
            }
        }
    }
    
    const boardString = JSON.stringify(tempBoard);
    return boardString === lastBoardState;
}

// Save current board to history
function saveToHistory() {
    moveHistory.push(JSON.parse(JSON.stringify(board)));
    lastBoardState = JSON.stringify(board);
}

// Undo last move
function undo() {
    if (moveHistory.length > 0) {
        board = moveHistory.pop();
        currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
        updatePlayerTurn();
        drawBoard();
        showMessage('Move undone', 'info');
    } else {
        showMessage('No moves to undo', 'error');
    }
}

// Pass turn
function pass() {
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    updatePlayerTurn();
    showMessage(`${currentPlayer === 'black' ? 'Black' : 'White'} passed`, 'info');
    
    // AI move if in vsAI mode
    if (gameMode === 'vsAI' && currentPlayer === 'white' && !gameOver) {
        setTimeout(makeAIMove, 500);
    }
}

// Calculate score
function calculateScore() {
    // Simple territory counting
    let blackScore = blackCaptured;
    let whiteScore = whiteCaptured;
    const visited = new Set();
    
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === null && !visited.has(`${i},${j}`)) {
                const territory = floodFill(i, j, visited);
                const borderColors = getBorderColors(territory);
                
                if (borderColors.size === 1) {
                    if (borderColors.has('black')) {
                        blackScore += territory.length;
                    } else if (borderColors.has('white')) {
                        whiteScore += territory.length;
                    }
                }
            }
        }
    }
    
    // Add komi (6.5 for White)
    whiteScore += 6.5;
    
    const winner = blackScore > whiteScore ? 'Black' : 'White';
    showMessage(`Score: Black ${blackScore} - ${whiteScore} White. ${winner} wins!`, 'info');
}

// Flood fill for territory
function floodFill(x, y, visited) {
    const queue = [[x, y]];
    const territory = [];
    
    while (queue.length > 0) {
        const [cx, cy] = queue.shift();
        const key = `${cx},${cy}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        territory.push([cx, cy]);
        
        const directions = [[1,0], [-1,0], [0,1], [0,-1]];
        for (let [dx, dy] of directions) {
            const nx = cx + dx;
            const ny = cy + dy;
            
            if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
                if (board[nx][ny] === null && !visited.has(`${nx},${ny}`)) {
                    queue.push([nx, ny]);
                }
            }
        }
    }
    
    return territory;
}

// Get border colors of a territory
function getBorderColors(territory) {
    const colors = new Set();
    const directions = [[1,0], [-1,0], [0,1], [0,-1]];
    
    for (let [x, y] of territory) {
        for (let [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
                if (board[nx][ny] !== null) {
                    colors.add(board[nx][ny]);
                }
            }
        }
    }
    
    return colors;
}

// Check if game is over
function checkGameOver() {
    // Simplified - in real Go, game ends after two passes
    return false;
}

// Update player turn display
function updatePlayerTurn() {
    const element = document.getElementById('currentPlayer');
    element.textContent = currentPlayer === 'black' ? '⚫ Black\'s Turn' : '⚪ White\'s Turn';
    element.style.color = currentPlayer === 'black' ? '#000' : '#666';
}

// Show message
function showMessage(msg, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = msg;
    messageEl.style.background = type === 'error' ? '#f8d7da' : '#d4edda';
    messageEl.style.color = type === 'error' ? '#721c24' : '#155724';
    
    setTimeout(() => {
        messageEl.textContent = '';
    }, 3000);
}

// Draw the board
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    cellSize = canvas.width / boardSize;
    
    // Draw grid lines
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < boardSize; i++) {
        // Vertical lines
        ctx.moveTo(i * cellSize + cellSize/2, cellSize/2);
        ctx.lineTo(i * cellSize + cellSize/2, canvas.height - cellSize/2);
        
        // Horizontal lines
        ctx.moveTo(cellSize/2, i * cellSize + cellSize/2);
        ctx.lineTo(canvas.width - cellSize/2, i * cellSize + cellSize/2);
    }
    ctx.stroke();
    
    // Draw star points (hoshi)
    const starPoints = getStarPoints();
    ctx.fillStyle = '#000';
    for (let point of starPoints) {
        ctx.beginPath();
        ctx.arc(point.x * cellSize + cellSize/2, point.y * cellSize + cellSize/2, 3, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Draw stones
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j]) {
                drawStone(i, j, board[i][j]);
            }
        }
    }
}

// Draw a single stone
function drawStone(x, y, color) {
    const centerX = x * cellSize + cellSize/2;
    const centerY = y * cellSize + cellSize/2;
    const radius = cellSize * 0.4;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    
    // Create gradient for 3D effect
    const gradient = ctx.createRadialGradient(
        centerX - radius/3, centerY - radius/3, radius/5,
        centerX, centerY, radius
    );
    
    if (color === 'black') {
        gradient.addColorStop(0, '#666');
        gradient.addColorStop(0.5, '#111');
        gradient.addColorStop(1, '#000');
    } else {
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.5, '#f0f0f0');
        gradient.addColorStop(1, '#ccc');
    }
    
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = color === 'black' ? '#333' : '#999';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// Get star points based on board size
function getStarPoints() {
    const points = [];
    
    if (boardSize === 9) {
        points.push({x: 2, y: 2}, {x: 6, y: 2}, {x: 4, y: 4}, {x: 2, y: 6}, {x: 6, y: 6});
    } else if (boardSize === 13) {
        points.push({x: 3, y: 3}, {x: 9, y: 3}, {x: 6, y: 6}, {x: 3, y: 9}, {x: 9, y: 9});
    } else if (boardSize === 19) {
        points.push(
            {x: 3, y: 3}, {x: 9, y: 3}, {x: 15, y: 3},
            {x: 3, y: 9}, {x: 9, y: 9}, {x: 15, y: 9},
            {x: 3, y: 15}, {x: 9, y: 15}, {x: 15, y: 15}
        );
    }
    
    return points;
}