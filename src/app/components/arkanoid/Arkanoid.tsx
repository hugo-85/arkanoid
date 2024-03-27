"use client";

import { FC, useEffect, useRef, useState } from "react";
import { DefaultSession } from "next-auth";
import {
  brickScore,
  paddleHeight,
  paddleHitScore,
  paddleWidth,
} from "@/configs/configs";
import {
  ballMovement,
  cleanCanvas,
  collisionDetection,
  drawBall,
  drawBricks,
  drawGameOver,
  drawPaddle,
  drawPowerUps,
  drawUI,
  initializeBricks,
  paddleMovement,
  powerUpsMovement,
} from "@/utils/functions";
import {
  ArkanoidBoard,
  ArkanoidBoardLabel,
  ArkanoidBoardScore,
  ArkanoidItem,
} from "./arkanoid.styles";
import { BrickType, GameType, TDropPowerUp } from "@/types/arkanoid";

interface ArkanoidProps {
  gameData: GameType;
  user: DefaultSession["user"];
}

const Arkanoid: FC<ArkanoidProps> = ({ gameData, user }) => {
  const refCanvas = useRef<HTMLCanvasElement>(null);
  const refSprite = useRef<HTMLImageElement>(null);
  const refBricks = useRef<HTMLImageElement>(null);
  const refBricks2 = useRef<HTMLImageElement>(null);
  const refPowerUps = useRef<HTMLImageElement>(null);

  let ctx: CanvasRenderingContext2D | null = null;
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(gameData.highScore);

  let gameOver = false;
  let score2 = 0;
  let highScore2 = gameData.highScore;

  /* ball variables */
  // ball position
  let x = 0;
  let y = 0;
  // ball speed
  let dx = -2;
  let dy = -2;

  /* paddle variables */
  //paddle speed
  let paddleX = 0;
  let paddleY = 0;

  let rightPressed = false;
  let leftPressed = false;

  /* bricks variables */
  let bricks: BrickType[][] = [];

  // at what fps speed we want our game renders
  const fps = 60;

  let msPrev = 0;
  let msFPSPrev = 1000;
  const msPerFrame = 1000 / fps;
  let frames = 0;
  let framesPerSec = fps;

  // power ups
  let droppingPowerUps: TDropPowerUp[] = [];

  useEffect(() => {
    let animationFrameId: number;

    function render() {
      draw();
      animationFrameId = window.requestAnimationFrame(render);
    }

    if (refCanvas?.current) {
      msPrev = window ? window.performance.now() : 0;
      msFPSPrev = window ? window.performance.now() : 0 + 1000;

      const canvas = refCanvas.current;

      resetPositions();

      ctx = canvas.getContext("2d");

      bricks = initializeBricks();
      render();
    }

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [refCanvas]);

  function keyDownHandler(event: KeyboardEvent) {
    const { key } = event;
    if (key === "Right" || key === "ArrowRight" || key.toLowerCase() === "d") {
      rightPressed = true;
    } else if (
      key === "Left" ||
      key === "ArrowLeft" ||
      key.toLowerCase() === "a"
    ) {
      leftPressed = true;
    }

    if (key === "Enter") {
      if (gameOver) {
        reloadGame();
      }
    }
  }

  function keyUpHandler(event: KeyboardEvent) {
    const { key } = event;
    if (key === "Right" || key === "ArrowRight" || key.toLowerCase() === "d") {
      rightPressed = false;
    } else if (
      key === "Left" ||
      key === "ArrowLeft" ||
      key.toLowerCase() === "a"
    ) {
      leftPressed = false;
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
      document.removeEventListener("keyup", keyUpHandler);
    };
  }, []);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score]);

  function resetPositions() {
    if (refCanvas.current) {
      x = refCanvas.current.width / 2;
      y = refCanvas.current.height - 30;

      paddleX = (refCanvas.current.width - paddleWidth) / 2;
      paddleY = refCanvas.current.height - paddleHeight - 10;
    }
  }

  function reloadGame() {
    bricks = initializeBricks();
    droppingPowerUps = [];
    resetPositions();
    setScore(0);
    gameOver = false;
  }

  function draw() {
    if (gameOver) return;

    // adjust the frame rate
    const msNow = window.performance.now();
    const msPassed = msNow - msPrev;

    if (msPassed < msPerFrame) return;

    const excessTime = msPassed % msPerFrame;
    msPrev = msNow - excessTime;

    frames++;

    if (msFPSPrev < msNow) {
      msFPSPrev = window.performance.now() + 1000;
      framesPerSec = frames;
      frames = 0;
    }

    // clean the canvas
    cleanCanvas({ ctx, canvas: refCanvas.current });

    // draw the elements
    drawBall({ ctx, x, y });

    drawPaddle({
      ctx,
      paddleX,
      paddleY,
      image: refSprite.current,
    });

    drawBricks(bricks, ctx, refBricks.current, refBricks2.current);

    drawPowerUps({ ctx, image: refPowerUps.current, droppingPowerUps });

    drawUI(ctx, framesPerSec);

    // collisions and movement
    const { newDx, newDy, bricksDestroyed } = collisionDetection({
      x,
      y,
      dx,
      dy,
      bricks,
      droppingPowerUps,
    });

    if (bricksDestroyed > 0) {
      setScore((prevValue) => prevValue + brickScore * bricksDestroyed);
      score2 = score2 + brickScore * bricksDestroyed;
    }

    dx = newDx;
    dy = newDy;

    const ballUpdate = ballMovement({
      canvas: refCanvas.current,
      y,
      x,
      dx,
      dy,
      paddleX,
      paddleY,
      rightPressed,
      leftPressed,
    });

    if (ballUpdate) {
      x = ballUpdate.x;
      y = ballUpdate.y;
      dx = ballUpdate.dx;
      dy = ballUpdate.dy;

      if (!gameOver && ballUpdate.gameOver && ctx) {
        gameOver = true;
        drawGameOver({
          ctx,
          canvas: refCanvas.current,
          image: refSprite.current,
          newScore: score2 > highScore2 ? score2 : 0,
          email: user?.email || "",
          date: new Date().toString(),
        });
      } else if (ballUpdate.paddleHit) {
        setScore((prevValue) => prevValue + paddleHitScore);
        score2 = score2 + paddleHitScore;
      }
    }

    // power ups movement
    const newDroppingPowerUps = powerUpsMovement({
      canvas: refCanvas.current,
      droppingPowerUps,
      paddleX,
      paddleY,
    });
    droppingPowerUps = newDroppingPowerUps;

    // move the paddle
    const paddleUpdate = paddleMovement({
      canvas: refCanvas.current,
      paddleX,
      rightPressed,
      leftPressed,
    });

    if (paddleUpdate) {
      paddleX = paddleUpdate.paddleX;
    }
  }

  return (
    <>
      <ArkanoidBoard>
        <ArkanoidItem>
          <ArkanoidBoardLabel>HIGH SCORE</ArkanoidBoardLabel>
          <ArkanoidBoardScore>{highScore}</ArkanoidBoardScore>
        </ArkanoidItem>
        <ArkanoidItem>
          <ArkanoidBoardLabel>SCORE</ArkanoidBoardLabel>
          <ArkanoidBoardScore>{score}</ArkanoidBoardScore>
        </ArkanoidItem>
      </ArkanoidBoard>
      <canvas width={448} height={440} ref={refCanvas} />
      <img alt="sprite" src={"/imgs/sprite.png"} ref={refSprite} hidden />
      <img alt="bricks" src={"/imgs/bricks.png"} ref={refBricks} hidden />
      <img alt="bricks2" src={"/imgs/bricks2.png"} ref={refBricks2} hidden />
      <img alt="powerups" src={"/imgs/powerups.png"} ref={refPowerUps} hidden />
    </>
  );
};

export default Arkanoid;
