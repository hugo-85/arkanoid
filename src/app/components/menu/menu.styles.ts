import styled from "@emotion/styled";
import { Fab } from "@mui/material";

export const MenuSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
`;

export const MenuButton = styled(Fab)`
  display: flex;
  justify-content: center;
  gap: 1rem;
  font-size: 3rem;
  color: white !important;
  cursor: pointer;

  svg {
    font-size: 4rem;
  }
`;
