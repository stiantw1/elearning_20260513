import { useEffect, useRef, useState } from 'react';
import { Ball, Paddle, Brick, GameState } from '../types';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 8;
const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 9;
const BRICK_WIDTH = 75;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 35;

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 5,
    isGameOver: false,
    isGameWon: false,
  });

  const resetGame = () => {
    ballRef.current = { pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30 }, vel: { dx: 4, dy: -4 }, radius: BALL_RADIUS };
    paddleRef.current = { pos: { x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2, y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10 }, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };
    
    // Initialize Bricks
    const newBricks: Brick[][] = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      newBricks[c] = [];
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        newBricks[c][r] = {
          pos: { x: (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT, y: (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP },
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          status: 1,
          color: `hsl(${r * 40}, 70%, 50%)`
        };
      }
    }
    bricksRef.current = newBricks;

    setGameState({
      score: 0,
      lives: 5,
      isGameOver: false,
      isGameWon: false,
    });
  };

  // Using refs for game objects to avoid frequent re-renders
  const ballRef = useRef<Ball>({ pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30 }, vel: { dx: 4, dy: -4 }, radius: BALL_RADIUS });
  const paddleRef = useRef<Paddle>({ pos: { x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2, y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10 }, width: PADDLE_WIDTH, height: PADDLE_HEIGHT });
  const bricksRef = useRef<Brick[][]>([]);

  useEffect(() => {
    // Initialize Bricks
    const newBricks: Brick[][] = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      newBricks[c] = [];
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        newBricks[c][r] = {
          pos: { x: (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT, y: (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP },
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          status: 1,
          color: `hsl(${r * 40}, 70%, 50%)`
        };
      }
    }
    bricksRef.current = newBricks;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const gameLoop = () => {
      if (gameState.isGameOver || gameState.isGameWon) return;

      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw
      drawBall(ctx, ballRef.current);
      drawPaddle(ctx, paddleRef.current);
      drawBricks(ctx, bricksRef.current);

      // Update positions
      updateBall();
      
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState.isGameOver, gameState.isGameWon]);

  const drawBall = (ctx: CanvasRenderingContext2D, ball: Ball) => {
    ctx.beginPath();
    ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#eb4034';
    ctx.fill();
    ctx.closePath();
  };

  const drawPaddle = (ctx: CanvasRenderingContext2D, paddle: Paddle) => {
    ctx.beginPath();
    ctx.rect(paddle.pos.x, paddle.pos.y, paddle.width, paddle.height);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
  };

  const drawBricks = (ctx: CanvasRenderingContext2D, bricks: Brick[][]) => {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        const b = bricks[c][r];
        if (b.status === 1) {
          ctx.beginPath();
          ctx.rect(b.pos.x, b.pos.y, b.width, b.height);
          ctx.fillStyle = b.color;
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  };

  const updateBall = () => {
    const ball = ballRef.current;
    const paddle = paddleRef.current;

    // Ball movement
    ball.pos.x += ball.vel.dx;
    ball.pos.y += ball.vel.dy;

    // Wall collision (left/right)
    if (ball.pos.x + ball.vel.dx > CANVAS_WIDTH - ball.radius || ball.pos.x + ball.vel.dx < ball.radius) {
      ball.vel.dx = -ball.vel.dx;
    }
    // Wall collision (top)
    if (ball.pos.y + ball.vel.dy < ball.radius) {
      ball.vel.dy = -ball.vel.dy;
    }
    // Bottom collision (Game Over)
    else if (ball.pos.y + ball.vel.dy > CANVAS_HEIGHT - ball.radius) {
      setGameState(prev => {
        const nextLives = prev.lives - 1;
        if(nextLives <= 0) {
          return { ...prev, lives: 0, isGameOver: true };
        }
        // Reset ball
        ball.pos = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30 };
        ball.vel = { dx: 4, dy: -4 };
        return { ...prev, lives: nextLives };
      });
    }

    // Paddle collision
    if (
      ball.pos.y + ball.radius >= paddle.pos.y &&
      ball.pos.x >= paddle.pos.x &&
      ball.pos.x <= paddle.pos.x + paddle.width
    ) {
      ball.vel.dy = -ball.vel.dy;
    }

    // Brick collision
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        const b = bricksRef.current[c][r];
        if (b.status === 1) {
          if (
            ball.pos.x > b.pos.x &&
            ball.pos.x < b.pos.x + b.width &&
            ball.pos.y > b.pos.y &&
            ball.pos.y < b.pos.y + b.height
          ) {
            ball.vel.dy = -ball.vel.dy;
            b.status = 0;
            setGameState(prev => ({ ...prev, score: prev.score + 10 }));
          }
        }
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      if (relativeX > 0 && relativeX < CANVAS_WIDTH) {
        paddleRef.current.pos.x = relativeX - paddleRef.current.width / 2;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative flex flex-col items-center gap-4 bg-gray-900 p-8 min-h-screen">
      <div className="text-white text-2xl font-bold flex gap-8">
        <span>Score: {gameState.score}</span>
        <span>Lives: {gameState.lives}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="bg-black border-4 border-gray-700 rounded-lg shadow-2xl"
      />
      {(gameState.isGameOver || gameState.isGameWon) && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-6 rounded-lg flex flex-col items-center gap-4">
          <div className="text-white text-4xl">{gameState.isGameOver ? 'Game Over!' : 'You Won!'}</div>
          <button 
            onClick={resetGame}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
          >
            重新開始
          </button>
        </div>
      )}
    </div>
  );
}
