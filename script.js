// ========================================
// CONSTANTES E CONFIGURAÇÕES
// ========================================

const GAME_WIDTH = 900;
const GAME_HEIGHT = 450;
const BIRD_RADIUS = 18;

// Posição do estilingue (esquerda)
const SLINGSHOT_BASE_X = 100;
const SLINGSHOT_BASE_Y = GAME_HEIGHT - 120;
const SLINGSHOT_FORK_X = SLINGSHOT_BASE_X;
const SLINGSHOT_FORK_Y = SLINGSHOT_BASE_Y - 80;

// Posição inicial do pássaro (na forquilha do estilingue)
const BIRD_START_X = SLINGSHOT_FORK_X;
const BIRD_START_Y = SLINGSHOT_FORK_Y;

// Posição do porquinho (direita)
const PIG_X = GAME_WIDTH - 150;
const PIG_Y = GAME_HEIGHT - 160;
const PIG_RADIUS = 22;

// Física
const GRAVITY = 0.6;
const FRICTION = 0.985;
const LAUNCH_POWER_MULTIPLIER = 0.12;
const MAX_DRAG_DISTANCE = 120;

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
    x: BIRD_START_X,
    y: BIRD_START_Y,
    vx: 0,
    vy: 0,
    radius: BIRD_RADIUS,
    isFlying: false,
    hasHit: false,
    rotation: 0
};

// Estado do porquinho
let pig = {
    x: PIG_X,
    y: PIG_Y,
    radius: PIG_RADIUS,
    isDefeated: false,
    shakeAmount: 0,
    shakeAngle: 0
};

// Blocos de madeira (suporte do porquinho)
let blocks = [
    { x: PIG_X - 70, y: GAME_HEIGHT - 100, width: 35, height: 70, rotation: 0, health: 100 },
    { x: PIG_X, y: GAME_HEIGHT - 100, width: 35, height: 70, rotation: 0, health: 100 },
    { x: PIG_X + 70, y: GAME_HEIGHT - 100, width: 35, height: 70, rotation: 0, health: 100 }
];

// ========================================
// FUNÇÕES DE DESENHO - CENÁRIO
// ========================================

/**
 * Desenha o cenário do jogo
 */
function drawBackground() {
    // Céu com gradiente
    const skyGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT * 0.65);
    skyGradient.addColorStop(0, '#87ceeb');
    skyGradient.addColorStop(1, '#e0f6ff');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.65);
    
    // Terra/Grama com gradiente
    const grassGradient = ctx.createLinearGradient(0, GAME_HEIGHT * 0.65, 0, GAME_HEIGHT);
    grassGradient.addColorStop(0, '#90ee90');
    grassGradient.addColorStop(1, '#32a852');
    ctx.fillStyle = grassGradient;
    ctx.fillRect(0, GAME_HEIGHT * 0.65, GAME_WIDTH, GAME_HEIGHT * 0.35);
    
    // Linha de separação céu-terra
    ctx.strokeStyle = '#7fb069';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GAME_HEIGHT * 0.65);
    ctx.lineTo(GAME_WIDTH, GAME_HEIGHT * 0.65);
    ctx.stroke();
}

/**
 * Desenha o estilingue (estilo clássico em "Y")
 */
function drawSlingshot() {
    const birdX = bird.x;
    const birdY = bird.y;
    
    ctx.save();
    
    // ===== BASE DO ESTILINGUE (Madeira) =====
    ctx.fillStyle = '#8B4513';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 4;
    
    // Plataforma base (retângulo)
    ctx.fillRect(SLINGSHOT_BASE_X - 30, SLINGSHOT_BASE_Y, 60, 30);
    
    // Detalhe de madeira na base
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    for (let i = 0; i < 30; i += 5) {
        ctx.beginPath();
        ctx.moveTo(SLINGSHOT_BASE_X - 30, SLINGSHOT_BASE_Y + i);
        ctx.lineTo(SLINGSHOT_BASE_X + 30, SLINGSHOT_BASE_Y + i);
        ctx.stroke();
    }
    
    // ===== BRAÇOS DO ESTILINGUE =====
    const armWidth = 8;
    const armLength = 100;
    
    // Braço esquerdo
    ctx.fillStyle = '#A0522D';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(SLINGSHOT_BASE_X - 10, SLINGSHOT_BASE_Y);
    ctx.lineTo(SLINGSHOT_BASE_X - 15, SLINGSHOT_BASE_Y - armLength);
    ctx.lineTo(SLINGSHOT_BASE_X - 15 + armWidth, SLINGSHOT_BASE_Y - armLength);
    ctx.lineTo(SLINGSHOT_BASE_X - 10 + armWidth, SLINGSHOT_BASE_Y);
    ctx.closePath();
    ctx.fill();
    
    // Braço direito
    ctx.beginPath();
    ctx.moveTo(SLINGSHOT_BASE_X + 10, SLINGSHOT_BASE_Y);
    ctx.lineTo(SLINGSHOT_BASE_X + 15, SLINGSHOT_BASE_Y - armLength);
    ctx.lineTo(SLINGSHOT_BASE_X + 15 + armWidth, SLINGSHOT_BASE_Y - armLength);
    ctx.lineTo(SLINGSHOT_BASE_X + 10 + armWidth, SLINGSHOT_BASE_Y);
    ctx.closePath();
    ctx.fill();
    
    // ===== FORQUILHA (Topo dos braços) =====
    ctx.fillStyle = '#8B4513';
    ctx.shadowBlur = 4;
    
    // Ponta esquerda da forquilha
    ctx.beginPath();
    ctx.arc(SLINGSHOT_FORK_X - 12, SLINGSHOT_FORK_Y, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Ponta direita da forquilha
    ctx.beginPath();
    ctx.arc(SLINGSHOT_FORK_X + 12, SLINGSHOT_FORK_Y, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // ===== CORDAS DO ESTILINGUE =====
    if (isDragging) {
        // Enquanto está arrastando, as cordas seguem o pássaro
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.8)';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Corda esquerda
        ctx.beginPath();
        ctx.moveTo(SLINGSHOT_FORK_X - 12, SLINGSHOT_FORK_Y);
        ctx.quadraticCurveTo(
            SLINGSHOT_FORK_X - 25,
            SLINGSHOT_FORK_Y + (birdY - SLINGSHOT_FORK_Y) / 2,
            birdX - BIRD_RADIUS * 0.6,
            birdY - BIRD_RADIUS * 0.4
        );
        ctx.stroke();
        
        // Corda direita
        ctx.beginPath();
        ctx.moveTo(SLINGSHOT_FORK_X + 12, SLINGSHOT_FORK_Y);
        ctx.quadraticCurveTo(
            SLINGSHOT_FORK_X + 25,
            SLINGSHOT_FORK_Y + (birdY - SLINGSHOT_FORK_Y) / 2,
            birdX + BIRD_RADIUS * 0.6,
            birdY + BIRD_RADIUS * 0.4
        );
        ctx.stroke();
    } else if (!bird.isFlying) {
        // Quando não está arrastando e o pássaro está no repouso, cordas voltam ao normal
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.6)';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Corda esquerda (retornada)
        ctx.beginPath();
        ctx.moveTo(SLINGSHOT_FORK_X - 12, SLINGSHOT_FORK_Y);
        ctx.quadraticCurveTo(
            SLINGSHOT_FORK_X - 20,
            SLINGSHOT_FORK_Y + 30,
            SLINGSHOT_FORK_X - 8,
            SLINGSHOT_FORK_Y + 50
        );
        ctx.stroke();
        
        // Corda direita (retornada)
        ctx.beginPath();
        ctx.moveTo(SLINGSHOT_FORK_X + 12, SLINGSHOT_FORK_Y);
        ctx.quadraticCurveTo(
            SLINGSHOT_FORK_X + 20,
            SLINGSHOT_FORK_Y + 30,
            SLINGSHOT_FORK_X + 8,
            SLINGSHOT_FORK_Y + 50
        );
        ctx.stroke();
    }
    // Se isFlying = true, não desenha as cordas
    
    ctx.restore();
}

// ========================================
// FUNÇÕES DE DESENHO - PÁSSARO
// ========================================

/**
 * Desenha o pássaro Red inspirado no Angry Birds
 */
function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    
    // Rotação baseada na velocidade
    if (bird.isFlying && (Math.abs(bird.vx) > 0.5 || Math.abs(bird.vy) > 0.5)) {
        bird.rotation = Math.atan2(bird.vy, bird.vx);
        ctx.rotate(bird.rotation);
    }
    
    // ===== CORPO PRINCIPAL (Vermelho) =====
    ctx.fillStyle = '#FF4444';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;
    
    ctx.beginPath();
    ctx.ellipse(0, 0, BIRD_RADIUS * 1.3, BIRD_RADIUS * 1.0, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // ===== BARRIGA (Bege) =====
    ctx.fillStyle = '#FDD9A8';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 4;
    
    ctx.beginPath();
    ctx.ellipse(0, 2, BIRD_RADIUS * 0.8, BIRD_RADIUS * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // ===== BICO (Amarelo) =====
    ctx.fillStyle = '#FFDD00';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 3;
    
    const beakSize = 8;
    ctx.beginPath();
    ctx.moveTo(BIRD_RADIUS * 1.1, -2);
    ctx.lineTo(BIRD_RADIUS * 1.4, -4);
    ctx.lineTo(BIRD_RADIUS * 1.4, 0);
    ctx.lineTo(BIRD_RADIUS * 1.1, 2);
    ctx.closePath();
    ctx.fill();
    
    // Detalhe do bico
    ctx.strokeStyle = '#CCAA00';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    
    // ===== OLHOS =====
    // Branco do olho
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 2;
    
    // Olho esquerdo
    ctx.beginPath();
    ctx.arc(BIRD_RADIUS * 0.3, -BIRD_RADIUS * 0.4, 5.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Olho direito
    ctx.beginPath();
    ctx.arc(BIRD_RADIUS * 0.3, BIRD_RADIUS * 0.35, 5.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupila (preta)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(BIRD_RADIUS * 0.4, -BIRD_RADIUS * 0.4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(BIRD_RADIUS * 0.4, BIRD_RADIUS * 0.35, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // ===== SOBRANCELHAS (Pretas, inclinadas para baixo) =====
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    
    // Sobrancelha esquerda
    ctx.beginPath();
    ctx.moveTo(BIRD_RADIUS * 0, -BIRD_RADIUS * 0.65);
    ctx.quadraticCurveTo(BIRD_RADIUS * 0.25, -BIRD_RADIUS * 0.75, BIRD_RADIUS * 0.5, -BIRD_RADIUS * 0.55);
    ctx.stroke();
    
    // Sobrancelha direita
    ctx.beginPath();
    ctx.moveTo(BIRD_RADIUS * 0, BIRD_RADIUS * 0.6);
    ctx.quadraticCurveTo(BIRD_RADIUS * 0.25, BIRD_RADIUS * 0.7, BIRD_RADIUS * 0.5, BIRD_RADIUS * 0.5);
    ctx.stroke();
    
    // ===== PENAS NO TOPO (Vermelho intenso) =====
    ctx.fillStyle = '#CC0000';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 3;
    
    // Pena central
    ctx.beginPath();
    ctx.ellipse(0, -BIRD_RADIUS * 1.1, 4, 10, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Pena esquerda
    ctx.beginPath();
    ctx.ellipse(-BIRD_RADIUS * 0.4, -BIRD_RADIUS * 0.95, 3.5, 8, -0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Pena direita
    ctx.beginPath();
    ctx.ellipse(BIRD_RADIUS * 0.4, -BIRD_RADIUS * 0.95, 3.5, 8, 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // ===== CAUDA (Preta) =====
    ctx.fillStyle = '#1a1a1a';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 3;
    
    ctx.beginPath();
    ctx.ellipse(-BIRD_RADIUS * 1.2, 0, 3, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// ========================================
// FUNÇÕES DE DESENHO - PORQUINHO E BLOCOS
// ========================================

/**
 * Desenha o porquinho
 */
function drawPig() {
    ctx.save();
    ctx.translate(pig.x + pig.shakeAmount, pig.y);
    ctx.rotate(pig.shakeAngle);
    
    // ===== CORPO (Verde) =====
    ctx.fillStyle = '#90EE90';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;
    
    ctx.beginPath();
    ctx.ellipse(0, 0, PIG_RADIUS * 1.4, PIG_RADIUS * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // ===== FOCINHO (Verde mais escuro, destacado) =====
    ctx.fillStyle = '#7ACC7A';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 3;
    
    ctx.beginPath();
    ctx.ellipse(PIG_RADIUS * 0.8, 0, PIG_RADIUS * 0.6, PIG_RADIUS * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // ===== NARINAS =====
    ctx.fillStyle = '#556055';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 2;
    
    ctx.beginPath();
    ctx.arc(PIG_RADIUS * 0.95, -3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(PIG_RADIUS * 0.95, 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // ===== OLHOS (Grandes e brancos) =====
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 2;
    
    // Olho esquerdo
    ctx.beginPath();
    ctx.arc(-PIG_RADIUS * 0.5, -PIG_RADIUS * 0.4, 6.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Olho direito
    ctx.beginPath();
    ctx.arc(-PIG_RADIUS * 0.5, PIG_RADIUS * 0.4, 6.5, 0, Math.PI * 2);
    ctx.fill();
    
    // ===== PUPILAS (Pretas, pequenas e expressivas) =====
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-PIG_RADIUS * 0.45, -PIG_RADIUS * 0.35, 3.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(-PIG_RADIUS * 0.45, PIG_RADIUS * 0.35, 3.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Brilho nos olhos
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(-PIG_RADIUS * 0.55, -PIG_RADIUS * 0.45, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(-PIG_RADIUS * 0.55, PIG_RADIUS * 0.25, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // ===== ORELHAS (Pequenas) =====
    ctx.fillStyle = '#90EE90';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 2;
    
    // Orelha esquerda
    ctx.beginPath();
    ctx.ellipse(-PIG_RADIUS * 0.9, -PIG_RADIUS * 0.9, 5, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Orelha direita
    ctx.beginPath();
    ctx.ellipse(-PIG_RADIUS * 0.9, PIG_RADIUS * 0.9, 5, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Interior das orelhas
    ctx.fillStyle = '#7ACC7A';
    ctx.beginPath();
    ctx.ellipse(-PIG_RADIUS * 0.9, -PIG_RADIUS * 0.9, 3, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(-PIG_RADIUS * 0.9, PIG_RADIUS * 0.9, 3, 5, 0.3, 0, Math.PI * 2);
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
        
        // Cor baseada na saúde
        const healthPercent = block.health / 100;
        const hueShift = Math.max(0, Math.min(60, healthPercent * 60));
        ctx.fillStyle = `hsl(${hueShift}, 70%, 40%)`;
        
        // Sombra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 3;
        
        // Bloco principal
        ctx.fillRect(-block.width / 2, -block.height / 2, block.width, block.height);
        
        // Padrão de madeira
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < block.height; i += 10) {
            ctx.beginPath();
            ctx.moveTo(-block.width / 2, i - block.height / 2);
            ctx.lineTo(block.width / 2, i - block.height / 2);
            ctx.stroke();
        }
        
        // Bordas
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-block.width / 2, -block.height / 2, block.width, block.height);
        
        ctx.restore();
    });
}

// ========================================
// FUNÇÕES DE DESENHO - LINHA DE MIRA
// ========================================

/**
 * Desenha a linha de mira (quando arrastando)
 */
function drawAimLine() {
    if (!isDragging || bird.isFlying) return;
    
    // Calcular direção do lançamento
    const dragX = bird.x - SLINGSHOT_FORK_X;
    const dragY = bird.y - SLINGSHOT_FORK_Y;
    
    // Normalizar direção (oposta ao arrasto)
    const distance = Math.sqrt(dragX * dragX + dragY * dragY);
    if (distance < 5) return;
    
    const dirX = -dragX / distance;
    const dirY = -dragY / distance;
    
    // Desenhar linha de mira com pontos
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]); // Pontilhado
    
    const lineLength = 400;
    const endX = SLINGSHOT_FORK_X + dirX * lineLength;
    const endY = SLINGSHOT_FORK_Y + dirY * lineLength;
    
    ctx.beginPath();
    ctx.moveTo(SLINGSHOT_FORK_X, SLINGSHOT_FORK_Y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Círculo no ponto de início
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(SLINGSHOT_FORK_X, SLINGSHOT_FORK_Y, 4, 0, Math.PI * 2);
    ctx.fill();
}

// ========================================
// FUNÇÃO PRINCIPAL DE RENDERIZAÇÃO
// ========================================

/**
 * Renderiza um frame do jogo
 */
function render() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    drawBackground();
    drawBlocks();
    drawSlingshot();
    drawAimLine();
    drawBird();
    drawPig();
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
        bird.vy *= -0.3; // Bounce reduzido
        bird.vx *= FRICTION;
        
        // Parar se a velocidade for muito baixa
        if (Math.abs(bird.vy) < 1 && Math.abs(bird.vx) < 1) {
            bird.isFlying = false;
            resetBirdPosition();
        }
    }
    
    // Colisão com paredes
    if (bird.x - BIRD_RADIUS < 0) {
        bird.x = BIRD_RADIUS;
        bird.vx *= -0.5;
    }
    if (bird.x + BIRD_RADIUS > GAME_WIDTH) {
        bird.x = GAME_WIDTH - BIRD_RADIUS;
        bird.vx *= -0.5;
    }
    
    // Colisão com teto
    if (bird.y - BIRD_RADIUS < 0) {
        bird.y = BIRD_RADIUS;
        bird.vy *= -0.5;
    }
    
    // Colisão com porquinho
    checkCollisionWithPig();
    
    // Colisão com blocos
    checkCollisionWithBlocks();
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
 * Verifica colisão com blocos
 */
function checkCollisionWithBlocks() {
    blocks.forEach(block => {
        // Detecção de colisão simplificada (círculo vs retângulo rotacionado)
        const dx = bird.x - block.x;
        const dy = bird.y - block.y;
        
        // Aplicar rotação inversa para simplificar cálculo
        const cos = Math.cos(-block.rotation);
        const sin = Math.sin(-block.rotation);
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;
        
        // Verificar colisão
        const closestX = Math.max(-block.width / 2, Math.min(localX, block.width / 2));
        const closestY = Math.max(-block.height / 2, Math.min(localY, block.height / 2));
        
        const distX = localX - closestX;
        const distY = localY - closestY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        if (distance < BIRD_RADIUS) {
            // Reduzir saúde do bloco
            block.health -= 10;
            
            // Aplicar impulso de rebound
            const rebound = 5;
            bird.vx *= -0.5;
            bird.vy *= -0.5;
        }
        
        // Remover blocos destruídos
        if (block.health <= 0) {
            const index = blocks.indexOf(block);
            if (index > -1) {
                blocks.splice(index, 1);
            }
        }
    });
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
    
    // Animar porquinho
    pigDefeatAnimation();
    
    // Desbloquear botão
    unlockLoginButton();
    
    // Mostrar mensagem de sucesso
    showSuccessMessage();
    
    // Criar confetes
    createConfetti();
    
    // Log
    console.log('🎉 Porquinho derrotado!');
}

/**
 * Animação de derrota do porquinho
 */
function pigDefeatAnimation() {
    let shakeFrame = 0;
    const shakeDuration = 40;
    
    const shakeInterval = setInterval(() => {
        shakeFrame++;
        const progress = shakeFrame / shakeDuration;
        
        // Shake diminuindo
        pig.shakeAmount = Math.cos(shakeFrame * 0.3) * (1 - progress) * 8;
        pig.shakeAngle = Math.sin(shakeFrame * 0.2) * (1 - progress) * 0.2;
        
        if (shakeFrame >= shakeDuration) {
            clearInterval(shakeInterval);
            pig.shakeAmount = 0;
            pig.shakeAngle = 0;
        }
    }, 16);
}

/**
 * Reseta a posição do pássaro
 */
function resetBirdPosition() {
    setTimeout(() => {
        bird.x = BIRD_START_X;
        bird.y = BIRD_START_Y;
        bird.vx = 0;
        bird.vy = 0;
        bird.hasHit = false;
        bird.rotation = 0;
    }, 600);
}

// ========================================
// INTERAÇÃO COM O USUÁRIO
// ========================================

/**
 * Lança o pássaro
 */
function launchBird(endX, endY) {
    const dragX = endX - SLINGSHOT_FORK_X;
    const dragY = endY - SLINGSHOT_FORK_Y;
    
    // Velocidade é oposta ao arrasto
    bird.vx = -dragX * LAUNCH_POWER_MULTIPLIER;
    bird.vy = -dragY * LAUNCH_POWER_MULTIPLIER;
    
    bird.isFlying = true;
    attemptCount++;
    attemptCountEl.textContent = attemptCount;
    
    console.log(`🚀 Lançamento #${attemptCount} - Velocidade: (${bird.vx.toFixed(2)}, ${bird.vy.toFixed(2)})`);
}

/**
 * Event listener para mouse down
 */
canvas.addEventListener('mousedown', (e) => {
    if (bird.isFlying || tutorialComplete) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (GAME_WIDTH / rect.width);
    const mouseY = (e.clientY - rect.top) * (GAME_HEIGHT / rect.height);
    
    // Verificar se clicou no pássaro
    const dx = mouseX - bird.x;
    const dy = mouseY - bird.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < BIRD_RADIUS + 20) {
        isDragging = true;
        dragStartX = bird.x;
        dragStartY = bird.y;
        canvas.style.cursor = 'grabbing';
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
    
    // Calcular distância de arrasto
    const dragX = mouseX - SLINGSHOT_FORK_X;
    const dragY = mouseY - SLINGSHOT_FORK_Y;
    const dragDistance = Math.sqrt(dragX * dragX + dragY * dragY);
    
    if (dragDistance > MAX_DRAG_DISTANCE) {
        // Limitar distância máxima
        const ratio = MAX_DRAG_DISTANCE / dragDistance;
        bird.x = SLINGSHOT_FORK_X + dragX * ratio;
        bird.y = SLINGSHOT_FORK_Y + dragY * ratio;
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
    canvas.style.cursor = 'grab';
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (GAME_WIDTH / rect.width);
    const mouseY = (e.clientY - rect.top) * (GAME_HEIGHT / rect.height);
    
    launchBird(mouseX, mouseY);
});

/**
 * Event listeners para touch (Mobile)
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
    
    if (distance < BIRD_RADIUS + 20) {
        isDragging = true;
        dragStartX = bird.x;
        dragStartY = bird.y;
    }
});

document.addEventListener('touchmove', (e) => {
    if (!isDragging || bird.isFlying) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = (touch.clientX - rect.left) * (GAME_WIDTH / rect.width);
    const touchY = (touch.clientY - rect.top) * (GAME_HEIGHT / rect.height);
    
    const dragX = touchX - SLINGSHOT_FORK_X;
    const dragY = touchY - SLINGSHOT_FORK_Y;
    const dragDistance = Math.sqrt(dragX * dragX + dragY * dragY);
    
    if (dragDistance > MAX_DRAG_DISTANCE) {
        const ratio = MAX_DRAG_DISTANCE / dragDistance;
        bird.x = SLINGSHOT_FORK_X + dragX * ratio;
        bird.y = SLINGSHOT_FORK_Y + dragY * ratio;
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
 * Mostra mensagem de sucesso
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
    const confettiCount = 40;
    const colors = ['#ff6b35', '#52b788', '#4a90e2', '#ffff00', '#ff69b4', '#00ff00'];
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 8 + 4 + 'px';
        confetti.style.height = confetti.style.width;
        confetti.style.animationDuration = (Math.random() * 2.5 + 2.5) + 's';
        confetti.style.animationDelay = (Math.random() * 0.3) + 's';
        
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
 * Reseta o jogo completamente
 */
function resetGame() {
    // Reset pássaro
    bird.x = BIRD_START_X;
    bird.y = BIRD_START_Y;
    bird.vx = 0;
    bird.vy = 0;
    bird.isFlying = false;
    bird.hasHit = false;
    bird.rotation = 0;
    
    // Reset porquinho
    pig.x = PIG_X;
    pig.y = PIG_Y;
    pig.isDefeated = false;
    pig.shakeAmount = 0;
    pig.shakeAngle = 0;
    
    // Reset blocos
    blocks = [
        { x: PIG_X - 70, y: GAME_HEIGHT - 100, width: 35, height: 70, rotation: 0, health: 100 },
        { x: PIG_X, y: GAME_HEIGHT - 100, width: 35, height: 70, rotation: 0, health: 100 },
        { x: PIG_X + 70, y: GAME_HEIGHT - 100, width: 35, height: 70, rotation: 0, health: 100 }
    ];
    
    // Reset estado
    isDragging = false;
    tutorialComplete = false;
    attemptCount = 0;
    attemptCountEl.textContent = attemptCount;
    
    // Reset botão se necessário
    if (!loginBtn.classList.contains('disabled')) {
        loginBtn.classList.add('disabled');
        loginBtn.classList.remove('success');
        loginBtn.disabled = true;
        loginBtn.title = 'Complete o tutorial primeiro';
    }
    
    console.log('🔄 Jogo resetado');
}

/**
 * Previne submit do formulário
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

// ========================================
// LOOP DE ANIMAÇÃO
// ========================================

/**
 * Redimensiona o canvas
 */
function resizeCanvas() {
    const container = canvas.parentElement;
    const width = container.clientWidth;
    const ratio = GAME_WIDTH / GAME_HEIGHT;
    
    canvas.width = Math.min(GAME_WIDTH, Math.floor(width * 0.95));
    canvas.height = Math.floor(canvas.width / ratio);
    
    // Escalar contexto para manter nitidez
    ctx.scale(canvas.width / GAME_WIDTH, canvas.height / GAME_HEIGHT);
}

/**
 * Loop principal
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
    console.log('🎮 Jogo inicializado!');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
