import mongoose, { Document, Schema } from "mongoose";

export interface IGame extends Document {
  highScore: number;
  date: string;
  email: string;
}

const gameSchema: Schema = new mongoose.Schema({
  highScore: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

export const GameSchema =
  mongoose.models.Game || mongoose.model<IGame>("Game", gameSchema);
