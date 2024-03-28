import {
  brickEffectFrames,
  commonBrickHits,
  goldenBrickHits,
  maxPowerUpsPerLevel,
  powerUpHeightScale,
  powerUpWidthScale,
  silverBrickHits,
} from "./../configs/configs";
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
  powerUpHeight,
  powerUpWidth,
  allPowerUps,
  powerUpDropSpeed,
  maxPowerUpFases,
} from "@/configs/configs";
import {
  BrickType,
  TBrickTypes,
  TDropPowerUp,
  TPowerUp,
} from "@/types/arkanoid";

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
  image: HTMLImageElement | null,
  effectsImage: HTMLImageElement | null
) {
  if (!ctx || !image) return;

  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const currentBrick = bricks[c][r];
      if (currentBrick.status === BRICK_STATUS.DESTROYED) continue;

      const clipX = currentBrick.color * 32;

      if (!currentBrick.makeEffect)
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
      else {
        drawBrickEffect({
          brickX: currentBrick.x,
          brickY: currentBrick.y,
          type: currentBrick.type,
          fase: currentBrick.effectFase,
          ctx,
          image: effectsImage,
        });
        currentBrick.effectFramesLeft =
          currentBrick.effectFramesLeft === 0
            ? brickEffectFrames
            : currentBrick.effectFramesLeft - 1;

        if (currentBrick.effectFramesLeft === 0) {
          currentBrick.effectFase =
            currentBrick.effectFase < 5 ? currentBrick.effectFase + 1 : 1;

          currentBrick.makeEffect = currentBrick.effectFase !== 1;
        }
      }
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
    playSound("wallHit");
    dx = -dx;
  }

  // bounce the ball on the top
  if (y + dy < ballRadius) {
    playSound("wallHit");
    dy = -dy;
  }

  // ball touch the paddle
  const isBallSameXAsPaddle =
    x + ballRadius > paddleX && x - ballRadius < paddleX + paddleWidth;

  const isBallTouchingPaddleSurface = y + ballRadius + dy > paddleY;

  if (isBallSameXAsPaddle && isBallTouchingPaddleSurface) {
    playSound("paddleHit");
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
  let specialBricksCount = 0;

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
      if (random > 7 && specialBricksCount < 10) specialBricksCount++;
      else random = Math.floor(Math.random() * 8);

      const type = random < 8 ? "common" : random === 8 ? "silver" : "golden";
      const remainingHits =
        type === "common"
          ? commonBrickHits
          : type === "silver"
          ? silverBrickHits
          : goldenBrickHits;

      // save the info about the brick
      bricks[c][r] = {
        x: brickX,
        y: brickY,
        status: BRICK_STATUS.ACTIVE,
        color: random,
        unbreakable: false,
        type,
        remainingHits,
        makeEffect: false,
        effectFase: 1,
        effectFramesLeft: brickEffectFrames,
      };
    }
  }

  assignPowerUps(bricks);

  return bricks;
}

export function collisionDetection({
  x,
  y,
  dx,
  dy,
  bricks,
  droppingPowerUps,
}: {
  x: number;
  y: number;
  dx: number;
  dy: number;
  bricks: BrickType[][];
  droppingPowerUps: TDropPowerUp[];
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
        if (currentBrick.type === "common") playSound("brickHit");
        else playSound("specialBrickHit");

        if (!currentBrick.unbreakable) {
          currentBrick.remainingHits = currentBrick.remainingHits - 1;
          if (currentBrick.remainingHits === 0) {
            currentBrick.status = BRICK_STATUS.DESTROYED;
            bricksDestroyed++;

            if (currentBrick?.powerUp) {
              // check if the brick has a power up
              droppingPowerUps.push({
                x: currentBrick.x,
                y: currentBrick.y,
                fase: 0,
                powerUp: currentBrick.powerUp,
                lastYFase: currentBrick.y,
              });
            }
          }

          // silver or golden, draw effect
          if (
            !currentBrick.makeEffect &&
            (currentBrick.type === "silver" || currentBrick.type === "golden")
          )
            currentBrick.makeEffect = true;
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

export function drawPowerUps({
  ctx,
  image,
  droppingPowerUps,
}: {
  ctx: CanvasRenderingContext2D | null;
  droppingPowerUps: TDropPowerUp[];
  image: HTMLImageElement | null;
}) {
  if (!ctx || !image) return;

  for (let i = 0; i < droppingPowerUps.length; i++) {
    const droppingPowerUp = droppingPowerUps[i];

    ctx.drawImage(
      image, // image
      2, // clipX: x cut coordinates
      73, // clipY: y cut coordinates
      powerUpWidth, // x cut size
      powerUpHeight, // y cut size
      droppingPowerUp.x + 5, // draw x position
      droppingPowerUp.y + 5, // draw y position
      powerUpWidth + powerUpWidthScale, // draw width
      powerUpHeight + powerUpHeightScale // draw height
    );

    ctx.drawImage(
      image, // image
      droppingPowerUp.fase * powerUpWidth, // clipX: x cut coordinates
      droppingPowerUp.powerUp.y, // clipY: y cut coordinates
      powerUpWidth, // x cut size
      powerUpHeight, // y cut size
      droppingPowerUp.x, // draw x position
      droppingPowerUp.y, // draw y position
      powerUpWidth + powerUpWidthScale, // draw width
      powerUpHeight + powerUpHeightScale // draw height
    );
  }
}

export function powerUpsMovement({
  canvas,
  droppingPowerUps,
  paddleX,
  paddleY,
}: {
  canvas: HTMLCanvasElement | null;
  droppingPowerUps: TDropPowerUp[];
  paddleX: number;
  paddleY: number;
}) {
  if (!canvas) return droppingPowerUps;

  const removePowerUps: number[] = [];

  for (let i = 0; i < droppingPowerUps.length; i++) {
    const droppingPowerUp = droppingPowerUps[i];

    // power up touch the paddle
    const isPowerUpSameXAsPaddle =
      (droppingPowerUp.x > paddleX &&
        droppingPowerUp.x < paddleX + paddleWidth) ||
      (droppingPowerUp.x + powerUpWidth + powerUpWidthScale > paddleX &&
        droppingPowerUp.x + powerUpWidth + powerUpWidthScale <
          paddleX + paddleWidth);

    const isPowerUpTouchingPaddleSurface =
      droppingPowerUp.y + powerUpDropSpeed > paddleY;

    // touch the floor
    if (droppingPowerUp.y + powerUpDropSpeed >= canvas.height) {
      removePowerUps.push(i);
    } else if (isPowerUpSameXAsPaddle && isPowerUpTouchingPaddleSurface) {
      // hit the paddle
      console.log("hit the paddle");
      removePowerUps.push(i);
    }

    const faseShouldChange =
      droppingPowerUp.y + powerUpDropSpeed - droppingPowerUp.lastYFase >
      powerUpHeight;

    const newFase = faseShouldChange
      ? droppingPowerUp.fase < maxPowerUpFases
        ? droppingPowerUp.fase + 1
        : 0
      : droppingPowerUp.fase;

    droppingPowerUps[i] = {
      ...droppingPowerUp,
      fase: newFase,
      y: droppingPowerUp.y + powerUpDropSpeed,
      lastYFase: faseShouldChange
        ? droppingPowerUp.y + powerUpDropSpeed
        : droppingPowerUp.lastYFase,
    };
  }

  return droppingPowerUps.filter((_, i) => !removePowerUps.includes(i));
}

function getRandomPowerUp() {
  let random = Math.floor(Math.random() * allPowerUps.length);

  return allPowerUps[random];
}

function assignPowerUps(bricks: BrickType[][]) {
  for (let i = 0; i < maxPowerUpsPerLevel; i++) {
    const randomColumn = Math.floor(Math.random() * brickColumnCount);
    const randomRow = Math.floor(Math.random() * brickRowCount);

    const powerUp = getRandomPowerUp();
    bricks[randomColumn][randomRow] = {
      ...bricks[randomColumn][randomRow],
      powerUp: powerUp,
    };
  }
}

function drawBrickEffect({
  brickX,
  brickY,
  type,
  fase,
  image,
  ctx,
}: {
  brickX: number;
  brickY: number;
  type: TBrickTypes;
  fase: number;
  ctx: CanvasRenderingContext2D | null;
  image: HTMLImageElement | null;
}) {
  if (!ctx || !image) return;

  let clipX = fase * 16;
  let clipY = type === "silver" ? 24 : 32;

  ctx.drawImage(
    image,
    clipX, // clipX: x cut coordinates
    clipY, // clipY: y cut coordinates
    16, // x cut size
    8, // y cut size
    brickX, // draw x position
    brickY, // draw y position
    brickWidth, // draw width
    brickHeight // draw height
  );
}

const sounds = {
  brickHit: () => {
    const sound = document.getElementById("brick-hit");
    if (sound) {
      const promise = (sound as HTMLAudioElement).play();

      if (promise !== undefined) {
        promise
          .then((_) => {
            // Autoplay started!
          })
          .catch((error) => {
            console.log(" Autoplay was prevented.");
          });
      }
    }
  },
  specialBrickHit: () => {
    const sound = document.getElementById("special-brick-hit");
    if (sound) {
      const promise = (sound as HTMLAudioElement).play();

      if (promise !== undefined) {
        promise
          .then((_) => {
            // Autoplay started!
          })
          .catch((error) => {
            console.log(" Autoplay was prevented.");
          });
      }
    }
  },
  paddleHit: () => {
    const sound = document.getElementById("paddle-hit");
    if (sound) {
      const promise = (sound as HTMLAudioElement).play();

      if (promise !== undefined) {
        promise
          .then((_) => {
            // Autoplay started!
          })
          .catch((error) => {
            console.log(" Autoplay was prevented.");
          });
      }
    }
  },
  wallHit: () => {
    const sound = document.getElementById("wall-hit");
    if (sound) {
      const promise = (sound as HTMLAudioElement).play();

      if (promise !== undefined) {
        promise
          .then((_) => {
            // Autoplay started!
          })
          .catch((error) => {
            console.log(" Autoplay was prevented.");
          });
      }
    }
  },
};

export function playSound(name: keyof typeof sounds) {
  sounds[name]();
}
