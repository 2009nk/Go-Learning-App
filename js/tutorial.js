// Tutorial data
const tutorials = [
    {
        id: 1,
        title: "Understanding Liberties",
        description: "Learn what liberties are and why they matter",
        difficulty: "Beginner",
        boardSize: 9,
        steps: [
            {
                instruction: "Look at the black stone. How many liberties does it have? Count the empty spaces around it.",
                board: [
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, 'black', null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null]
                ],
                expected: null // Just observation
            },
            {
                instruction: "Now place a white stone next to the black stone to reduce its liberties.",
                board: [
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, 'black', null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null]
                ],
                expected: {x: 3, y: 4, color: 'white'}
            }
        ]
    },
    {
        id: 2,
        title: "Capturing Stones",
        description: "Learn how to capture your opponent's stones",
        difficulty: "Beginner",
        boardSize: 9,
        steps: [
            {
                instruction: "The white stone is in atari (has only one liberty). Find the liberty and capture it!",
                board: [
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, 'white', 'black', null, null, null, null],
                    [null, null, null, 'black', null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null]
                ],
                expected: {x: 2, y: 3, color: 'black'}
            }
        ]
    }
];

let currentTutorial = null;
let currentStep = 0;
let tutorialBoard = [];
let tutorialCanvas, tutorialCtx;

// Load tutorials
function loadTutorials() {
    const tutorialList = document.getElementById('tutorialList');
    tutorialList.innerHTML = '';
    
    tutorials.forEach(tutorial => {
        const div = document.createElement('div');
        div.className = 'tutorial-item';
        div.onclick = () => startTutorial(tutorial.id);
        div.innerHTML = `
            <h3>${tutorial.title}</h3>
            <p>${tutorial.description}</p>
            <span class="difficulty">${tutorial.difficulty}</span>
        `;
        tutorialList.appendChild(div);
    });
}

// Start a tutorial
function startTutorial(tutorialId) {
    currentTutorial = tutorials.find(t => t.id === tutorialId);
    currentStep = 0;
    
    // Initialize tutorial board
    tutorialBoard = JSON.parse(JSON.stringify(currentTutorial.steps[0].board));
    
    // Show active tutorial
    document.getElementById('tutorialList').style.display = 'none';
    document.getElementById('activeTutorial').style.display = 'block';
    
    // Update UI
    document.getElementById('tutorialTitle').textContent = currentTutorial.title;
    updateTutorialStep();
    
    // Initialize canvas
    tutorialCanvas = document.getElementById('tutorialBoard');
    tutorialCtx = tutorialCanvas.getContext('2d');
    tutorialCanvas.addEventListener('click', handleTutorialClick);
    
    drawTutorialBoard();
}

// Update tutorial step
function updateTutorialStep() {
    const step = currentTutorial.steps[currentStep];
    document.getElementById('stepCounter').textContent = `Step ${currentStep + 1}/${currentTutorial.steps.length}`;
    document.getElementById('tutorialInstruction').textContent = step.instruction;
    
    // Update buttons
    document.getElementById('prevBtn').disabled = currentStep === 0;
    document.getElementById('nextBtn').disabled = currentStep === currentTutorial.steps.length - 1;
}

// Handle tutorial board click
function handleTutorialClick(e) {
    if (!currentTutorial) return;
    
    const step = currentTutorial.steps[currentStep];
    
    // If step has expected move
    if (step.expected) {
        const rect = tutorialCanvas.getBoundingClientRect();
        const scaleX = tutorialCanvas.width / rect.width;
        const scaleY = tutorialCanvas.height / rect.height;
        
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        const cellSize = tutorialCanvas.width / currentTutorial.boardSize;
        const x = Math.floor(mouseX / cellSize);
        const y = Math.floor(mouseY / cellSize);
        
        // Check if move is correct
        if (x === step.expected.x && y === step.expected.y) {
            showTutorialFeedback('✅ Correct! ' + (step.feedback || 'Great job!'), true);
            
            // Update board
            tutorialBoard[x][y] = step.expected.color;
            drawTutorialBoard();
            
            // Auto advance to next step after 1 second
            setTimeout(() => {
                if (currentStep < currentTutorial.steps.length - 1) {
                    nextStep();
                }
            }, 1000);
        } else {
            showTutorialFeedback('❌ Try again! That\'s not the right spot.', false);
        }
    }
}

// Show tutorial feedback
function showTutorialFeedback(message, isCorrect) {
    const feedbackEl = document.getElementById('tutorialFeedback');
    feedbackEl.textContent = message;
    feedbackEl.className = 'tutorial-feedback ' + (isCorrect ? 'feedback-correct' : 'feedback-incorrect');
}

// Next step
function nextStep() {
    if (currentStep < currentTutorial.steps.length - 1) {
        currentStep++;
        const step = currentTutorial.steps[currentStep];
        tutorialBoard = JSON.parse(JSON.stringify(step.board));
        updateTutorialStep();
        drawTutorialBoard();
        document.getElementById('tutorialFeedback').textContent = '';
    }
}

// Previous step
function previousStep() {
    if (currentStep > 0) {
        currentStep--;
        const step = currentTutorial.steps[currentStep];
        tutorialBoard = JSON.parse(JSON.stringify(step.board));
        updateTutorialStep();
        drawTutorialBoard();
        document.getElementById('tutorialFeedback').textContent = '';
    }
}

// Exit tutorial
function exitTutorial() {
    currentTutorial = null;
    document.getElementById('tutorialList').style.display = 'grid';
    document.getElementById('activeTutorial').style.display = 'none';
}

// Draw tutorial board
function drawTutorialBoard() {
    if (!tutorialCtx || !currentTutorial) return;
    
    tutorialCtx.clearRect(0, 0, tutorialCanvas.width, tutorialCanvas.height);
    
    // Draw background
    tutorialCtx.fillStyle = '#DEB887';
    tutorialCtx.fillRect(0, 0, tutorialCanvas.width, tutorialCanvas.height);
    
    const cellSize = tutorialCanvas.width / currentTutorial.boardSize;
    
    // Draw grid
    tutorialCtx.beginPath();
    tutorialCtx.strokeStyle = '#000';
    tutorialCtx.lineWidth = 1;
    
    for (let i = 0; i < currentTutorial.boardSize; i++) {
        tutorialCtx.moveTo(i * cellSize + cellSize/2, cellSize/2);
        tutorialCtx.lineTo(i * cellSize + cellSize/2, tutorialCanvas.height - cellSize/2);
        
        tutorialCtx.moveTo(cellSize/2, i * cellSize + cellSize/2);
        tutorialCtx.lineTo(tutorialCanvas.width - cellSize/2, i * cellSize + cellSize/2);
    }
    tutorialCtx.stroke();
    
    // Draw stones
    for (let i = 0; i < currentTutorial.boardSize; i++) {
        for (let j = 0; j < currentTutorial.boardSize; j++) {
            if (tutorialBoard[i][j]) {
                drawTutorialStone(i, j, tutorialBoard[i][j], cellSize);
            }
        }
    }
    
    // Highlight if needed
    const step = currentTutorial.steps[currentStep];
    if (step.highlight) {
        tutorialCtx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        tutorialCtx.fillRect(
            step.highlight.x * cellSize,
            step.highlight.y * cellSize,
            cellSize,
            cellSize
        );
    }
}

// Draw tutorial stone
function drawTutorialStone(x, y, color, cellSize) {
    const centerX = x * cellSize + cellSize/2;
    const centerY = y * cellSize + cellSize/2;
    const radius = cellSize * 0.4;
    
    tutorialCtx.beginPath();
    tutorialCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    
    const gradient = tutorialCtx.createRadialGradient(
        centerX - radius/3, centerY - radius/3, radius/5,
        centerX, centerY, radius
    );
    
    if (color === 'black') {
        gradient.addColorStop(0, '#666');
        gradient.addColorStop(1, '#000');
    } else {
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(1, '#ccc');
    }
    
    tutorialCtx.fillStyle = gradient;
    tutorialCtx.fill();
    tutorialCtx.strokeStyle = color === 'black' ? '#333' : '#999';
    tutorialCtx.stroke();
}

// Load tutorials when page loads
window.onload = function() {
    if (document.getElementById('tutorialList')) {
        loadTutorials();
    }
};