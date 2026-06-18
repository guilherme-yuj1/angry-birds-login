// ========================================
// CONSTANTES E CONFIGURAÇÕES
// ========================================

const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const BIRD_RADIUS = 15;
const SLINGSHOT_X = 80;
const SLINGSHOT_Y = GAME_HEIGHT - 100;
const PIG_X = GAME_WIDTH - 120;
const PIG_Y = GAME_HEIGHT - 150;
const PIG_RADIUS = 18;
const GRAVITY = 0.5;
const FRICTION = 0.98;
const LAUNCH_POWER_MULTIPLIER = 0.15;

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const loginBtn = document.getElementById('loginBtn');
const loginForm = document.getElementById('loginForm');
const resetBtn = document.getElementById('resetBtn');
const attemptCountEl = document.getElementById('attemptCount');
const successMessageEl = document.getElementById('successMessage');
const confettiContainer = document.getElementById('confetti-container');

let tutorialComplete = false;
let attemptCount = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

// Estado do pássaro
let bird = {
    x: SLINGSHOT_X,
    y: SLINGSHOT_Y,
    vx: 0,
    vy: 0,
    radius: BIRD_RADIUS,
    isFlying: false,
    hasHit: false
};

// Estado do porquinho
let pig = {
    x: PIG_X,
    y: PIG_Y,
    radius: PIG_RADIUS,
    isDefeated: false,
    shakeAmount: 0
};

// Blocos de madeira (suporte do porquinho)
let blocks = [
    { x: PIG_X - 60, y: GAME_HEIGHT - 100, width: 40, height: 60, rotation: 0 },
    { x: PIG_X, y: GAME_HEIGHT - 100, width: 40, height: 60, rotation: 0 },
    { x: PIG_X + 60, y: GAME_HEIGHT - 100, width: 40, height: 60, rotation: 0 }
];

// ========================================
// FUNÇÕES DE DESENHO
// ========================================

/**
 * Desenha o cenário do jogo
 */
function drawBackground() {
    // Céu
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.6);
    
    // Terra/Grama
    ctx.fillStyle = '#90ee90';
    ctx.fillRect(0, GAME_HEIGHT * 0.6, GAME_WIDTH, GAME_HEIGHT * 0.4);
    
    // Linha de grama
    ctx.strokeStyle = '#32a852';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GAME_HEIGHT * 0.6);
    ctx.lineTo(GAME_WIDTH, GAME_HEIGHT * 0.6);
    ctx.stroke();
}

/**
 * Desenha o estilingue
 */
function drawSlingshot() {
    const birdX = bird.x;
    const birdY = bird.y;
    
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    
    // Poste do estilingue
    ctx.beginPath();
    ctx.moveTo(SLINGSHOT_X, SLINGSHOT_Y - 80);
    ctx.lineTo(SLINGSHOT_X, SLINGSHOT_Y);
    ctx.stroke();
    
    // Cordas do estilingue (ligadas ao pássaro se estiver sendo arrastado)
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.7)';
    ctx.lineWidth = 2;
    
    // Corda esquerda
    ctx.beginPath();
    ctx.moveTo(SLINGSHOT_X - 10, SLINGSHOT_Y - 60);
    ctx.quadraticCurveTo(SLINGSHOT_X - 20, SLINGSHOT_Y - 40, birdX - BIRD_RADIUS, birdY - BIRD_RADIUS);
    ctx.stroke();
    
    // Corda direita
    ctx.beginPath();
    ctx.moveTo(SLINGSHOT_X + 10, SLINGSHOT_Y - 60);
    ctx.quadraticCurveTo(SLINGSHOT_X + 20, SLINGSHOT_Y - 40, birdX + BIRD_RADIUS, birdY + BIRD_RADIUS);
    ctx.stroke();
    
    // Base do estilingue
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(SLINGSHOT_X, SLINGSHOT_Y, 25, 15, 0, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Desenha o pássaro vermelho
 */
function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    
    // Calcular ângulo de rotação baseado na velocidade
    if (bird.isFlying && (bird.vx !== 0 || bird.vy !== 0)) {
        const angle = Math.atan2(bird.vy, bird.vx);
        ctx.rotate(angle);
    }
    
    // Corpo do pássaro (vermelho)
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.ellipse(0, 0, BIRD_RADIUS * 1.2, BIRD_RADIUS * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Olho
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(BIRD_RADIUS * 0.5, -BIRD_RADIUS * 0.3, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(BIRD_RADIUS * 0.5, -BIRD_RADIUS * 0.3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Bico (amarelo)
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.moveTo(BIRD_RADIUS * 1.2, 0);
    ctx.lineTo(BIRD_RADIUS * 1.5, -3);
    ctx.lineTo(BIRD_RADIUS * 1.5, 3);
    ctx.closePath();
    ctx.fill();
    
    // Crista vermelha
    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.ellipse(0, -BIRD_RADIUS * 0.8, 6, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Efeito de sombra
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
}

/**
 * Desenha o porquinho
 */
function drawPig() {
    ctx.save();
    ctx.translate(pig.x + pig.shakeAmount, pig.y);
    
    // Corpo do porquinho (verde)
    ctx.fillStyle = '#90EE90';
    ctx.beginPath();
    ctx.ellipse(0, 0, PIG_RADIUS * 1.3, PIG_RADIUS * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Olhos
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(-PIG_RADIUS * 0.4, -PIG_RADIUS * 0.3, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(PIG_RADIUS * 0.4, -PIG_RADIUS * 0.3, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupilas
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(-PIG_RADIUS * 0.4, -PIG_RADIUS * 0.3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(PIG_RADIUS * 0.4, -PIG_RADIUS * 0.3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Narinas
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(-3, PIG_RADIUS * 0.2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3, PIG_RADIUS * 0.2, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Orelhas
    ctx.fillStyle = '#90EE90';
    ctx.beginPath();
    ctx.ellipse(-PIG_RADIUS * 0.8, -PIG_RADIUS * 0.8, 5, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(PIG_RADIUS * 0.8, -PIG_RADIUS * 0.8, 5, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

/**
 * Desenha os blocos de madeira
 */
function drawBlocks() {
    blocks.forEach(block => {
        ctx.save();
        ctx.translate(block.x, block.y);
        ctx.rotate(block.rotation);
        
        // Textura de madeira
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-block.width / 2, -block.height / 2, block.width, block.height);
        
        // Padrão de madeira
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        for (let i = 0; i < block.height; i += 10) {
            ctx.beginPath();
            ctx.moveTo(-block.width / 2, i - block.height / 2);
            ctx.lineTo(block.width / 2, i - block.height / 2);
            ctx.stroke();
        }
        
        ctx.restore();
    });
}

/**
 * Renderiza o frame do jogo
 */
function render() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    drawBackground();
    drawBlocks();
    drawSlingshot();
    drawBird();
    drawPig();
    
    // Indicador visual de arrasto
    if (isDragging) {
        ctx.strokeStyle = 'rgba(255, 107, 53, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(SLINGSHOT_X, SLINGSHOT_Y);
        ctx.lineTo(bird.x, bird.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

// ========================================
// FÍSICA DO JOGO
// ========================================

/**
 * Atualiza a física do pássaro
 */
function updateBirdPhysics() {
    if (!bird.isFlying) return;
    
    // Aplicar gravidade
    bird.vy += GRAVITY;
    
    // Aplicar atrito
    bird.vx *= FRICTION;
    bird.vy *= FRICTION;
    
    // Atualizar posição
    bird.x += bird.vx;
    bird.y += bird.vy;
    
    // Colisão com chão
    if (bird.y + BIRD_RADIUS > GAME_HEIGHT) {
        bird.y = GAME_HEIGHT - BIRD_RADIUS;
        bird.vy = 0;
        bird.vx = 0;
        bird.isFlying = false;
        resetBirdPosition();
    }
    
    // Colisão com paredes
    if (bird.x - BIRD_RADIUS < 0) {
        bird.x = BIRD_RADIUS;
        bird.vx = 0;
    }
    if (bird.x + BIRD_RADIUS > GAME_WIDTH) {
        bird.x = GAME_WIDTH - BIRD_RADIUS;
        bird.vx = 0;
    }
    
    // Colisão com porquinho
    checkCollisionWithPig();
}

/**
 * Verifica colisão com o porquinho
 */
function checkCollisionWithPig() {
    if (pig.isDefeated) return;
    
    const dx = bird.x - pig.x;
    const dy = bird.y - pig.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < bird.radius + pig.radius) {
        defeatPig();
    }
}

/**
 * Derrota o porquinho
 */
function defeatPig() {
    pig.isDefeated = true;
    tutorialComplete = true;
    bird.isFlying = false;
    bird.vx = 0;
    bird.vy = 0;
    
    // Tocar som (se disponível)
    playSound('pig-defeated');
    
    // Animar porquinho
    pigDefeatAnimation();
    
    // Desbloquear botão
    unlockLoginButton();
    
    // Mostrar mensagem de sucesso
    showSuccessMessage();
    
    // Criar confetes
    createConfetti();
}

/**
 * Animação de derrota do porquinho
 */
function pigDefeatAnimation() {
    let shakeAmount = 0;
    let shakeDirection = 1;
    const maxShake = 5;
    const shakeDuration = 30;
    
    const shakeInterval = setInterval(() => {
        shakeAmount += shakeDirection;
        if (Math.abs(shakeAmount) > maxShake) {
            shakeDirection *= -1;
        }
        pig.shakeAmount = shakeAmount;
        
        shakeDuration--;
        if (shakeDuration <= 0) {
            clearInterval(shakeInterval);
            pig.shakeAmount = 0;
        }
    }, 20);
}

/**
 * Reseta a posição do pássaro
 */
function resetBirdPosition() {
    setTimeout(() => {
        bird.x = SLINGSHOT_X;
        bird.y = SLINGSHOT_Y;
        bird.vx = 0;
        bird.vy = 0;
        bird.hasHit = false;
    }, 500);
}

// ========================================
// INTERAÇÃO COM O USUÁRIO
// ========================================

/**
 * Calcula a distância de arrasto e lança o pássaro
 */
function launchBird(endX, endY) {
    const dragX = dragStartX - endX;
    const dragY = dragStartY - endY;
    
    bird.vx = dragX * LAUNCH_POWER_MULTIPLIER;
    bird.vy = dragY * LAUNCH_POWER_MULTIPLIER;
    bird.isFlying = true;
    
    attemptCount++;
    attemptCountEl.textContent = attemptCount;
    
    // Tocar som de lançamento
    playSound('bird-launch');
}

/**
 * Event listener para mouse down no canvas
 */
canvas.addEventListener('mousedown', (e) => {
    if (bird.isFlying || tutorialComplete) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (GAME_WIDTH / rect.width);
    const mouseY = (e.clientY - rect.top) * (GAME_HEIGHT / rect.height);
    
    // Verificar se o clique foi no pássaro
    const dx = mouseX - bird.x;
    const dy = mouseY - bird.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < bird.radius + 15) {
        isDragging = true;
        dragStartX = mouseX;
        dragStartY = mouseY;
    }
});

/**
 * Event listener para mouse move
 */
document.addEventListener('mousemove', (e) => {
    if (!isDragging || bird.isFlying) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (GAME_WIDTH / rect.width);
    const mouseY = (e.clientY - rect.top) * (GAME_HEIGHT / rect.height);
    
    // Limitar distância de arrasto
    const dragX = dragStartX - mouseX;
    const dragY = dragStartY - mouseY;
    const maxDragDistance = 100;
    const dragDistance = Math.sqrt(dragX * dragX + dragY * dragY);
    
    if (dragDistance > maxDragDistance) {
        const ratio = maxDragDistance / dragDistance;
        bird.x = dragStartX - dragX * ratio;
        bird.y = dragStartY - dragY * ratio;
    } else {
        bird.x = mouseX;
        bird.y = mouseY;
    }
});

/**
 * Event listener para mouse up
 */
document.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    
    isDragging = false;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (GAME_WIDTH / rect.width);
    const mouseY = (e.clientY - rect.top) * (GAME_HEIGHT / rect.height);
    
    launchBird(mouseX, mouseY);
});

/**
 * Event listeners para touch (mobile)
 */
canvas.addEventListener('touchstart', (e) => {
    if (bird.isFlying || tutorialComplete) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = (touch.clientX - rect.left) * (GAME_WIDTH / rect.width);
    const touchY = (touch.clientY - rect.top) * (GAME_HEIGHT / rect.height);
    
    const dx = touchX - bird.x;
    const dy = touchY - bird.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < bird.radius + 15) {
        isDragging = true;
        dragStartX = touchX;
        dragStartY = touchY;
    }
});

document.addEventListener('touchmove', (e) => {
    if (!isDragging || bird.isFlying) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = (touch.clientX - rect.left) * (GAME_WIDTH / rect.width);
    const touchY = (touch.clientY - rect.top) * (GAME_HEIGHT / rect.height);
    
    const dragX = dragStartX - touchX;
    const dragY = dragStartY - touchY;
    const maxDragDistance = 100;
    const dragDistance = Math.sqrt(dragX * dragX + dragY * dragY);
    
    if (dragDistance > maxDragDistance) {
        const ratio = maxDragDistance / dragDistance;
        bird.x = dragStartX - dragX * ratio;
        bird.y = dragStartY - dragY * ratio;
    } else {
        bird.x = touchX;
        bird.y = touchY;
    }
}, { passive: true });

document.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    
    isDragging = false;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.changedTouches[0];
    const touchX = (touch.clientX - rect.left) * (GAME_WIDTH / rect.width);
    const touchY = (touch.clientY - rect.top) * (GAME_HEIGHT / rect.height);
    
    launchBird(touchX, touchY);
});

// ========================================
// INTERFACE DO USUÁRIO
// ========================================

/**
 * Desbloqueia o botão de login
 */
function unlockLoginButton() {
    loginBtn.classList.remove('disabled');
    loginBtn.classList.add('success');
    loginBtn.disabled = false;
    loginBtn.title = 'Clique para fazer login';
}

/**
 * Mostra a mensagem de sucesso
 */
function showSuccessMessage() {
    successMessageEl.classList.remove('hidden');
    
    setTimeout(() => {
        successMessageEl.classList.add('hidden');
    }, 3000);
}

/**
 * Cria efeito de confetes
 */
function createConfetti() {
    const confettiCount = 30;
    const colors = ['#ff6b35', '#52b788', '#4a90e2', '#ffff00', '#ff69b4'];
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 5 + 5 + 'px';
        confetti.style.height = confetti.style.width;
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confetti.style.animationDelay = (Math.random() * 0.5) + 's';
        
        confettiContainer.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}

/**
 * Botão de reset
 */
resetBtn.addEventListener('click', () => {
    resetGame();
});

/**
 * Reseta o jogo
 */
function resetGame() {
    bird.x = SLINGSHOT_X;
    bird.y = SLINGSHOT_Y;
    bird.vx = 0;
    bird.vy = 0;
    bird.isFlying = false;
    bird.hasHit = false;
    
    pig.x = PIG_X;
    pig.y = PIG_Y;
    pig.isDefeated = false;
    pig.shakeAmount = 0;
    
    tutorialComplete = false;
    attemptCount = 0;
    attemptCountEl.textContent = attemptCount;
    
    if (!loginBtn.classList.contains('disabled')) {
        loginBtn.classList.add('disabled');
        loginBtn.classList.remove('success');
        loginBtn.disabled = true;
        loginBtn.title = 'Complete o tutorial primeiro';
    }
}

/**
 * Previne submit do formulário se o tutorial não foi completado
 */
loginForm.addEventListener('submit', (e) => {
    if (!tutorialComplete) {
        e.preventDefault();
        showButtonTooltip();
    }
});

/**
 * Mostra tooltip quando botão desabilitado é clicado
 */
function showButtonTooltip() {
    const tooltip = document.getElementById('buttonTooltip');
    tooltip.style.opacity = '1';
    
    setTimeout(() => {
        tooltip.style.opacity = '0';
    }, 2000);
}

/**
 * Reproduz som (simulado - sem áudio real por enquanto)
 */
function playSound(soundType) {
    // Aqui você pode adicionar sons reais usando Web Audio API
    // Por enquanto, apenas um console log como referência
    console.log(`🔊 Som: ${soundType}`);
}

// ========================================
// LOOP DE ANIMAÇÃO
// ========================================

/**
 * Redimensiona o canvas para ser responsivo
 */
function resizeCanvas() {
    const container = canvas.parentElement;
    const width = container.clientWidth;
    
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    
    // Usar CSS para escalar
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';
}

/**
 * Loop principal de animação
 */
function gameLoop() {
    updateBirdPhysics();
    render();
    requestAnimationFrame(gameLoop);
}

// ========================================
// INICIALIZAÇÃO
// ========================================

/**
 * Inicializa o jogo
 */
function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    gameLoop();
}

// Iniciar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
