import styled from "@emotion/styled";
import { Typography } from "@mui/material";

export const ArkanoidBoard = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-evenly;
`;

export const ArkanoidItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const ArkanoidBoardLabel = styled(Typography)`
  font-family: TinyIslanders;
  font-size: 2.5rem;
  text-transform: lowercase;
  line-height: 1;
  color: #06f806;
`;

export const ArkanoidBoardScore = styled(Typography)`
  font-family: TinyIslanders;
  font-size: 1.2rem;
  text-transform: lowercase;
  line-height: 1;
`;
