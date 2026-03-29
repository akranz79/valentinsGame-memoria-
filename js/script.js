const gameBoard = document.querySelector('.memory-game');
const restartButton = document.querySelector('#restart-btn');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const movesElement = document.querySelector('#moves-count');
const timerElement = document.querySelector('#timer');
const highscoreElement = document.querySelector('#highscore');
const muteButton = document.querySelector('#mute-btn');
const pairsLeftElement = document.querySelector('#pairs-left');

// --- Modal Elements ---
const victoryModalOverlay = document.querySelector('#victory-modal-overlay');
const finalMovesElement = document.querySelector('#final-moves');
const finalTimeElement = document.querySelector('#final-time');
const playAgainButton = document.querySelector('#play-again-btn');
const mostMissedContainer = document.querySelector('#most-missed-container');
const mostMissedCardNameElement = document.querySelector('#most-missed-card-name');
const mostMissedCardCountElement = document.querySelector('#most-missed-card-count');

// --- Background Color Constants ---
const INITIAL_HUE = 217;
const INITIAL_SATURATION = 81;
const INITIAL_LIGHTNESS = 68;
const FINAL_LIGHTNESS = 30; // How dark it gets at the end

// --- Dinosaur Name Mapping ---
const DINOSAUR_NAMES = {
    'Screenshot_1': 'Triceratops',
    'Screenshot_2': 'Dino´s Egg',
    'Screenshot_3': 'Spinosaurus',
    'Screenshot_4': 'Allosaurus',
    'Screenshot_5': 'Brontosaurus',
    'Screenshot_6': 'Stegosaurus',
    'Screenshot_7': 'T-Rex',
    'Screenshot_8': 'Megalosaurus',
    'Screenshot_9': 'Pterodactyl',
    'Screenshot_10': 'Suchomimus',
    'Screenshot_11': 'Dino´s Egg',
    'Screenshot_12': 'Ankylosaurus'
};

// --- Efeitos Sonoros ---
const flipSound = new Audio('audio/flip.mp3');
const matchSound = new Audio('audio/match.mp3');
const winSound = new Audio('audio/win.mp3');

let isMuted = localStorage.getItem('isMuted') === 'true';
let errorTracker = {};

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
    document.body.style.backgroundColor = '#6fa3ef'; // Reseta a cor do fundo
    // Reseta o estado do jogo
    hideVictoryModal();
    resetGameStats();
    displayHighScore();


    // Define o número de pares e seleciona as cartas para o nível atual
    const numberOfPairs = Math.floor((currentGridSize * currentGridSize) / 2);
    pairsLeftElement.textContent = numberOfPairs;
    
    // --- Lógica do Sorteio ---
    const TOTAL_AVAILABLE_IMAGES = 12; // Altere para o número total de imagens que você tem.

    // 1. Cria uma lista com todas as imagens disponíveis (de Screenshot_1 a Screenshot_12)
    const allPossibleCards = [];
    for (let i = 1; i <= TOTAL_AVAILABLE_IMAGES; i++) {
        allPossibleCards.push(`Screenshot_${i}`);
    }

    // 2. Embaralha a lista de todas as imagens disponíveis
    shuffle(allPossibleCards);
    
    // 3. Seleciona o número de cartas necessárias para o nível atual, de forma aleatória
    const cardsForGame = allPossibleCards.slice(0, numberOfPairs);

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
    lockBoard = true; // Bloqueia o tabuleiro durante a animação

    const animationDuration = 600; // Duração da animação em ms (deve corresponder ao CSS)
    let maxDelay = 0;

    gameCards.forEach((cardValue, index) => {
        if (cardValue === 'empty-slot') {
            const emptySlot = document.createElement('div');
            gameBoard.appendChild(emptySlot);
            return;
        }

        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.framework = cardValue;

        const delay = index * 50; // Atraso escalonado para cada carta
        if (delay > maxDelay) {
            maxDelay = delay;
        }
        card.style.animationDelay = `${delay}ms`;
        card.classList.add('shuffling-animation');

        // Remove a classe de animação após a conclusão para não reativar
        setTimeout(() => {
            card.classList.remove('shuffling-animation');
            card.style.animationDelay = '0ms';
        }, delay + animationDuration);

        // Lembre-se de adicionar as novas imagens (css.svg, html.svg, etc.) na pasta 'img'
        card.innerHTML = `
            <img class="front-face" src="img/${cardValue}.png" alt="${cardValue}">
            <img class="back-face" src="img/js-badge.png" alt="Verso da Carta">
        `;

        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });

    // --- Lógica para revelar as cartas no início ---
    const shuffleAnimationTotalTime = maxDelay + animationDuration;
    const revealDuration = currentGridSize === 3 ? 3000 : 8000;

    setTimeout(() => {
        const allCards = document.querySelectorAll('.memory-card');
        
        // Revela todas as cartas
        allCards.forEach(card => card.classList.add('flip'));

        // Após a duração da revelação, vira as cartas de volta
        setTimeout(() => {
            allCards.forEach(card => card.classList.remove('flip'));
            
            // Desbloqueia o tabuleiro apenas após as cartas serem viradas
            lockBoard = false;
        }, revealDuration);

    }, shuffleAnimationTotalTime);
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
    if (pairsLeftElement) {
        pairsLeftElement.textContent = '0';
    }

    // Reseta o rastreador de erros
    errorTracker = {};
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return; // Impede duplo clique na mesma carta

    playSound(flipSound);

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
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    const currentPairsLeft = parseInt(pairsLeftElement.textContent);
    pairsLeftElement.textContent = currentPairsLeft - 1;

    updateBackgroundColor();

    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    playSound(matchSound); // Toca o som de acerto
    resetBoard();
    checkWinCondition();
}

function unflipCards() {
    lockBoard = true; // Bloqueia o tabuleiro

    // --- Rastreamento de Erros ---
    const card1Name = firstCard.dataset.framework;
    const card2Name = secondCard.dataset.framework;
    errorTracker[card1Name] = (errorTracker[card1Name] || 0) + 1;
    errorTracker[card2Name] = (errorTracker[card2Name] || 0) + 1;

    // Adiciona um efeito de "tremor" para feedback de erro
    firstCard.classList.add('shake');
    secondCard.classList.add('shake');

    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        firstCard.classList.remove('shake');
        secondCard.classList.remove('shake');
        resetBoard();
    }, 1000); // RN02 - Tempo de visualização de 1 segundo
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function checkWinCondition() {
    const allMatchedCards = document.querySelectorAll('.memory-card.matched');
    const numberOfPairs = Math.floor((currentGridSize * currentGridSize) / 2);
    const totalCardsInGame = numberOfPairs * 2;

    if (allMatchedCards.length === totalCardsInGame) {
        clearInterval(timerInterval); // Para o cronômetro
        updateHighScore();
        playSound(winSound); // Toca o som de vitória
        triggerConfetti();
        // Mostra o modal de vitória após a animação de confete começar
        setTimeout(showVictoryModal, 500);
    }
}

function triggerConfetti() {
    const duration = 2 * 1000; // A animação dura 2 segundos
    const animationEnd = Date.now() + duration;

    (function frame() {
        // Lança confetes da esquerda
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });
        // Lança confetes da direita
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });

        // Continua a animação até o tempo acabar
        if (Date.now() < animationEnd) {
            requestAnimationFrame(frame);
        }
    }());
}

function findMostMissedPair() {
    let mostMissedCard = null;
    let maxErrors = 0;

    for (const [card, count] of Object.entries(errorTracker)) {
        if (count > maxErrors) {
            maxErrors = count;
            mostMissedCard = card;
        }
    }

    // Retorna null se não houver erros
    return mostMissedCard ? { card: mostMissedCard, count: maxErrors } : null;
}

function updateBackgroundColor() {
    const totalPairs = Math.floor((currentGridSize * currentGridSize) / 2);
    // O número de cartas combinadas será 2, 4, 6...
    const matchedCardsCount = document.querySelectorAll('.memory-card.matched').length;
    const matchedPairsCount = matchedCardsCount / 2;
    
    const lightnessRange = INITIAL_LIGHTNESS - FINAL_LIGHTNESS;
    const lightnessStep = lightnessRange / totalPairs;
    
    const newLightness = INITIAL_LIGHTNESS - (matchedPairsCount * lightnessStep);
    
    document.body.style.backgroundColor = `hsl(${INITIAL_HUE}, ${INITIAL_SATURATION}%, ${newLightness}%)`;
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

function showVictoryModal() {
    finalMovesElement.textContent = moves;
    finalTimeElement.textContent = timerElement.textContent;

    // Lógica para exibir o par mais errado, apenas no modo 4x4
    if (currentGridSize === 4) {
        const mostMissed = findMostMissedPair();
        if (mostMissed) {
            const dinoName = DINOSAUR_NAMES[mostMissed.card] || mostMissed.card;
            mostMissedCardNameElement.textContent = dinoName;
            mostMissedCardCountElement.textContent = mostMissed.count;
            mostMissedContainer.style.display = 'block';
        } else {
            mostMissedContainer.style.display = 'none';
        }
    }
    victoryModalOverlay.classList.add('visible');
}

function hideVictoryModal() {
    if (victoryModalOverlay) {
        victoryModalOverlay.classList.remove('visible');
    }
}

function playSound(sound) {
    if (!isMuted) {
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.error("Erro ao tocar o som (o navegador pode ter bloqueado a reprodução automática):", error);
        });
    }
}

function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('isMuted', isMuted);
    updateMuteButton();
}

function updateMuteButton() {
    if (isMuted) {
        muteButton.textContent = '🔇';
    } else {
        muteButton.textContent = '🔊';
    }
}

// Inicia o jogo quando o script é carregado
createBoard();
restartButton.addEventListener('click', createBoard);
playAgainButton.addEventListener('click', createBoard);
muteButton.addEventListener('click', toggleMute);

// Adiciona listeners para os botões de dificuldade
difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        difficultyButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentGridSize = parseInt(button.dataset.grid);
        createBoard();
    });
});

// Define o estado inicial do botão de mudo
updateMuteButton();