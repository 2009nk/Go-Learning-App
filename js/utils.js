// Utility functions

// Save game to local storage
function saveGame(board, currentPlayer, blackCaptured, whiteCaptured) {
    const gameState = {
        board: board,
        currentPlayer: currentPlayer,
        blackCaptured: blackCaptured,
        whiteCaptured: whiteCaptured,
        timestamp: new Date().getTime()
    };
    
    localStorage.setItem('goGameSave', JSON.stringify(gameState));
    showMessage('Game saved!', 'info');
}

// Load game from local storage
function loadGame() {
    const saved = localStorage.getItem('goGameSave');
    if (saved) {
        const gameState = JSON.parse(saved);
        
        // Check if save is less than 24 hours old
        const age = new Date().getTime() - gameState.timestamp;
        if (age < 24 * 60 * 60 * 1000) {
            board = gameState.board;
            currentPlayer = gameState.currentPlayer;
            blackCaptured = gameState.blackCaptured;
            whiteCaptured = gameState.whiteCaptured;
            
            drawBoard();
            updatePlayerTurn();
            showMessage('Game loaded!', 'info');
            return true;
        }
    }
    
    showMessage('No saved game found', 'error');
    return false;
}

// Export game as SGF
function exportSGF() {
    let sgf = '(;GM[1]FF[4]SZ[' + boardSize + ']';
    
    // Add moves (simplified)
    for (let i = 0; i < moveHistory.length; i++) {
        // This would need proper move tracking
        sgf += ';B[aa]';
    }
    
    sgf += ')';
    
    // Create download link
    const blob = new Blob([sgf], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game.sgf';
    a.click();
}

// Share game result
function shareResult() {
    const score = calculateScore();
    const text = `I just played a game of Go! Final score: Black ${score.black} - ${score.white} White`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Go Game Result',
            text: text
        });
    } else {
        navigator.clipboard.writeText(text);
        showMessage('Result copied to clipboard!', 'info');
    }
}

// Sound effects (optional)
function playSound(type) {
    // You can add sound files later
    // const audio = new Audio(`assets/sounds/${type}.mp3`);
    // audio.play();
}

// Format time
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Random tip for loading screen
const tips = [
    "The player with black stones moves first.",
    "Stones are captured when they lose their last liberty.",
    "The Ko rule prevents infinite repetition.",
    "Territory is surrounded empty space.",
    "Handicap stones help balance games between different skill levels.",
    "The 9x9 board is best for learning.",
    "Professional games are played on 19x19 boards.",
    "Go originated in China over 4000 years ago.",
    "There are more possible Go games than atoms in the universe!",
    "In Go, you don't move stones - you place them."
];

function getRandomTip() {
    return tips[Math.floor(Math.random() * tips.length)];
}