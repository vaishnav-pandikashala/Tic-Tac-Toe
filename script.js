// ============================================
// TIC TAC TOE
// USER = X
// COMPUTER = O
// ============================================


let board = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
];

let gameOver = false;

let playerTurn = true;

let playerScore = 0;

let computerScore = 0;

let drawScore = 0;

let resetTimer = null;


// ============================================
// HTML ELEMENTS
// ============================================

const cells = document.querySelectorAll(".cell");

const statusText =
    document.getElementById("status");

const newGameButton =
    document.getElementById("newGame");

const musicButton =
    document.getElementById("musicButton");

const playerScoreText =
    document.getElementById("playerScore");

const computerScoreText =
    document.getElementById("computerScore");

const drawScoreText =
    document.getElementById("drawScore");


// ============================================
// CELL CLICK EVENTS
// ============================================

cells.forEach(function (cell, index) {

    cell.addEventListener("click", function () {

        makeMove(index);

    });

});


// ============================================
// WINNING COMBINATIONS
// ============================================

const winningCombinations = [

    [0, 1, 2],

    [3, 4, 5],

    [6, 7, 8],

    [0, 3, 6],

    [1, 4, 7],

    [2, 5, 8],

    [0, 4, 8],

    [2, 4, 6]

];


// ============================================
// AUDIO
// ============================================

let audioContext = null;

let musicEnabled = false;

let musicInterval = null;

let musicStep = 0;


function startAudio() {

    if (!audioContext) {

        audioContext =
            new (window.AudioContext ||
                window.webkitAudioContext)();

    }

    if (audioContext.state === "suspended") {

        audioContext.resume();

    }

}


function playTone(
    frequency,
    duration,
    type,
    volume
) {

    startAudio();

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type = type;

    oscillator.frequency.value =
        frequency;

    gain.gain.setValueAtTime(
        volume,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
    );

    oscillator.connect(gain);

    gain.connect(
        audioContext.destination
    );

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + duration
    );

}


// ============================================
// SOUND EFFECTS
// ============================================

function clickSound() {

    playTone(
        600,
        0.08,
        "square",
        0.04
    );

}


function winSound() {

    playTone(
        523,
        0.15,
        "sine",
        0.08
    );

    setTimeout(function () {

        playTone(
            659,
            0.15,
            "sine",
            0.08
        );

    }, 150);

    setTimeout(function () {

        playTone(
            784,
            0.3,
            "sine",
            0.08
        );

    }, 300);

}


function loseSound() {

    playTone(
        400,
        0.2,
        "sawtooth",
        0.05
    );

    setTimeout(function () {

        playTone(
            300,
            0.3,
            "sawtooth",
            0.05
        );

    }, 200);

}


function drawSound() {

    playTone(
        500,
        0.2,
        "triangle",
        0.06
    );

    setTimeout(function () {

        playTone(
            500,
            0.2,
            "triangle",
            0.06
        );

    }, 250);

}


// ============================================
// BACKGROUND MUSIC
// ============================================

const melody = [

    261.63,
    329.63,
    392.00,
    329.63,
    293.66,
    349.23,
    440.00,
    349.23

];


function musicTick() {

    if (!musicEnabled) {

        return;

    }

    playTone(
        melody[musicStep],
        0.35,
        "triangle",
        0.025
    );

    musicStep++;

    if (
        musicStep >=
        melody.length
    ) {

        musicStep = 0;

    }

}


function startMusic() {

    startAudio();

    if (musicInterval) {

        clearInterval(
            musicInterval
        );

    }

    musicEnabled = true;

    musicButton.textContent =
        "🔊 Music ON";

    musicTick();

    musicInterval =
        setInterval(
            musicTick,
            450
        );

}


function stopMusic() {

    musicEnabled = false;

    if (musicInterval) {

        clearInterval(
            musicInterval
        );

        musicInterval = null;

    }

    musicButton.textContent =
        "🔇 Music OFF";

}


// ============================================
// MUSIC BUTTON
// ============================================

musicButton.addEventListener(
    "click",
    function () {

        if (musicEnabled) {

            stopMusic();

        } else {

            startMusic();

        }

    }
);


// ============================================
// PLAYER MOVE
// ============================================

function makeMove(index) {

    if (gameOver) {

        return;

    }

    if (!playerTurn) {

        return;

    }

    if (board[index] !== "") {

        return;

    }


    startAudio();


    // Player = X

    board[index] = "X";

    cells[index].textContent = "X";

    cells[index].classList.add("x");

    clickSound();


    // Check player win

    const winningLine =
        getWinningLine("X");


    if (winningLine) {

        playerWin(winningLine);

        return;

    }


    // Check draw

    if (isDraw()) {

        drawGame();

        return;

    }


    // Computer turn

    playerTurn = false;

    statusText.textContent =
        "🤖 Computer is thinking...";


    setTimeout(
        computerMove,
        600
    );

}


// ============================================
// COMPUTER MOVE
// ============================================

function computerMove() {

    if (gameOver) {

        return;

    }


    const bestMove =
        findBestMove();


    if (bestMove === undefined) {

        drawGame();

        return;

    }


    board[bestMove] = "O";

    cells[bestMove].textContent = "O";

    cells[bestMove].classList.add("o");

    clickSound();


    // Check computer win

    const winningLine =
        getWinningLine("O");


    if (winningLine) {

        computerWin(winningLine);

        return;

    }


    // Check draw

    if (isDraw()) {

        drawGame();

        return;

    }


    playerTurn = true;

    statusText.textContent =
        "🎮 Your Turn!";

}


// ============================================
// AI
// ============================================

function findBestMove() {

    let bestScore = -Infinity;

    let bestMove = undefined;


    for (
        let i = 0;
        i < board.length;
        i++
    ) {

        if (board[i] === "") {

            board[i] = "O";


            const score =
                minimax(
                    board,
                    0,
                    false
                );


            board[i] = "";


            if (score > bestScore) {

                bestScore = score;

                bestMove = i;

            }

        }

    }


    return bestMove;

}


// ============================================
// MINIMAX AI
// ============================================

function minimax(
    position,
    depth,
    maximizing
) {

    if (
        checkWinnerForBoard(
            position,
            "O"
        )
    ) {

        return 10 - depth;

    }


    if (
        checkWinnerForBoard(
            position,
            "X"
        )
    ) {

        return depth - 10;

    }


    if (
        position.every(function (cell) {

            return cell !== "";

        })
    ) {

        return 0;

    }


    if (maximizing) {

        let bestScore = -Infinity;


        for (
            let i = 0;
            i < position.length;
            i++
        ) {

            if (position[i] === "") {

                position[i] = "O";


                const score =
                    minimax(
                        position,
                        depth + 1,
                        false
                    );


                position[i] = "";


                bestScore =
                    Math.max(
                        bestScore,
                        score
                    );

            }

        }


        return bestScore;

    }


    let bestScore = Infinity;


    for (
        let i = 0;
        i < position.length;
        i++
    ) {

        if (position[i] === "") {

            position[i] = "X";


            const score =
                minimax(
                    position,
                    depth + 1,
                    true
                );


            position[i] = "";


            bestScore =
                Math.min(
                    bestScore,
                    score
                );

        }

    }


    return bestScore;

}


// ============================================
// GET WINNING LINE
// ============================================

function getWinningLine(player) {

    for (
        const combination
        of winningCombinations
    ) {

        const a = combination[0];

        const b = combination[1];

        const c = combination[2];


        if (
            board[a] === player &&
            board[b] === player &&
            board[c] === player
        ) {

            return combination;

        }

    }


    return null;

}


// ============================================
// CHECK WINNER FOR AI
// ============================================

function checkWinnerForBoard(
    position,
    player
) {

    return winningCombinations.some(
        function (combination) {

            return combination.every(
                function (index) {

                    return (
                        position[index] ===
                        player
                    );

                }
            );

        }
    );

}


// ============================================
// PLAYER WIN
// ============================================

function playerWin(line) {

    gameOver = true;

    playerScore++;

    playerScoreText.textContent =
        playerScore;

    statusText.textContent =
        "🏆 YOU WIN! 🎉";

    highlightWinner(line);

    winSound();


    // AUTOMATIC RESET AFTER 2 SECONDS

    resetTimer = setTimeout(
        function () {

            restartGame();

        },
        2000
    );

}


// ============================================
// COMPUTER WIN
// ============================================

function computerWin(line) {

    gameOver = true;

    computerScore++;

    computerScoreText.textContent =
        computerScore;

    statusText.textContent =
        "🤖 COMPUTER WINS!";

    highlightWinner(line);

    loseSound();


    // AUTOMATIC RESET AFTER 2 SECONDS

    resetTimer = setTimeout(
        function () {

            restartGame();

        },
        2000
    );

}


// ============================================
// DRAW
// ============================================

function drawGame() {

    gameOver = true;

    drawScore++;

    drawScoreText.textContent =
        drawScore;

    statusText.textContent =
        "🤝 IT'S A DRAW!";

    drawSound();


    // AUTOMATIC RESET AFTER 2 SECONDS

    resetTimer = setTimeout(
        function () {

            restartGame();

        },
        2000
    );

}


// ============================================
// WINNING ANIMATION
// ============================================

function highlightWinner(line) {

    line.forEach(
        function (index) {

            cells[index]
                .classList.add(
                    "winner"
                );

        }
    );

}


// ============================================
// CHECK DRAW
// ============================================

function isDraw() {

    return board.every(
        function (cell) {

            return cell !== "";

        }
    );

}


// ============================================
// RESTART GAME
// ============================================

function restartGame() {

    // Cancel previous timer

    if (resetTimer) {

        clearTimeout(resetTimer);

        resetTimer = null;

    }


    // Clear board

    board = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
    ];


    gameOver = false;

    playerTurn = true;


    // Clear cells

    cells.forEach(
        function (cell) {

            cell.textContent = "";

            cell.classList.remove(
                "x",
                "o",
                "winner"
            );

        }
    );


    statusText.textContent =
        "🎮 Your Turn!";


    startAudio();

}


// ============================================
// NEW GAME BUTTON
// ============================================

newGameButton.addEventListener(
    "click",
    function () {

        restartGame();

    }
);