import Player from "./classes/Player.js";
import Grid from "./classes/Grid.js";
import Particle from "./classes/Particle.js";
import SoundEffects from "./classes/SoundEffects.js";
import Obstacle from "./classes/Obstacle.js";
import Star from "./classes/Star.js";
import Ranking from "./classes/Ranking.js";
import NicknameModal from "./classes/NicknameModal.js";
import AssetLoader from "./classes/AssetLoader.js";
import { saveScore, getTopScores } from "./utils/firebase.js";
import { GameState, NUMBER_STARS, PATH_SPACESHIP_IMAGE, PATH_INVADER_IMG, PATH_OBSTACLE_IMAGE, PATH_LOGO_IMAGE } from "./utils/constants.js";

const AUDIO_PATHS = [
    "src/assets/audios/shoot.mp3",
    "src/assets/audios/hit.mp3",
    "src/assets/audios/explosion.mp3",
    "src/assets/audios/next_level.mp3",
];

const IMAGE_PATHS = [
    PATH_SPACESHIP_IMAGE,
    PATH_INVADER_IMG,
    PATH_OBSTACLE_IMAGE,
    PATH_LOGO_IMAGE,
];

const soundEffects = new SoundEffects();

const startScreen = document.querySelector(".start-screen");
const gameOverScreen = document.querySelector(".game-over");
const scoreUi = document.querySelector(".score-ui");
const scoreElement = scoreUi.querySelector(".score > span");
const levelElement = scoreUi.querySelector(".level > span");
const highElement = scoreUi.querySelector(".high > span");
const livesUi = document.querySelector(".lives-ui");
const livesElement = livesUi.querySelector("span");
const buttonPlay = document.querySelector(".button-play");
const buttonRanking = document.querySelector(".button-ranking");
const buttonRestart = document.querySelector(".button-restart");
const buttonMenu = document.querySelector(".button-menu");

const ranking = new Ranking((period) => getTopScores(period));
const nicknameModal = new NicknameModal((nickname) => {
    startGame();
});

gameOverScreen.remove();

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

context.imageSmoothingEnabled = false;

let currentState = GameState.START;

const gameData = {
    score: 0,
    level: 1,
    high: 0,
};

let screenShake = {
    intensity: 0,
    duration: 0,
    timer: 0,
};

const triggerScreenShake = (intensity = 6, duration = 12) => {
    screenShake.intensity = intensity;
    screenShake.duration = duration;
    screenShake.timer = duration;
};

const showGameData = () => {
    scoreElement.textContent = gameData.score;
    levelElement.textContent = gameData.level;
    highElement.textContent = gameData.high;
    livesElement.textContent = "❤".repeat(player.lives);
};

const player = new Player(canvas.width, canvas.height);

const grid = new Grid(
    Math.round(Math.random() * 2 + 1),
    Math.round(Math.random() * 3 + 1)
);

const stars = [];
const playerProjectiles = [];
const invaderProjectiles = [];
const particles = [];
const obstacles = [];

const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.imageSmoothingEnabled = false;

    player.canvasWidth = canvas.width;
    player.canvasHeight = canvas.height;
    player.position.x = Math.min(Math.max(0, canvas.width / 2 - player.width / 2), canvas.width - player.width);
    player.position.y = canvas.height - player.height - 30;

    if (currentState !== GameState.START) {
        obstacles.length = 0;
        initObstacles();
    }

    stars.length = 0;
    generateStars();
};

window.addEventListener("resize", handleResize);

const initObstacles = () => {
    const obstacleWidth = 165;
    const obstacleHeight = 60;
    const y = canvas.height - 250;
    const centerX = canvas.width / 2 - obstacleWidth / 2;
    const offset = canvas.width * 0.2;

    const obstacle1 = new Obstacle({ x: centerX - offset, y }, obstacleWidth, obstacleHeight, PATH_OBSTACLE_IMAGE);
    const obstacle2 = new Obstacle({ x: centerX, y }, obstacleWidth, obstacleHeight, PATH_OBSTACLE_IMAGE);
    const obstacle3 = new Obstacle({ x: centerX + offset, y }, obstacleWidth, obstacleHeight, PATH_OBSTACLE_IMAGE);

    obstacles.push(obstacle1);
    obstacles.push(obstacle2);
    obstacles.push(obstacle3);
};

initObstacles();

const keys = {
    left: false,
    right: false,
    shoot: {
        pressed: false,
        released: true
    },
};

const incrementScore = (value) => {
    gameData.score += value;

    if (gameData.score > gameData.high) {
        gameData.high = gameData.score;
    }
};

const incrementLevel = () => {
    gameData.level++;
};

const generateStars = () => {
    for (let i = 0; i < NUMBER_STARS; i++) {
        stars.push(new Star(canvas.width, canvas.height));
    }
};

const drawStars = () => {
    stars.forEach((star) => {
        star.draw(context);
        star.update();
    });
};

const drawObstacles = () => {
    obstacles.forEach((obstacle) => obstacle.draw(context));
};

const drawProjectiles = () => {
    const projectiles = [...playerProjectiles, ...invaderProjectiles];

    projectiles.forEach((projectile) => {
        projectile.draw(context);
        projectile.update();
    });
};

const drawParticles = () => {
    particles.forEach((particle) => {
        particle.draw(context);
        particle.update();
    });
};

const clearProjectiles = () => {
    for (let i = playerProjectiles.length - 1; i >= 0; i--) {
        if (playerProjectiles[i].position.y <= 0) playerProjectiles.splice(i, 1);
    }

    for (let i = invaderProjectiles.length - 1; i >= 0; i--) {
        if (invaderProjectiles[i].position.y > canvas.height) invaderProjectiles.splice(i, 1);
    }
};

const clearParticles = () => {
    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].opacity <= 0) particles.splice(i, 1);
    }
};

const createExplosion = (position, size, color) => {
    for (let i = 0; i < size; i++) {
        const particle = new Particle(
            {
                x: position.x,
                y: position.y,
            },

            {
                x: (Math.random() - 0.5) * 1.5,
                y: (Math.random() - 0.5) * 1.5,
            },
            2,
            color
        );

        particles.push(particle);
    }
};

const checkShootInvaders = () => {
    for (let ii = grid.invaders.length - 1; ii >= 0; ii--) {
        const invader = grid.invaders[ii];
        for (let pi = playerProjectiles.length - 1; pi >= 0; pi--) {
            const projectile = playerProjectiles[pi];
            if (invader.hit(projectile)) {
                soundEffects.playHitSound();
                createExplosion(
                    {
                        x: invader.position.x + invader.width / 2,
                        y: invader.position.y + invader.height / 2,
                    },
                    10,
                    "#888888"
                );
                incrementScore(10);
                grid.invaders.splice(ii, 1);
                playerProjectiles.splice(pi, 1);
                break;
            }
        }
    }
};

const checkShootPlayer = () => {
    invaderProjectiles.some((projectile, index) => {
        if (player.hit(projectile)) {
            invaderProjectiles.splice(index, 1);
            const died = player.takeDamage();

            if (died) {
                soundEffects.playExplosionSound();
                triggerScreenShake(10, 20);
                gameOver();

            } else {
                soundEffects.playHitSound();
                triggerScreenShake(6, 12);
                createExplosion(
                    {
                        x: player.position.x + player.width / 2, y: player.position.y + player.height / 2
                    },
                    10,
                    "crimson"
                );
                createExplosion(
                    {
                        x: player.position.x + player.width / 2, y: player.position.y + player.height / 2
                    },
                    5,
                    "#ff6600"
                );
            }

            return true;
        }
    });
};

const checkShootObstacles = () => {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];

        playerProjectiles.some((projectile, index) => {
            if (obstacle.hit(projectile)) {
                createExplosion(
                    {
                        x: projectile.position.x,
                        y: projectile.position.y,
                    },
                    5,
                    "#69625D"
                );

                playerProjectiles.splice(index, 1);
                return true;
            }
        });

        invaderProjectiles.some((projectile, index) => {
            if (obstacle.hit(projectile)) {
                createExplosion(
                    {
                        x: projectile.position.x,
                        y: projectile.position.y,
                    },
                    5,
                    "#69625D"
                );

                invaderProjectiles.splice(index, 1);
                return true;
            }
        });

        if (obstacle.isDestroyed()) {
            createExplosion(
                {
                    x: obstacle.position.x + obstacle.width / 2,
                    y: obstacle.position.y + obstacle.height / 2,
                },
                15,
                "#8B7355"
            );
            createExplosion(
                {
                    x: obstacle.position.x + obstacle.width / 2,
                    y: obstacle.position.y + obstacle.height / 2,
                },
                8,
                "#3d3834"
            );
            obstacles.splice(i, 1);
        }
    }
};

const checkInvadersCollidedObstacles = () => {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        for (let j = grid.invaders.length - 1; j >= 0; j--) {
            const invader = grid.invaders[j];
            if (invader.collided(obstacle)) {
                const ex = invader.position.x + invader.width / 2;
                const ey = invader.position.y + invader.height / 2;
                createExplosion({ x: ex, y: ey }, 10, "#69625D");
                createExplosion({ x: ex, y: ey }, 10, "#3d3834ff");
                createExplosion({ x: ex, y: ey }, 10, "#2d241eff");
                grid.invaders.splice(j, 1);
                obstacles.splice(i, 1);
                break;
            }
        }
    }
};

const checkPlayerCollidedInvaders = () => {
    grid.invaders.some((invader) => {
        if (player.invincible) return false;

        if (
            invader.position.x + invader.width >= player.position.x &&
            invader.position.x <= player.position.x + player.width &&
            invader.position.y + invader.height >= player.position.y &&
            invader.position.y <= player.position.y + player.height
        ) {
            const died = player.takeDamage();
            if (died) {
                soundEffects.playExplosionSound();
                gameOver();
            } else {
                soundEffects.playHitSound();
                createExplosion(
                    { x: player.position.x + player.width / 2, y: player.position.y + player.height / 2 },
                    6,
                    "crimson"
                );
            }
            return true;
        }
    });
};

const spawnGrid = () => {
    if (grid.invaders.length === 0) {
        soundEffects.playNextLevelSound();

        incrementLevel();

        if (gameData.level % 5 === 0) {
            player.gainLife();
        }

        const maxRows = Math.min(4 + Math.floor(gameData.level / 2), 8);
        const maxCols = Math.min(4 + Math.floor(gameData.level / 2), 8);
        grid.rows = Math.round(Math.random() * (maxRows - 1) + 1);
        grid.cols = Math.round(Math.random() * (maxCols - 1) + 2);

        grid.invaderVelocity = Math.min(1.8 + (gameData.level * 0.1), 6);
        grid.restart();

        obstacles.length = 0;
        initObstacles();

        updateShootingInterval();
    }
};

const gameOver = () => {
    createExplosion(
        { x: player.position.x + player.width / 2, y: player.position.y + player.height / 2 },
        10,
        "white"
    );

    createExplosion(
        { x: player.position.x + player.width / 2, y: player.position.y + player.height / 2 },
        5,
        "#4D9BE6"
    );

    createExplosion(
        { x: player.position.x + player.width / 2, y: player.position.y + player.height / 2 },
        5,
        "crimson"
    );

    currentState = GameState.GAME_OVER;
    player.alive = false;
    document.body.append(gameOverScreen);
    gameOverScreen.classList.add("zoom-animation");

    showGameData();

    saveScore(NicknameModal.getNickname(), gameData.score);
};

const FPS = 60;
const frameInterval = 1000 / FPS;
let lastFrameTime = 0;
let lastShootTime = 0;

const gameLoop = (currentTime) => {
    window.requestAnimationFrame(gameLoop);

    if (!currentTime) currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTime;

    if (deltaTime >= frameInterval) {
        lastFrameTime = currentTime - (deltaTime % frameInterval);

        context.clearRect(0, 0, canvas.width, canvas.height);

        let shakeActive = false;
        if (screenShake.timer > 0) {
            shakeActive = true;
            const shakeX = (Math.random() - 0.5) * screenShake.intensity * (screenShake.timer / screenShake.duration);
            const shakeY = (Math.random() - 0.5) * screenShake.intensity * (screenShake.timer / screenShake.duration);
            context.save();
            context.translate(shakeX, shakeY);
            screenShake.timer--;
        }

        drawStars();

        if (currentState === GameState.PLAYING) {
            showGameData();
            spawnGrid();

            drawProjectiles();
            drawParticles();
            drawObstacles();

            clearProjectiles();
            clearParticles();

            checkShootInvaders();
            checkShootPlayer();
            checkShootObstacles();
            checkInvadersCollidedObstacles();
            checkPlayerCollidedInvaders();

            grid.draw(context);
            grid.update(player.alive, canvas.width);

            context.save();

            context.translate(
                player.position.x + player.width / 2,
                player.position.y + player.height / 2
            );

            if (keys.shoot.pressed) {
                if (currentTime - lastShootTime >= 200) {
                    soundEffects.playShootSound();
                    player.shoot(playerProjectiles);
                    lastShootTime = currentTime;
                }
            }

            if (keys.left) {
                player.moveLeft();
                context.rotate(-0.15);
            }

            if (keys.right) {
                player.moveRight();
                context.rotate(0.15);
            }

            context.translate(
                -player.position.x - player.width / 2,
                -player.position.y - player.height / 2
            );

            player.draw(context);
            context.restore();
        }

        if (currentState === GameState.GAME_OVER) {
            checkShootObstacles();

            drawProjectiles();
            drawParticles();
            drawObstacles();

            clearProjectiles();
            clearParticles();

            grid.draw(context);
            grid.update(player.alive, canvas.width);
        }

        if (shakeActive) {
            context.restore();
        }
    }
};

const restartGame = () => {
    currentState = GameState.PLAYING;
    player.reset(canvas.width, canvas.height);

    grid.invaders.length = 0;
    grid.invaderVelocity = 2;

    invaderProjectiles.length = 0;
    playerProjectiles.length = 0;

    gameData.score = 0;
    gameData.level = 0;

    gameOverScreen.remove();
    updateShootingInterval();
};

const restartMenu = () => {
    currentState = GameState.START;

    document.body.appendChild(startScreen);
    startScreen.style.display = "";

    scoreUi.style.display = "none";
    livesUi.style.display = "none";
    gameOverScreen.remove();

    if (shootingInterval) {
        clearInterval(shootingInterval);
        shootingInterval = null;
    }

    player.reset(canvas.width, canvas.height);
    player.alive = false;

    grid.invaders.length = 0;
    grid.invaderVelocity = 2;

    playerProjectiles.length = 0;
    invaderProjectiles.length = 0;

    obstacles.length = 0;
    initObstacles();

    gameData.score = 0;
    gameData.level = 0;
};

window.addEventListener("keydown", (event) => {
    const key = event.key.toUpperCase();

    if (key === "A") keys.left = true;
    if (key === "D") keys.right = true;
    if (key === "ENTER" || key === " ") keys.shoot.pressed = true;
});

window.addEventListener("keyup", (event) => {
    const key = event.key.toUpperCase();

    if (key === "A") keys.left = false;
    if (key === "D") keys.right = false;
    if (key === "ENTER" || key === " ") keys.shoot.pressed = false;
});

let shootingInterval = null;

const updateShootingInterval = () => {
    if (shootingInterval) clearInterval(shootingInterval);

    const intervalTime = Math.max(600, 1600 - (gameData.level * 100));

    const numberOfShooters = Math.min(5, Math.floor(gameData.level / 2) + 1);

    const projectileVelocity = Math.min(3 + (gameData.level * 0.3), 6);

    shootingInterval = setInterval(() => {
        const shootersCount = Math.min(numberOfShooters, grid.invaders.length);

        const shooters = [...grid.invaders].sort(() => 0.5 - Math.random()).slice(0, shootersCount);

        shooters.forEach((invader) => {
            invader.shoot(invaderProjectiles, projectileVelocity);
        });

    }, intervalTime);
};

const startGame = () => {
    startScreen.remove();
    scoreUi.style.display = "block";
    livesUi.style.display = "block";
    currentState = GameState.PLAYING;

    updateShootingInterval();
};

buttonPlay.addEventListener("click", () => {
    if (!NicknameModal.getNickname()) {
        nicknameModal.show();

    } else {
        startGame();
    }
});


buttonRanking.addEventListener("click", () => {
    ranking.show();
});


buttonRestart.addEventListener("click", restartGame);
buttonMenu.addEventListener("click", restartMenu);

generateStars();

const initGame = async () => {
    const loader = new AssetLoader();
    await loader.loadAll(IMAGE_PATHS, AUDIO_PATHS);

    window.requestAnimationFrame((time) => {
        lastFrameTime = time;
        gameLoop(time);
    });
};

initGame();