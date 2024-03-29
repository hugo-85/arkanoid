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

  const gameData = await fetchGame();

  const game =
    gameData?.error || gameData.length === 0 ? { highScore: 0 } : gameData[0];

  if (gameData?.error) return <h2>Database probably shutdown</h2>;

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
