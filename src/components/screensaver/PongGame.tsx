"use client";

import { useEffect, useRef, useCallback } from "react";

interface PongGameProps {
  onExit: () => void;
  backgroundImage?: string; // Base64 image data
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
}

interface PixelBlock {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  visible: boolean;
  falling: boolean;
  vy: number;
  vx: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
}


// NES 56 color palette
const NES_PALETTE = [
  "#000000", "#fcfcfc", "#f8f8f8", "#bcbcbc", "#7c7c7c", "#a4e4fc", "#3cbcfc", "#0078f8",
  "#0000fc", "#b8b8f8", "#6888fc", "#0058f8", "#0000bc", "#d8b8f8", "#9878f8", "#6844fc",
  "#4428bc", "#f8b8f8", "#f878f8", "#d800cc", "#940084", "#f8a4c0", "#f85898", "#e40058",
  "#a80020", "#f0d0b0", "#f87858", "#f83800", "#a81000", "#fce0a8", "#fca044", "#e45c10",
  "#881400", "#f8d878", "#f8b800", "#ac7c00", "#503000", "#d8f878", "#b8f818", "#00b800",
  "#007800", "#b8f8b8", "#58d854", "#00a800", "#006800", "#b8f8d8", "#58f898", "#00a844",
  "#005800", "#00fcfc", "#00e8d8", "#008888", "#004058", "#f8d8f8", "#787878"
];

// Bright/dramatic colors from the NES palette (excluding grays and dark colors)
const DRAMATIC_NES_COLORS = [
  "#fcfcfc", "#a4e4fc", "#3cbcfc", "#0078f8", "#0000fc", "#b8b8f8", "#6888fc", "#0058f8",
  "#d8b8f8", "#9878f8", "#6844fc", "#f8b8f8", "#f878f8", "#d800cc", "#f8a4c0", "#f85898", 
  "#e40058", "#f0d0b0", "#f87858", "#f83800", "#fce0a8", "#fca044", "#e45c10", "#f8d878", 
  "#f8b800", "#d8f878", "#b8f818", "#00b800", "#b8f8b8", "#58d854", "#00a800", "#b8f8d8", 
  "#58f898", "#00a844", "#00fcfc", "#00e8d8", "#f8d8f8"
];

export const PongGame = ({ onExit, backgroundImage }: PongGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const pixelBlocksRef = useRef<PixelBlock[]>([]);
  const brokenTilesRef = useRef<{ x: number; y: number; width: number; height: number }[]>([]); // Permanent black tiles
  const particlesRef = useRef<Particle[]>([]);
  const trailRef = useRef<{ x: number; y: number; color: string; age: number }[]>([]); // Chemtrail
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const pixelDataRef = useRef<{ colors: string[][], width: number, height: number } | null>(null);
  const frameCountRef = useRef(0);
  
  // Rainbow colors for chemtrail
  const RAINBOW_COLORS = [
    "#ff0000", // Red
    "#ff7f00", // Orange
    "#ffff00", // Yellow
    "#00ff00", // Green
    "#0000ff", // Blue
    "#4b0082", // Indigo
    "#9400d3", // Violet
  ];
  
  const gameStateRef = useRef({
    // Ball
    ballX: 0,
    ballY: 0,
    ballSpeedX: 4,
    ballSpeedY: 4,
    ballRadius: 8,
    
    // Paddles - THICKER
    paddleWidth: 100,
    paddleHeight: 16, // Thicker paddles
    playerPaddleX: 0,
    aiPaddleX: 0,
    paddleSpeed: 6,
    
    // Scores
    playerScore: 0,
    aiScore: 0,
    
    // Input
    leftPressed: false,
    rightPressed: false,
    mouseX: 0,
    useMouseControl: false,
    
    initialized: false,
  });

  // NES-style colors
  const colors = {
    ball: "#fcfcfc",
    ballGlow: "#f8d878",
    playerPaddle: "#f85898",
    aiPaddle: "#6888fc",
    text: "#fcfcfc",
  };

  const PIXEL_SIZE = 10;

  // Pre-calculate pixel colors from the background image
  const preparePixelData = useCallback((canvas: HTMLCanvasElement, img: HTMLImageElement) => {
    const smallWidth = Math.ceil(canvas.width / PIXEL_SIZE);
    const smallHeight = Math.ceil(canvas.height / PIXEL_SIZE);

    const smallCanvas = document.createElement("canvas");
    smallCanvas.width = smallWidth;
    smallCanvas.height = smallHeight;
    const smallCtx = smallCanvas.getContext("2d");
    if (!smallCtx) return;

    smallCtx.drawImage(img, 0, 0, smallWidth, smallHeight);
    const imageData = smallCtx.getImageData(0, 0, smallWidth, smallHeight);
    const pixels = imageData.data;

    const colorGrid: string[][] = [];
    
    for (let y = 0; y < smallHeight; y++) {
      colorGrid[y] = [];
      for (let x = 0; x < smallWidth; x++) {
        const i = (y * smallWidth + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        // Use actual colors from the image (not NES palette)
        colorGrid[y][x] = `rgb(${r}, ${g}, ${b})`;
      }
    }
    
    pixelDataRef.current = { colors: colorGrid, width: smallWidth, height: smallHeight };
  }, []);

  const initGame = useCallback((canvas: HTMLCanvasElement) => {
    const state = gameStateRef.current;
    state.ballX = canvas.width / 2;
    state.ballY = canvas.height / 2;
    state.playerPaddleX = (canvas.width - state.paddleWidth) / 2;
    state.aiPaddleX = (canvas.width - state.paddleWidth) / 2;
    
    state.ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 4;
    state.ballSpeedY = (Math.random() > 0.5 ? 1 : -1) * 4;
    
    // Reset pixel blocks, broken tiles, and trail
    pixelBlocksRef.current = [];
    brokenTilesRef.current = [];
    trailRef.current = [];
  }, []);

  const resetBall = useCallback((canvas: HTMLCanvasElement) => {
    const state = gameStateRef.current;
    state.ballX = canvas.width / 2;
    state.ballY = canvas.height / 2;
    state.ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 4;
    state.ballSpeedY = (Math.random() > 0.5 ? 1 : -1) * 4;
  }, []);

  // Create chemtrail behind the ball - paints permanent rainbow pixels like a real rainbow
  const createChemtrail = useCallback(() => {
    const state = gameStateRef.current;
    const pixelData = pixelDataRef.current;
    const canvas = canvasRef.current;
    if (!pixelData || !canvas) return;
    
    // Play area boundaries
    const topBoundary = 100;
    const bottomBoundary = canvas.height - 100;
    
    const ballGridX = Math.floor(state.ballX / PIXEL_SIZE);
    const ballGridY = Math.floor(state.ballY / PIXEL_SIZE);
    
    // Get ball's movement direction
    const speed = Math.sqrt(state.ballSpeedX * state.ballSpeedX + state.ballSpeedY * state.ballSpeedY);
    if (speed === 0) return;
    
    // Perpendicular direction (for rainbow stripes across the trail)
    const perpX = -state.ballSpeedY / speed;
    const perpY = state.ballSpeedX / speed;
    
    // Paint rainbow stripes perpendicular to movement direction
    const trailWidth = 3; // Number of rainbow stripes on each side
    
    for (let stripe = -trailWidth; stripe <= trailWidth; stripe++) {
      // Position along the perpendicular axis
      const offsetX = Math.round(perpX * stripe);
      const offsetY = Math.round(perpY * stripe);
      
      const gx = ballGridX + offsetX;
      const gy = ballGridY + offsetY;
      
      // Check bounds - must be within play area
      if (gx < 0 || gx >= pixelData.width || gy < 0 || gy >= pixelData.height) continue;
      
      // Check if within play area (not in black bars)
      const pixelY = gy * PIXEL_SIZE;
      if (pixelY < topBoundary || pixelY > bottomBoundary - PIXEL_SIZE) continue;
      
      // Check if pixel already exists at this location
      const existingBlock = pixelBlocksRef.current.find(
        b => b.x === gx * PIXEL_SIZE && b.y === gy * PIXEL_SIZE && !b.falling
      );
      
      if (!existingBlock) {
        // Map stripe position to rainbow color (centered)
        // stripe goes from -3 to 3, map to 0-6 for 7 rainbow colors
        const colorIndex = stripe + trailWidth; // Now 0 to 6
        const rainbowColor = RAINBOW_COLORS[colorIndex % RAINBOW_COLORS.length];
        
        pixelBlocksRef.current.push({
          x: gx * PIXEL_SIZE,
          y: gy * PIXEL_SIZE,
          width: PIXEL_SIZE,
          height: PIXEL_SIZE,
          color: rainbowColor,
          visible: true,
          falling: false,
          vy: 0,
          vx: 0,
          rotation: 0,
          rotationSpeed: 0,
          alpha: 1,
        });
      }
    }
  }, [RAINBOW_COLORS]);

  // Trigger destruction at edges - EXTREME explosions
  const triggerDestruction = useCallback((hitX: number, hitY: number, side: "left" | "right" | "top" | "bottom") => {
    const blocks = pixelBlocksRef.current;
    const state = gameStateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Play area boundaries (inside the black bars)
    const topBoundary = 100;
    const bottomBoundary = canvas.height - 100;
    
    // Bigger destruction radius that varies
    const baseDestructionRadius = 200;
    const speedMultiplier = Math.sqrt(state.ballSpeedX * state.ballSpeedX + state.ballSpeedY * state.ballSpeedY);
    const destructionRadius = baseDestructionRadius + speedMultiplier * 15 + Math.random() * 100;
    
    blocks.forEach((block) => {
      if (!block.visible) return;
      
      // Only affect blocks within the play area
      if (block.y < topBoundary || block.y > bottomBoundary - PIXEL_SIZE) return;
      
      let distance = 0;
      switch (side) {
        case "left":
          distance = Math.sqrt(Math.pow(block.x - hitX, 2) + Math.pow(block.y + block.height / 2 - hitY, 2));
          break;
        case "right":
          distance = Math.sqrt(Math.pow(block.x + block.width - hitX, 2) + Math.pow(block.y + block.height / 2 - hitY, 2));
          break;
        case "top":
        case "bottom":
          distance = Math.sqrt(Math.pow(block.x + block.width / 2 - hitX, 2) + Math.pow(block.y - hitY, 2));
          break;
      }
      
      // Higher chance to break, especially close to impact
      const fallChance = Math.max(0, 1 - distance / destructionRadius) * 0.95;
      
      if (Math.random() < fallChance) {
        // Add a permanent hot pink tile at this location
        brokenTilesRef.current.push({
          x: block.x,
          y: block.y,
          width: block.width,
          height: block.height,
        });
        
        // Mark block for removal
        block.visible = false;
        
        // BIGGER explosion - more particles with more force - HOT PINK
        const particleCount = Math.floor(6 + Math.random() * 6); // 6-12 particles per block
        const explosionForce = 12 + Math.random() * 8;
        const hotPinkColors = ["#ff1493", "#ff69b4", "#ff007f", "#e62883", "#ff0080"];
        
        for (let i = 0; i < particleCount; i++) {
          // Direction away from impact point
          const angle = Math.atan2(block.y - hitY, block.x - hitX) + (Math.random() - 0.5) * 1.5;
          const speed = explosionForce * (0.5 + Math.random());
          const pinkColor = hotPinkColors[Math.floor(Math.random() * hotPinkColors.length)];
          
          particlesRef.current.push({
            x: block.x + block.width / 2,
            y: block.y + block.height / 2,
            vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
            vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 4,
            size: PIXEL_SIZE * (0.3 + Math.random() * 0.7), // Varying sizes
            color: pinkColor,
            alpha: 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.5,
          });
        }
      }
    });
    
    // Add extra shockwave particles at impact point - HOT PINK
    // Clamp hitY to play area
    const clampedHitY = Math.max(topBoundary + 20, Math.min(bottomBoundary - 20, hitY));
    
    const shockwaveParticles = 20 + Math.floor(Math.random() * 15);
    const hotPinkColors = ["#ff1493", "#ff69b4", "#ff007f", "#e62883", "#ff0080"];
    for (let i = 0; i < shockwaveParticles; i++) {
      const angle = (i / shockwaveParticles) * Math.PI * 2 + Math.random() * 0.3;
      const speed = 8 + Math.random() * 12;
      const pinkColor = hotPinkColors[Math.floor(Math.random() * hotPinkColors.length)];
      
      particlesRef.current.push({
        x: hitX,
        y: clampedHitY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: PIXEL_SIZE * (0.4 + Math.random() * 0.6),
        color: pinkColor,
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.6,
      });
    }
  }, []);

  const drawBlockyRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };

  // Draw pixelated fireball - 8-bit style
  const drawFireball = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const pixelSize = PIXEL_SIZE;
    const centerX = Math.floor(x / pixelSize) * pixelSize;
    const centerY = Math.floor(y / pixelSize) * pixelSize;
    
    // Fire colors from outer to inner
    const fireColors = [
      { color: "#8b0000", radius: 4 },  // Dark red - outer
      { color: "#ff0000", radius: 3.5 }, // Red
      { color: "#ff4500", radius: 3 },   // Orange red
      { color: "#ff6600", radius: 2.5 }, // Orange
      { color: "#ff9900", radius: 2 },   // Light orange
      { color: "#ffcc00", radius: 1.5 }, // Yellow orange
      { color: "#ffff00", radius: 1 },   // Yellow
      { color: "#ffffff", radius: 0.5 }, // White hot center
    ];
    
    // Draw pixelated fire layers
    fireColors.forEach((layer, layerIndex) => {
      const radius = Math.ceil(layer.radius);
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Only draw if within this layer's radius but outside inner layers
          if (dist > layer.radius) continue;
          
          // Skip if a more inner layer will cover this pixel
          let coveredByInner = false;
          for (let i = layerIndex + 1; i < fireColors.length; i++) {
            if (dist <= fireColors[i].radius) {
              coveredByInner = true;
              break;
            }
          }
          if (coveredByInner) continue;
          
          // Add flickering randomness to outer layers
          if (layerIndex < 4 && Math.random() > 0.7) continue;
          
          const px = centerX + dx * pixelSize;
          const py = centerY + dy * pixelSize;
          
          ctx.fillStyle = layer.color;
          ctx.fillRect(px, py, pixelSize - 1, pixelSize - 1);
        }
      }
    });
    
    // Add pixelated sparks flying off
    ctx.fillStyle = "#ffff00";
    for (let i = 0; i < 8; i++) {
      const sparkAngle = (frameCountRef.current * 0.1 + i * 0.8) % (Math.PI * 2);
      const sparkDist = 3 + Math.sin(frameCountRef.current * 0.2 + i) * 2;
      const sparkX = centerX + Math.round(Math.cos(sparkAngle) * sparkDist) * pixelSize;
      const sparkY = centerY + Math.round(Math.sin(sparkAngle) * sparkDist) * pixelSize;
      
      if (Math.random() > 0.3) {
        ctx.fillStyle = Math.random() > 0.5 ? "#ffff00" : "#ff6600";
        ctx.fillRect(sparkX, sparkY, pixelSize - 1, pixelSize - 1);
      }
    }
  };
  
  // Draw the permanent painted trail (pixelBlocks already handles this)
  const drawChemtrail = () => {
    // Trail painting is now handled by createChemtrail adding permanent pixels
    // This function is kept for compatibility but doesn't need to draw anything
  };

  const drawGame = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const state = gameStateRef.current;
    frameCountRef.current++;
    
    ctx.imageSmoothingEnabled = false;
    
    // Draw black bars at top and bottom for UI elements
    const uiBarHeight = 100;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, uiBarHeight); // Top bar
    ctx.fillRect(0, canvas.height - uiBarHeight, canvas.width, uiBarHeight); // Bottom bar
    
    // Draw the original background image (frozen, not pixelated) - crisp and clear
    if (backgroundImageRef.current) {
      // Only draw in the middle section
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, uiBarHeight, canvas.width, canvas.height - uiBarHeight * 2);
      ctx.clip();
      ctx.drawImage(backgroundImageRef.current, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, uiBarHeight, canvas.width, canvas.height - uiBarHeight * 2);
    }
    
    // Draw permanent hot pink broken tiles first (behind everything)
    const hotPinkShades = ["#ff1493", "#ff69b4", "#ff007f", "#e62883", "#ff0080"];
    brokenTilesRef.current.forEach((tile, index) => {
      const pinkColor = hotPinkShades[index % hotPinkShades.length];
      drawBlockyRect(ctx, tile.x, tile.y, tile.width - 1, tile.height - 1, pinkColor);
    });
    
    // Draw pixelated blocks (areas the ball has touched)
    pixelBlocksRef.current.forEach((block) => {
      if (!block.visible) return;
      
      if (block.falling) {
        ctx.save();
        ctx.translate(block.x + block.width / 2, block.y + block.height / 2);
        ctx.rotate(block.rotation);
        drawBlockyRect(ctx, -block.width / 2, -block.height / 2, block.width, block.height, block.color);
        ctx.restore();
      } else {
        // Draw pixel block with a slight gap for grid effect
        drawBlockyRect(ctx, block.x, block.y, block.width - 1, block.height - 1, block.color);
      }
    });
    
    // Draw particles
    particlesRef.current.forEach((particle) => {
      if (particle.alpha <= 0) return;
      ctx.globalAlpha = particle.alpha;
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      drawBlockyRect(ctx, -particle.size / 2, -particle.size / 2, particle.size, particle.size, particle.color);
      ctx.restore();
    });
    ctx.globalAlpha = 1;
    
    // Draw fireball
    drawFireball(ctx, state.ballX, state.ballY, state.ballRadius);
    
    // Draw player paddle (bottom) - moved up into play area
    const playerPaddleY = canvas.height - 130;
    drawBlockyRect(ctx, state.playerPaddleX, playerPaddleY, state.paddleWidth, state.paddleHeight, colors.playerPaddle);
    drawBlockyRect(ctx, state.playerPaddleX, playerPaddleY, state.paddleWidth, 3, "#fcfcfc"); // highlight
    
    // Draw AI paddle (top) - moved down into play area
    const aiPaddleY = 115;
    drawBlockyRect(ctx, state.aiPaddleX, aiPaddleY, state.paddleWidth, state.paddleHeight, colors.aiPaddle);
    drawBlockyRect(ctx, state.aiPaddleX, aiPaddleY, state.paddleWidth, 3, "#fcfcfc"); // highlight
    
    // Score display in black bars
    ctx.fillStyle = colors.aiPaddle;
    ctx.font = "bold 36px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText(state.aiScore.toString(), canvas.width / 2, 55);
    ctx.fillStyle = colors.playerPaddle;
    ctx.fillText(state.playerScore.toString(), canvas.width / 2, canvas.height - 30);
    
    // Title in top bar
    ctx.font = "bold 20px 'Courier New', monospace";
    ctx.fillStyle = colors.ballGlow;
    if (frameCountRef.current % 60 < 50) {
      ctx.fillText("COLLECTIF PONG", canvas.width / 2, 85);
    }
    
    // Center line
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    for (let x = 0; x < canvas.width; x += 30) {
      drawBlockyRect(ctx, x, canvas.height / 2 - 2, 15, 4, "rgba(255, 255, 255, 0.3)");
    }
    
    // Detect if mobile (touch device)
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Instructions in bottom bar - different for mobile vs desktop
    ctx.font = "14px 'Courier New', monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    
    if (isMobile) {
      ctx.fillText("DRAG to move paddle", canvas.width / 2, canvas.height - 65);
      ctx.font = "bold 16px 'Courier New', monospace";
      ctx.fillStyle = colors.playerPaddle;
      ctx.fillText("TAP to return to website", canvas.width / 2, canvas.height - 85);
    } else {
      ctx.fillText("← → ARROWS or MOUSE to move paddle", canvas.width / 2, canvas.height - 65);
      ctx.font = "bold 16px 'Courier New', monospace";
      ctx.fillStyle = colors.playerPaddle;
      ctx.fillText("Press ESC to return to website", canvas.width / 2, canvas.height - 85);
    }
  }, [colors]);

  const updateGame = useCallback((canvas: HTMLCanvasElement) => {
    const state = gameStateRef.current;
    
    // Update ball position
    state.ballX += state.ballSpeedX;
    state.ballY += state.ballSpeedY;
    
    // Create chemtrail behind the ball
    createChemtrail();
    
    // Ball collision with left wall
    if (state.ballX - state.ballRadius < 0) {
      state.ballSpeedX = -state.ballSpeedX;
      state.ballX = state.ballRadius;
      triggerDestruction(0, state.ballY, "left");
    }
    
    // Ball collision with right wall
    if (state.ballX + state.ballRadius > canvas.width) {
      state.ballSpeedX = -state.ballSpeedX;
      state.ballX = canvas.width - state.ballRadius;
      triggerDestruction(canvas.width, state.ballY, "right");
    }
    
    // Ball collision with player paddle (bottom) - updated position
    const playerPaddleY = canvas.height - 130;
    if (
      state.ballY + state.ballRadius > playerPaddleY &&
      state.ballY - state.ballRadius < playerPaddleY + state.paddleHeight &&
      state.ballX > state.playerPaddleX &&
      state.ballX < state.playerPaddleX + state.paddleWidth
    ) {
      state.ballSpeedY = -Math.abs(state.ballSpeedY) - 0.2;
      const hitPos = (state.ballX - state.playerPaddleX) / state.paddleWidth;
      state.ballSpeedX = (hitPos - 0.5) * 8;
    }
    
    // Ball collision with AI paddle (top) - updated position
    const aiPaddleY = 115;
    if (
      state.ballY - state.ballRadius < aiPaddleY + state.paddleHeight &&
      state.ballY + state.ballRadius > aiPaddleY &&
      state.ballX > state.aiPaddleX &&
      state.ballX < state.aiPaddleX + state.paddleWidth
    ) {
      state.ballSpeedY = Math.abs(state.ballSpeedY) + 0.2;
      const hitPos = (state.ballX - state.aiPaddleX) / state.paddleWidth;
      state.ballSpeedX = (hitPos - 0.5) * 8;
    }
    
    // Ball boundaries are at the black bars (100px from edges)
    const topBoundary = 100;
    const bottomBoundary = canvas.height - 100;
    
    // Score - ball goes past bottom (into black bar)
    if (state.ballY > bottomBoundary + state.ballRadius) {
      state.aiScore++;
      triggerDestruction(state.ballX, bottomBoundary, "bottom");
      resetBall(canvas);
    }
    
    // Score - ball goes past top (into black bar)
    if (state.ballY < topBoundary - state.ballRadius) {
      state.playerScore++;
      triggerDestruction(state.ballX, topBoundary, "top");
      resetBall(canvas);
    }
    
    // Player paddle movement (keyboard)
    if (state.leftPressed) {
      state.playerPaddleX = Math.max(0, state.playerPaddleX - state.paddleSpeed);
    }
    if (state.rightPressed) {
      state.playerPaddleX = Math.min(canvas.width - state.paddleWidth, state.playerPaddleX + state.paddleSpeed);
    }
    
    // Player paddle movement (mouse)
    if (state.useMouseControl) {
      const targetX = state.mouseX - state.paddleWidth / 2;
      state.playerPaddleX = Math.max(0, Math.min(canvas.width - state.paddleWidth, targetX));
    }
    
    // AI paddle movement
    const aiTargetX = state.ballX - state.paddleWidth / 2;
    const aiSpeed = 3.5;
    if (state.aiPaddleX < aiTargetX) {
      state.aiPaddleX = Math.min(state.aiPaddleX + aiSpeed, aiTargetX);
    } else if (state.aiPaddleX > aiTargetX) {
      state.aiPaddleX = Math.max(state.aiPaddleX - aiSpeed, aiTargetX);
    }
    state.aiPaddleX = Math.max(0, Math.min(canvas.width - state.paddleWidth, state.aiPaddleX));
    
    // Limit ball speed
    const maxSpeed = 12;
    state.ballSpeedX = Math.max(-maxSpeed, Math.min(maxSpeed, state.ballSpeedX));
    state.ballSpeedY = Math.max(-maxSpeed, Math.min(maxSpeed, state.ballSpeedY));
    
    // Remove non-visible blocks (ones that became permanent black tiles)
    pixelBlocksRef.current = pixelBlocksRef.current.filter((block) => block.visible);
    
    // Update particles - dramatic physics
    particlesRef.current.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.25; // Stronger gravity
      particle.vx *= 0.99; // Slight air resistance
      particle.alpha -= 0.015; // Slower fade for longer trails
      particle.rotation += particle.rotationSpeed;
    });
    
    particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0 && p.y < canvas.height + 100);
  }, [resetBall, triggerDestruction, createChemtrail]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    updateGame(canvas);
    drawGame(ctx, canvas);
    
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, drawGame]);

  // Initialize background image
  useEffect(() => {
    if (backgroundImage && !gameStateRef.current.initialized) {
      const img = new Image();
      img.onload = () => {
        backgroundImageRef.current = img;
        const canvas = canvasRef.current;
        if (canvas) {
          preparePixelData(canvas, img);
          gameStateRef.current.initialized = true;
        }
      };
      img.src = backgroundImage;
    }
  }, [backgroundImage, preparePixelData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initGame(canvas);
      
      if (backgroundImageRef.current) {
        preparePixelData(canvas, backgroundImageRef.current);
      }
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleKeyDown = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        state.leftPressed = true;
        state.useMouseControl = false;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        state.rightPressed = true;
        state.useMouseControl = false;
      }
      if (e.key === "Escape") {
        onExit();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        state.leftPressed = false;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        state.rightPressed = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const state = gameStateRef.current;
      state.mouseX = e.clientX;
      state.useMouseControl = true;
    };

    // Touch handlers for mobile
    let touchStartX = 0;
    let touchStartPaddleX = 0;
    let isTouchDragging = false;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartPaddleX = gameStateRef.current.playerPaddleX;
      touchStartTime = Date.now();
      isTouchDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouchDragging) return;
      e.preventDefault(); // Prevent scrolling
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const state = gameStateRef.current;
      
      // Move paddle based on touch drag
      state.playerPaddleX = Math.max(0, Math.min(
        canvas.width - state.paddleWidth,
        touchStartPaddleX + deltaX
      ));
      state.useMouseControl = false;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchDuration = Date.now() - touchStartTime;
      const touch = e.changedTouches[0];
      const deltaX = Math.abs(touch.clientX - touchStartX);
      
      // If it was a quick tap (not a drag), exit the game
      if (touchDuration < 300 && deltaX < 20) {
        onExit();
      }
      
      isTouchDragging = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initGame, gameLoop, onExit, preparePixelData]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        cursor: "none",
      }}
    />
  );
};
