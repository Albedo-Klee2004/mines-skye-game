// Initial Game Data
let gameData = {
    credits: 1000,
    currentBet: 0,
    gridSize: 5,
    mines: [],
    revealed: [],
    creditGain: 0,
    hitCount: 0,
    gameStarted: false
};

// DOM Elements
const creditDisplay = document.getElementById('credits');
const currentBetDisplay = document.getElementById('current-bet');
const creditGainDisplay = document.getElementById('credit-gain');
const hitCountDisplay = document.getElementById('hit-count');
const gameBoard = document.getElementById('game-board');
const cashoutBtn = document.getElementById('cashout-btn');
const restartBtn = document.getElementById('restart-btn');
const resetBtn = document.getElementById('reset-btn');
const betAmountInput = document.getElementById('bet-amount');
const bombCountSelect = document.getElementById('bomb-count');
const setBetButton = document.getElementById('set-bet-btn');

// Betting multipliers for different hit counts
const bettingMultipliers = {
    1: 1.13,
    2: 1.35,
    3: 1.64,
    4: 2,
    5: 2.48,
    6: 3.1,
    7: 3.92,
    8: 6.6,
    9: 8.8,
    10: 12,
    11: 16.8,
    12: 24.27,
    13: 36.41,
    14: 57.22,
    15: 95.37,
    16: 171.67,
    17: 343.35,
    18: 801.16,
    19: 2400
};

// Initialize game
function initGame() {
    disableRestartButton();
    gameData.revealed = [];
    gameData.creditGain = 0;
    gameData.hitCount = 0;
    gameData.gameStarted = false;
    gameData.currentBet = 0;
    updateCredits();
    renderGameBoard();
    disableBoard();
    resetUI();
}

// Fetch initial credits from Local Storage or default to 1000
function fetchInitialCredits() {
    const storedCredits = localStorage.getItem('credits');
    gameData.credits = storedCredits ? Number(storedCredits) : 1000;
    updateCredits();  // Ensure the initial credits are displayed
}

// Reset UI elements after game ends or resets
function resetUI() {
    cashoutBtn.disabled = true; // Disable cashout button
    restartBtn.disabled = false; // Enable restart button
    betAmountInput.disabled = false; // Allow setting bet amount
    bombCountSelect.disabled = false; // Allow selecting bomb count
    setBetButton.disabled = false; // Allow setting bet
}

// Start the game after setting a valid bet
function startGame() {
    if (gameData.currentBet > 0 && gameData.currentBet <= gameData.credits) {
        gameData.mines = generateMines(parseInt(bombCountSelect.value)); // Generate mines
        gameData.gameStarted = true;

        // Deduct the current bet from credits
        gameData.credits -= gameData.currentBet;

        enableBoard(); // Enable the board
        updateCredits(); // Update the displayed credits
        disableBettingUI();
    } else {
        alert("Please place a valid bet within your credit limit.");
    }
}

// Generate Random Mines
function generateMines(bombCount) {
    let mines = [];
    while (mines.length < bombCount) {
        let minePos = Math.floor(Math.random() * (gameData.gridSize * gameData.gridSize));
        if (!mines.includes(minePos)) {
            mines.push(minePos);
        }
    }
    return mines;
}

// Update Credit Display
function updateCredits() {
    creditDisplay.textContent = gameData.credits;
    currentBetDisplay.textContent = gameData.currentBet;
    creditGainDisplay.textContent = gameData.creditGain;
    hitCountDisplay.textContent = gameData.hitCount;

    // Update credits in Local Storage
    localStorage.setItem('credits', gameData.credits);
}

// Render Game Board
function renderGameBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < gameData.gridSize * gameData.gridSize; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.dataset.index = i;
        tile.style.backgroundImage = "url('tiles.png')";
        tile.style.backgroundSize = "cover";
        tile.addEventListener('click', revealTile);
        gameBoard.appendChild(tile);
    }
}

// Disable the board
function disableBoard() {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.removeEventListener('click', revealTile); // Remove click event
        tile.style.pointerEvents = 'none'; // Disable pointer events for each tile
    });
}

// Enable the board
function enableBoard() {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.addEventListener('click', revealTile); // Re-attach click event
        tile.style.pointerEvents = 'auto'; // Enable pointer events for each tile
    });
}

// Reveal Tile Functionality
function revealTile(event) {
    if (!gameData.gameStarted) return;

    const index = parseInt(event.target.dataset.index);

    // Check if the tile has already been revealed
    if (gameData.revealed.includes(index)) {
        alert("This tile has already been revealed!");
        return;
    }

    // Check for mine
    if (gameData.mines.includes(index)) {
        console.log("Mine hit at index:", index); // Debug log
        event.target.style.backgroundImage = "url('bomb.png')";
        // alert('Game Over! You hit a mine!');
        revealAllMines(); // Reveal all the mines
        disableBoard();   // Disable the board after losing
        enableRestartButton(); // Enable restart button
        cashoutBtn.disabled = true; // Disable cashout after loss
        cashoutBtn.style.backgroundColor = 'grey';

        // Update game state
        gameData.gameStarted = false; // Mark the game as not started
        disableBettingUI(); // Disable betting UI components
    } else {
        console.log("Tile revealed at index:", index); // Debug log
        event.target.style.backgroundImage = "url('coin.png')";
        gameData.hitCount++;
        cashoutBtn.disabled = false; // Enable cashout if a tile is revealed without hitting a mine
    }

    gameData.revealed.push(index);
    hitCountDisplay.textContent = gameData.hitCount;
}

// Reveal All Mines
function revealAllMines() {
    gameData.mines.forEach(mineIndex => {
        const mineTile = document.querySelector(`.tile[data-index='${mineIndex}']`);
        if (mineTile) {
            mineTile.style.backgroundImage = "url('bomb.png')";
        }
    });
}

// Cash Out Functionality
function cashOut() {
    if (!gameData.gameStarted) {
        alert("No active game to cash out.");
        return;
    }

    let multiplier = bettingMultipliers[gameData.hitCount] || 0; // Get multiplier based on hits
    let payout = (gameData.currentBet * multiplier) + gameData.creditGain;

    // alert(`You cashed out with ${payout.toFixed(2)} credits!`);
    gameData.credits += payout;
    gameData.creditGain = 0;
    gameData.hitCount = 0;
    hitCountDisplay.textContent = gameData.hitCount;
    updateCredits();
    initGame(); // Restart game after cashout
    resetDisplay();
}

// Disable betting inputs and buttons during the game
function disableBettingUI() {
    betAmountInput.disabled = true;
    bombCountSelect.disabled = true;
    setBetButton.disabled = true;
}

// Restart Game
function restartGame() {
    gameData.creditGain = 0;
    gameData.hitCount = 0;
    gameData.revealed = [];
    gameData.currentBet = 0;
    gameData.gameStarted = false;

    renderGameBoard();
    updateCredits();
    resetUI();
    cashoutBtn.style.backgroundColor = '';
    resetDisplay();
}

// Reset credits to 1000 and update Local Storage
function resetCredits() {
    gameData.credits = 1000;
    localStorage.setItem('credits', gameData.credits);
    updateCredits();
}

// Event Listeners
setBetButton.addEventListener('click', function () {
    const betAmount = parseInt(betAmountInput.value);
    if (betAmount > 0 && betAmount <= gameData.credits) {
        gameData.currentBet = betAmount;
        updateCredits();
        startGame();

        disableRestartButton();
    } else {
        alert('Please enter a valid bet amount within your credit limit.');
    }
});

cashoutBtn.addEventListener('click', cashOut);
restartBtn.addEventListener('click', restartGame);
resetBtn.addEventListener('click', resetCredits);

// Initialize Game
fetchInitialCredits();
initGame();

// Enable restart button
function enableRestartButton() {
    restartBtn.disabled = false; // Enable the button
    restartBtn.style.backgroundColor = ''; // Reset color to default (optional)
}

// Disable restart button
function disableRestartButton() {
    restartBtn.disabled = true; // Disable the button
    restartBtn.style.backgroundColor = 'grey'; // Change color to indicate it's disabled (optional)
}



// Update the hit display function
function updateHitDisplay() {
    hitCountDisplay.textContent = gameData.hitCount;

    // Get the current multiplier based on the hit count
    const currentMultiplier = bettingMultipliers[gameData.hitCount] || 1.0; // Fallback to 1.0 if no multiplier
    const nextMultiplier = bettingMultipliers[gameData.hitCount + 1] || "N/A"; // Next multiplier based on hit count

    // Update the multiplier displays
    document.getElementById('current-multiplier').textContent = currentMultiplier.toFixed(2);
    document.getElementById('next-multiplier').textContent = nextMultiplier;
}

// Modify the revealTile function to update multipliers after each hit
function revealTile(event) {
    if (!gameData.gameStarted) return;

    const index = parseInt(event.target.dataset.index);

    // Check if the tile has already been revealed
    if (gameData.revealed.includes(index)) {
        alert("This tile has already been revealed!");
        return;
    }

    // Check for mine
    if (gameData.mines.includes(index)) {
        console.log("Mine hit at index:", index); // Debug log
        event.target.style.backgroundImage = "url('bomb.png')";
        //alert('Game Over! You hit a mine!');
        revealAllMines(); // Reveal all the mines
        disableBoard();   // Disable the board after losing
        enableRestartButton(); // Enable restart button
        cashoutBtn.disabled = true; // Disable cashout after loss
        cashoutBtn.style.backgroundColor = 'grey';

        // Update game state
        gameData.gameStarted = false; // Mark the game as not started
        disableBettingUI(); // Disable betting UI components
    } else {
        console.log("Tile revealed at index:", index); // Debug log
        event.target.style.backgroundImage = "url('coin.png')";
        gameData.hitCount++;
        cashoutBtn.disabled = false; // Enable cashout if a tile is revealed without hitting a mine
        
        // Update multipliers and hit count display
        updateHitDisplay(); // Update the multiplier display
    }

    gameData.revealed.push(index);
}





// Function to reset the display
function resetDisplay() {
    // Reset hit count display
    hitCountDisplay.textContent = '0'; // Assuming you want to reset to 0

    // Reset multiplier displays
    document.getElementById('current-multiplier').textContent = '1.00'; // Initial multiplier
    document.getElementById('next-multiplier').textContent = "N/A"; // Assuming N/A is the initial state for the next multiplier

    // Reset cashout credits display
    document.getElementById('cashout-credits').textContent = '0.00'; // Reset cashout credits
}




// Function to calculate and display cashout credits based on hits and current bet
function updateCashoutCredits() {
    // Get the current multiplier based on the hit count
    const currentMultiplier = bettingMultipliers[gameData.hitCount] || 1.0; // Fallback to 1.0 if no multiplier
    const currentBet = gameData.currentBet;

    // Calculate cashout credits
    const cashoutCredits = currentMultiplier * currentBet;

    // Update the cashout credits display
    document.getElementById('cashout-credits').textContent = cashoutCredits.toFixed(2);
}

// Update the hit display function
function updateHitDisplay() {
    hitCountDisplay.textContent = gameData.hitCount;

    // Get the current multiplier based on the hit count
    const currentMultiplier = bettingMultipliers[gameData.hitCount] || 1.0; // Fallback to 1.0 if no multiplier
    const nextMultiplier = bettingMultipliers[gameData.hitCount + 1] || "N/A"; // Next multiplier based on hit count

    // Update the multiplier displays
    document.getElementById('current-multiplier').textContent = currentMultiplier.toFixed(2);
    document.getElementById('next-multiplier').textContent = nextMultiplier;

    // Calculate and display the cashout credits using the current multiplier
    updateCashoutCredits();
    document.getElementById('restart-button').addEventListener('click', restartGame);
}

