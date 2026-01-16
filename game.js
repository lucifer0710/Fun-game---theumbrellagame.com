  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const clouds = [];
  const roadHeight = 80;
  const roadY = canvas.height - roadHeight;

  const character = {
    x: 132,
    y: roadY + roadHeight / 2 - 72,
    width: 36,
    height: 72,
    targetX: 132,
    speed: 0.1,
    blinkTimer: 0,
    isBlinking: false
  };

  let raindrops = [];
  let score = 0;
  let highScore = 0;
  let gameOver = false;
  let lightningFlash = 0;
  let touchStartX = null;
  let animationId;

  const lightningSound = new Audio("https://actions.google.com/sounds/v1/weather/thunder_crack.ogg");

  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#16213e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    ctx.fillStyle = "#444";
    clouds.forEach(cloud => {
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, 14, 0, Math.PI * 2);
      ctx.arc(cloud.x + 12, cloud.y + 4, 12, 0, Math.PI * 2);
      ctx.arc(cloud.x - 12, cloud.y + 4, 12, 0, Math.PI * 2);
      ctx.fill();

      cloud.x += cloud.speed;
      if (cloud.x > canvas.width + 20) cloud.x = -20;
    });

    // Draw road
    ctx.fillStyle = "#222";
    ctx.fillRect(0, roadY, canvas.width, roadHeight);

    // Dashed road line
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(0, roadY + roadHeight / 2);
    ctx.lineTo(canvas.width, roadY + roadHeight / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Lightning flash
    if (lightningFlash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${lightningFlash})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      lightningFlash -= 0.05;
    }
  }

  function drawCharacter() {
    const cx = character.x;
    const cy = character.y;
    const offsetY = -6;

    ctx.fillStyle = "#ff3366";
    ctx.beginPath();
    ctx.arc(cx + 18, cy - 12 + offsetY, 21, Math.PI, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + 18, cy - 12 + offsetY);
    ctx.lineTo(cx + 18, cy + 6 + offsetY);
    ctx.stroke();

    ctx.fillStyle = "#ffe0bd";
    ctx.beginPath();
    ctx.arc(cx + 18, cy + 12 + offsetY, 9, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#000";
    if (character.isBlinking) {
      ctx.fillRect(cx + 14, cy + 9 + offsetY, 3, 1);
      ctx.fillRect(cx + 23, cy + 9 + offsetY, 3, 1);
    } else {
      ctx.beginPath();
      ctx.arc(cx + 15, cy + 10 + offsetY, 1.2, 0, 2 * Math.PI);
      ctx.arc(cx + 22, cy + 10 + offsetY, 1.2, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.fillStyle = "#3399ff";
    ctx.fillRect(cx + 9, cy + 21 + offsetY, 18, 24);

    ctx.fillStyle = "#ffe0bd";
    ctx.fillRect(cx + 3, cy + 21 + offsetY, 6, 12);
    ctx.fillRect(cx + 27, cy + 21 + offsetY, 6, 12);

    ctx.fillStyle = "#333";
    ctx.fillRect(cx + 9, cy + 45 + offsetY, 6, 15);
    ctx.fillRect(cx + 21, cy + 45 + offsetY, 6, 15);
  }

  function drawRaindrops() {
    ctx.strokeStyle = "rgba(0, 136, 255, 0.5)";
    ctx.lineWidth = 2;
    raindrops.forEach(drop => {
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x, drop.y + 10);
      ctx.stroke();
    });
  }

  function moveRaindrops() {
    raindrops.forEach(drop => {
      drop.y += drop.speed;
    });
    raindrops = raindrops.filter(drop => drop.y < canvas.height);
  }

  function generateRaindrop() {
    if (Math.random() < 0.04) {
      raindrops.push({
        x: Math.random() * canvas.width,
        y: -10,
        speed: 2 + Math.random() * 2
      });
    }
  }

  function detectCollision() {
    for (let drop of raindrops) {
      if (
        drop.x > character.x &&
        drop.x < character.x + character.width &&
        drop.y > character.y - 40 &&
        drop.y < character.y + character.height
      ) {
        gameOver = true;
        cancelAnimationFrame(animationId);
        document.getElementById("restartBtn").style.display = "inline-block";
        if (score > highScore) {
          highScore = score;
          document.getElementById("highScore").textContent = "High Score: " + highScore;
        }
      }
    }
  }

  function updateScore() {
    score++;
    document.getElementById("score").textContent = "Score: " + score;
  }

  function gameLoop() {
    character.x += (character.targetX - character.x) * character.speed;
    character.x = Math.min(Math.max(0, character.x), canvas.width - character.width);

    drawBackground();
    drawCharacter();
    generateRaindrop();
    moveRaindrops();
    drawRaindrops();
    detectCollision();
    updateScore();

    if (character.blinkTimer-- < 0) {
      character.isBlinking = !character.isBlinking;
      character.blinkTimer = character.isBlinking ? 10 : 200 + Math.random() * 300;
    }

    if (Math.random() < 0.005) {
      lightningFlash = 0.8;
      lightningSound.currentTime = 0;
      lightningSound.play();
    }

    if (!gameOver) animationId = requestAnimationFrame(gameLoop);
  }

  function resetGame() {
    character.x = 132;
    character.targetX = 132;
    raindrops = [];
    score = 0;
    gameOver = false;
    document.getElementById("score").textContent = "Score: 0";
    document.getElementById("restartBtn").style.display = "none";
    gameLoop();
  }

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") character.targetX -= 30;
    else if (e.key === "ArrowRight") character.targetX += 30;
  });

  canvas.addEventListener("touchstart", e => touchStartX = e.touches[0].clientX);
  canvas.addEventListener("touchmove", e => {
    if (touchStartX !== null) {
      const dx = e.touches[0].clientX - touchStartX;
      character.targetX += dx * 0.5;
      touchStartX = e.touches[0].clientX;
    }
  });
  canvas.addEventListener("touchend", () => (touchStartX = null));

  canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    character.targetX = e.clientX - rect.left - character.width / 2;
  });

  document.getElementById("restartBtn").addEventListener("click", resetGame);

  // Initialize clouds with random starting positions and speeds
  for (let i = 0; i < 3; i++) {
    clouds.push({
      x: Math.random() * canvas.width,
      y: 40 + Math.random() * 40,
      speed: 0.3 + Math.random() * 0.3
    });
  }

  resetGame();
