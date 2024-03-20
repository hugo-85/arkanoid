export type GameType = {
  _id: string;
  highScore: number;
  date: string;
};

export type BrickType = {
  x: number;
  y: number;
  status: number;
  color: number;
  unbreakable: boolean;
  powerUp?: TPowerUp;
};

export type TPowerUp = {
  y: number;
  type: string;
};
