export type GameType = {
  _id: string;
  highScore: number;
  date: string;
};

export type TBrickTypes = "common" | "silver" | "golden";

export type BrickType = {
  x: number;
  y: number;
  status: number;
  color: number;
  unbreakable: boolean;
  remainingHits: number;
  type: TBrickTypes;
  makeEffect: boolean;
  effectFase: number;
  effectFramesLeft: number;
  powerUp?: TPowerUp;
};

export type TPowerUp = {
  y: number;
  type: string;
};

export type TDropPowerUp = {
  x: number;
  y: number;
  powerUp: TPowerUp;
  fase: number;
  lastYFase: number;
};
