// Simple AI for beginners
function makeAIMove() {
    if (gameMode !== 'vsAI' || currentPlayer !== 'white' || gameOver) return;
    
    // Get all valid moves
    const validMoves = [];
    
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (isValidMove(i, j, 'white')) {
                validMoves.push({x: i, y: j});
            }
        }
    }
    
    if (validMoves.length === 0) {
        pass();
        return;
    }
    
    // Simple strategy for beginners:
    // 70% chance of random move (makes mistakes)
    // 30% chance of smart move
    
    if (Math.random() < 0.7) {
        // Random move
        const move = validMoves[Math.floor(Math.random() * validMoves.length)];
        makeMove(move.x, move.y);
    } else {
        // Smart move: try to capture or extend
        const smartMove = findSmartMove();
        if (smartMove) {
            makeMove(smartMove.x, smartMove.y);
        } else {
            const move = validMoves[Math.floor(Math.random() * validMoves.length)];
            makeMove(move.x, move.y);
        }
    }
}

// Find a smart move
function findSmartMove() {
    // Try to capture opponent stones
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === 'black') {
                if (countLiberties(i, j, 'black') === 1) {
                    // Find the liberty
                    const liberty = findLiberty(i, j, 'black');
                    if (liberty && isValidMove(liberty.x, liberty.y, 'white')) {
                        return liberty;
                    }
                }
            }
        }
    }
    
    // Try to extend our own groups
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === 'white') {
                const directions = [[1,0], [-1,0], [0,1], [0,-1]];
                for (let [dx, dy] of directions) {
                    const nx = i + dx;
                    const ny = j + dy;
                    if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
                        if (board[nx][ny] === null && isValidMove(nx, ny, 'white')) {
                            return {x: nx, y: ny};
                        }
                    }
                }
            }
        }
    }
    
    return null;
}

// Find liberty of a group
function findLiberty(x, y, color) {
    const visited = new Set();
    const queue = [[x, y]];
    
    while (queue.length > 0) {
        const [cx, cy] = queue.shift();
        const key = `${cx},${cy}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        const directions = [[1,0], [-1,0], [0,1], [0,-1]];
        for (let [dx, dy] of directions) {
            const nx = cx + dx;
            const ny = cy + dy;
            
            if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
                if (board[nx][ny] === null) {
                    return {x: nx, y: ny};
                } else if (board[nx][ny] === color) {
                    queue.push([nx, ny]);
                }
            }
        }
    }
    
    return null;
}