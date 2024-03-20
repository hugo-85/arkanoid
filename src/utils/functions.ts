import {
  BRICK_STATUS,
  PADDLE_SENSITIVITY,
  ballRadius,
  brickColumnCount,
  brickHeight,
  brickOffsetLeft,
  brickOffsetTop,
  brickPadding,
  brickRowCount,
  brickWidth,
  paddleHeight,
  paddleWidth,
} from "@/configs/configs";
import { BrickType, TPowerUp } from "@/types/arkanoid";

export function cleanCanvas({
  ctx,
  canvas,
}: {
  ctx: CanvasRenderingContext2D | null;
  canvas: HTMLCanvasElement | null;
}) {
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawBall({
  ctx,
  x,
  y,
}: {
  ctx: CanvasRenderingContext2D | null;
  x: number;
  y: number;
}) {
  if (!ctx) return;

  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}

export function drawPaddle({
  ctx,
  paddleX,
  paddleY,
  image,
}: {
  ctx: CanvasRenderingContext2D | null;
  paddleX: number;
  paddleY: number;
  image: HTMLImageElement | null;
}) {
  if (!ctx || !image) return null;

  ctx.drawImage(
    image, // image
    29, // clipX: x cut coordinates
    174, // clipY: y cut coordinates
    paddleWidth, // x cut size
    paddleHeight, // y cut size
    paddleX, // draw x position
    paddleY, // draw y position
    paddleWidth, // draw width
    paddleHeight // draw height
  );
}

export function drawBricks(
  bricks: BrickType[][],
  ctx: CanvasRenderingContext2D | null,
  image: HTMLImageElement | null
) {
  if (!ctx || !image) return;

  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const currentBrick = bricks[c][r];
      if (currentBrick.status === BRICK_STATUS.DESTROYED) continue;

      const clipX = currentBrick.color * 32;

      ctx.drawImage(
        image,
        clipX,
        0,
        brickWidth, // 31
        brickHeight, // 14
        currentBrick.x,
        currentBrick.y,
        brickWidth,
        brickHeight
      );
    }
  }
}

export function drawUI(
  ctx: CanvasRenderingContext2D | null,
  framesPerSec: number
) {
  if (!ctx) return;

  ctx.fillText(`FPS: ${framesPerSec}`, 5, 10);
}

export function ballMovement({
  canvas,
  x,
  y,
  dx,
  dy,
  paddleX,
  paddleY,
  rightPressed,
  leftPressed,
}: {
  canvas: HTMLCanvasElement | null;
  x: number;
  y: number;
  dx: number;
  dy: number;
  paddleX: number;
  paddleY: number;
  rightPressed: boolean;
  leftPressed: boolean;
}):
  | {
      x: number;
      y: number;
      dx: number;
      dy: number;
      gameOver: boolean;
      paddleHit: boolean;
    }
  | undefined {
  if (!canvas) return;

  let gameOver = false;
  let paddleHit = false;

  // bounce the ball on the sides
  if (
    x + dx > canvas.width - ballRadius || // right wall
    x + dx < ballRadius // left wall
  ) {
    dx = -dx;
  }

  // bounce the ball on the top
  if (y + dy < ballRadius) {
    dy = -dy;
  }

  // ball touch the paddle
  const isBallSameXAsPaddle =
    x + ballRadius > paddleX && x - ballRadius < paddleX + paddleWidth;

  const isBallTouchingPaddleSurface = y + ballRadius + dy > paddleY;

  if (isBallSameXAsPaddle && isBallTouchingPaddleSurface) {
    dy = -dy; // change ball direction
    paddleHit = true;

    if ((rightPressed && dx > 0) || (leftPressed && dx < 0)) dx = -dx;
  } else if (
    // ball touch the floor
    y + dy > canvas.height - ballRadius ||
    y + dy > paddleY + paddleHeight
  ) {
    gameOver = true;
  }

  // move the ball
  x += dx;
  y += dy;

  return { x, y, dx, dy, gameOver, paddleHit };
}

export function paddleMovement({
  canvas,
  paddleX,
  rightPressed,
  leftPressed,
}: {
  canvas: HTMLCanvasElement | null;
  paddleX: number;
  rightPressed: boolean;
  leftPressed: boolean;
}): { paddleX: number } | undefined {
  if (!canvas) return;

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += PADDLE_SENSITIVITY;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= PADDLE_SENSITIVITY;
  }

  return { paddleX };
}

export function initializeBricks() {
  let bricks: BrickType[][] = [];
  const maxUnbreakableBricks = 10;
  let unbreakableBricksCount = 0;

  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = []; // empty array
    for (let r = 0; r < brickRowCount; r++) {
      // calculate the position of the brick on the screen
      const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
      const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
      // assign a random color to the brick
      let random = Math.floor(Math.random() * 10);

      // random to determinate if it's unbreakable
      // and didn't reach the max
      if (random > 7 && unbreakableBricksCount < 10) unbreakableBricksCount++;
      else random = Math.floor(Math.random() * 8);

      const powerUps = getPowerUps();

      // save the info about the brick
      bricks[c][r] = {
        x: brickX,
        y: brickY,
        status: BRICK_STATUS.ACTIVE,
        color: random,
        unbreakable: random > 7,
      };

      if (c === brickColumnCount && r === brickRowCount)
        bricks[c][r] = { ...bricks[c][r], powerUp: powerUps[0] };
    }
  }

  return bricks;
}

export function collisionDetection({
  x,
  y,
  dx,
  dy,
  bricks,
}: {
  x: number;
  y: number;
  dx: number;
  dy: number;
  bricks: BrickType[][];
}) {
  // this variable is for the case thats hit more that one brick at the same time
  let alreadyHitOneBrick = false;
  let bricksDestroyed = 0;
  let newDx = dx;
  let newDy = dy;

  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const currentBrick = bricks[c][r];
      if (currentBrick.status === BRICK_STATUS.DESTROYED) continue;

      const isBallSameXAsBrick =
        x + ballRadius >= currentBrick.x &&
        x - ballRadius <= currentBrick.x + brickWidth;

      const isBallSameYAsBrick =
        y + ballRadius >= currentBrick.y &&
        y - ballRadius <= currentBrick.y + brickHeight;

      //the ball hit the brick
      if (isBallSameXAsBrick && isBallSameYAsBrick) {
        if (!currentBrick.unbreakable) {
          currentBrick.status = BRICK_STATUS.DESTROYED;
          bricksDestroyed++;
        }

        if (alreadyHitOneBrick) continue;

        alreadyHitOneBrick = true;

        if (dx > 0 && dy > 0) {
          //hit top or left
          const diffX = x + ballRadius - currentBrick.x;
          const diffY = y + ballRadius - currentBrick.y;

          if (diffX < diffY) newDx = -dx;
          else if (diffX > diffY) newDy = -dy;
          else {
            newDy = -dy;
            newDx = -dx;
          }
        } else if (dx > 0 && dy < 0) {
          //hit bottom or left
          const diffX = x + ballRadius - currentBrick.x;
          const diffY = currentBrick.y + brickHeight - y - ballRadius;

          if (diffX < diffY) newDx = -dx;
          else if (diffX > diffY) newDy = -dy;
          else {
            newDy = -dy;
            newDx = -dx;
          }
        } else if (dx < 0 && dy < 0) {
          //hit bottom or right
          const diffX = currentBrick.x + brickWidth - x - ballRadius;
          const diffY = currentBrick.y + brickHeight - y - ballRadius;

          if (diffX < diffY) newDx = -dx;
          else if (diffX > diffY) newDy = -dy;
          else {
            newDy = -dy;
            newDx = -dx;
          }
        } else if (dx < 0 && dy > 0) {
          //hit top or right
          const diffX = currentBrick.x + brickWidth - x - ballRadius;
          const diffY = y + ballRadius - currentBrick.y;

          if (diffX < diffY) newDx = -dx;
          else if (diffX > diffY) newDy = -dy;
          else {
            newDy = -dy;
            newDx = -dx;
          }
        }
      }
    }
  }

  return { newDx, newDy, bricksDestroyed };
}

export function drawGameOver({
  ctx,
  canvas,
  image,
  newScore,
  email,
  date,
}: {
  ctx: CanvasRenderingContext2D | null;
  canvas: HTMLCanvasElement | null;
  image: HTMLImageElement | null;
  newScore: number;
  email: string;
  date: string;
}) {
  if (!ctx || !canvas || !image) return;

  if (newScore > 0) updateScore({ newScore, email, date });

  ctx.drawImage(
    image, // image
    324, // clipX: x cut coordinates
    0, // clipY: y cut coordinates
    144, // x cut size
    20, // y cut size
    (canvas.width - 144) / 2, // draw x position
    (canvas.height - 20) / 2, // draw y position
    144, // draw width
    20 // draw height
  );
}

async function updateScore({
  newScore,
  email,
  date,
}: {
  newScore: number;
  email: string;
  date: string;
}) {
  const data = { newScore, email, date };
  await fetch("http://localhost:3000/api/game", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getPowerUps() {
  const powerUps: TPowerUp[] = [
    {
      y: 7,
      type: "B",
    },
    {
      y: 14,
      type: "C",
    },
    {
      y: 21,
      type: "D",
    },
    {
      y: 28,
      type: "E",
    },
    {
      y: 35,
      type: "L",
    },
    {
      y: 42,
      type: "M",
    },
    {
      y: 49,
      type: "P",
    },
    {
      y: 56,
      type: "S",
    },
    {
      y: 63,
      type: "T",
    },
  ];

  return powerUps;
}
