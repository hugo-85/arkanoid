import { options } from "./api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import MainMenu from "./components/menu/Menu";

export default async function Home() {
  const session = await getServerSession(options);

  if (!session?.user) return <h1>You shall not pass!</h1>;

  return <MainMenu />;
}
