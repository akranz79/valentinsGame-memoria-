const gameBoard = document.querySelector('.memory-game');
const restartButton = document.querySelector('#restart-btn');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const movesElement = document.querySelector('#moves-count');
const timerElement = document.querySelector('#timer');
const highscoreElement = document.querySelector('#highscore');

// --- Efeitos Sonoros ---
const flipSound = new Audio('audio/flip.mp3');
const matchSound = new Audio('audio/match.mp3');
const winSound = new Audio('audio/win.mp3');

let currentGridSize = 4; // Dificuldade padrão
let gameCards = [];

let firstCard, secondCard;
let hasFlippedCard = false;
let lockBoard = false;
let moves = 0;
let timerInterval = null;
let secondsElapsed = 0;
let gameStarted = false;

// Função para embaralhar as cartas (Fisher-Yates)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Função para criar o tabuleiro
function createBoard() {
    // Reseta o estado do jogo
    resetGameStats();
    displayHighScore();

    // Define o número de pares e seleciona as cartas para o nível atual
    const numberOfPairs = (currentGridSize * currentGridSize) / 2;
    
    // Gera os nomes das cartas com base no padrão "Screenshot_X".
    // Garante que você tenha imagens suficientes na pasta /img para a quantidade de pares.
    // Ex: 4x4 precisa de 8 imagens (Screenshot_1.png a Screenshot_8.png).
    const cardsForGame = [];
    for (let i = 1; i <= numberOfPairs; i++) {
        cardsForGame.push(`Screenshot_${i}`);
    }
    
    // Duplica para formar os pares e embaralha
    gameCards = [...cardsForGame, ...cardsForGame];
    shuffle(gameCards);

    // Para a matriz 3x3, insere um espaço vazio no centro
    if (currentGridSize === 3) {
        const middleIndex = 4; // O 5º elemento em um grid 0-indexado
        gameCards.splice(middleIndex, 0, 'empty-slot');
    }

    // Atualiza o grid no CSS usando variáveis
    gameBoard.style.setProperty('--grid-size', currentGridSize);

    gameBoard.innerHTML = ''; // Limpa o tabuleiro antes de criar um novo

    // Reseta o estado do tabuleiro lógico
    resetBoard();
    gameCards.forEach(cardValue => {
        if (cardValue === 'empty-slot') {
            const emptySlot = document.createElement('div');
            gameBoard.appendChild(emptySlot);
            return;
        }

        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.framework = cardValue;

        // Lembre-se de adicionar as novas imagens (css.svg, html.svg, etc.) na pasta 'img'
        card.innerHTML = `
            <img class="front-face" src="img/${cardValue}.png" alt="${cardValue}">
            <img class="back-face" src="img/js-badge.png" alt="Verso da Carta">
        `;

        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function startTimer() {
    if (gameStarted) return;
    gameStarted = true;
    timerInterval = setInterval(() => {
        secondsElapsed++;
        const minutes = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        const seconds = (secondsElapsed % 60).toString().padStart(2, '0');
        timerElement.textContent = `${minutes}:${seconds}`;
    }, 1000);
}

function resetGameStats() {
    clearInterval(timerInterval);
    timerInterval = null;
    secondsElapsed = 0;
    moves = 0;
    gameStarted = false;
    timerElement.textContent = '00:00';
    movesElement.textContent = '0';
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return; // Impede duplo clique na mesma carta

    // Toca o som de virar a carta
    flipSound.currentTime = 0; // Reinicia o som caso ele já esteja tocando
    flipSound.play();

    this.classList.add('flip');

    if (!hasFlippedCard) {
        startTimer();
        // Primeiro clique
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    // Segundo clique
    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    moves++;
    movesElement.textContent = moves;
    let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    matchSound.play(); // Toca o som de acerto
    resetBoard();
    checkWinCondition();
}

function unflipCards() {
    lockBoard = true; // Bloqueia o tabuleiro
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 1000); // RN02 - Tempo de visualização de 1 segundo
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function checkWinCondition() {
    const allFlippedCards = document.querySelectorAll('.memory-card.flip');
    const numberOfPairs = Math.floor((currentGridSize * currentGridSize) / 2);
    const totalCardsInGame = numberOfPairs * 2;

    if (allFlippedCards.length === totalCardsInGame) {
        clearInterval(timerInterval); // Para o cronômetro
        updateHighScore();
        winSound.play(); // Toca o som de vitória
        setTimeout(() => alert(`Parabéns, você venceu em ${moves} jogadas e ${timerElement.textContent} de tempo!`), 500);
    }
}

function displayHighScore() {
    const key = `highscore_${currentGridSize}x${currentGridSize}`;
    const storedHighScore = localStorage.getItem(key);
    highscoreElement.textContent = storedHighScore ? storedHighScore : '--';
}

function updateHighScore() {
    const key = `highscore_${currentGridSize}x${currentGridSize}`;
    const storedHighScore = localStorage.getItem(key);

    // Se não houver recorde ou se a pontuação atual for melhor (menor), atualiza.
    if (!storedHighScore || moves < parseInt(storedHighScore)) {
        localStorage.setItem(key, moves);
        displayHighScore(); // Atualiza a exibição
    }
}

// Inicia o jogo quando o script é carregado
createBoard();
restartButton.addEventListener('click', createBoard);

// Adiciona listeners para os botões de dificuldade
difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        difficultyButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentGridSize = parseInt(button.dataset.grid);
        createBoard();
    });
});