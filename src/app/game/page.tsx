import { Suspense } from "react";
import { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { options } from "../api/auth/[...nextauth]/options";
import Arkanoid from "../components/arkanoid/Arkanoid";

async function GameLoader({ session }: { session: Session }) {
  const fetchGame = async () => {
    const res = await fetch(process.env.URL + "/api/game");
    const game = await res.json();
    return game;
  };

  let gameData: any = {};
  let game: any = {};
  try {
    gameData = await fetchGame();

    game =
      gameData?.error || gameData.length === 0 ? { highScore: 0 } : gameData[0];
  } catch (err: any) {
    gameData.error = err.error;
  }

  if (gameData?.error) return <h2>{gameData.error}</h2>;

  return <Arkanoid gameData={game} user={session.user} />;
}

export default async function Home() {
  const session = await getServerSession(options);

  if (!session?.user) return <h1>You shall not pass!</h1>;

  return (
    <Suspense fallback={<h1>Loading ....</h1>}>
      <GameLoader session={session} />
    </Suspense>
  );
}
