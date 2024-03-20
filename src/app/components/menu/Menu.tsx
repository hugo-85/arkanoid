"use client";

import { FC } from "react";
import Link from "next/link";
import Image from "next/image";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { MenuButton, MenuSection } from "./menu.styles";

interface MenuProps {}

const MainMenu: FC<MenuProps> = () => {
  return (
    <MenuSection>
      <Image
        alt="arkanoid logo"
        src="https://upload.wikimedia.org/wikipedia/commons/f/f6/Arkanoid-logo.svg"
        width={600}
        height={300}
      />
      <Link href="/game">
        <MenuButton disabled aria-label="play">
          <PlayArrowIcon />
          PLAY
        </MenuButton>
      </Link>
    </MenuSection>
  );
};

export default MainMenu;
