import { TPowerUp } from "@/types/arkanoid";

/* ball variables */
export const ballRadius = 3;

/* paddle variables */
export const PADDLE_SENSITIVITY = 5;
// paddle dimensions
export const paddleHeight = 10;
export const paddleWidth = 50;

/* bricks variables */
export const brickRowCount = 6;
export const brickColumnCount = 13;
export const brickWidth = 32;
export const brickHeight = 16;
export const brickPadding = 0;
export const brickOffsetTop = 80;
export const brickOffsetLeft = 10;
export const commonBrickHits = 1;
export const silverBrickHits = 3;
export const goldenBrickHits = 10;
export const brickEffectFrames = 3; // how many frames the image of the effect has to be repeated

export const BRICK_STATUS = {
  ACTIVE: 1,
  DESTROYED: 0,
};

/* scores */
export const brickScore = 60;
export const paddleHitScore = 10;

/* Power Ups */
export const powerUpWidth = 16;
export const powerUpHeight = 7.8;
export const powerUpDropSpeed = 1.6;
export const maxPowerUpFases = 7;
export const maxPowerUpsPerLevel = 10;
export const powerUpWidthScale = 10;
export const powerUpHeightScale = 8;

export const allPowerUps: TPowerUp[] = [
  {
    y: 0,
    type: "B",
  },
  {
    y: 8,
    type: "C",
  },
  {
    y: 16,
    type: "D",
  },
  {
    y: 24,
    type: "E",
  },
  {
    y: 32,
    type: "L",
  },
  {
    y: 40,
    type: "M",
  },
  {
    y: 48,
    type: "P",
  },
  {
    y: 56,
    type: "S",
  },
  {
    y: 64,
    type: "T",
  },
];
