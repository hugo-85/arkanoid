import { dbConnect } from "@/lib/mongodb";
import { GameSchema } from "@/models/GameSchema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    await dbConnect();

    const game = await GameSchema.find({});

    return NextResponse.json(game);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const data = await req.json();
    await dbConnect();

    const filter = { _id: "65f86b28cdd2b8e90126ab38" };
    //const game = await GameSchema.findOneAndUpdate(filter, data, { new: true });

    try {
      //   await GameSchema.create({
      //     highScore: data.newScore,
      //     email: data.email,
      //     date: data.date,
      //   });

      const game = await GameSchema.findByIdAndUpdate(
        "65f87a1a0089f1d36b19e4d4",
        {
          highScore: data.newScore,
          email: data.email,
          date: data.date,
        },
        { new: true }
      );

      return NextResponse.json(data);
    } catch (err: any) {
      console.log("ERROR", err);
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
