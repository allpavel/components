import { FC, ReactNode, createContext, useContext } from "react";

type Direction = "ltr" | "rtl";

interface DirectionProviderProps {
  children: ReactNode;
  direction: Direction;
}

const DirectionContext = createContext<Direction | undefined>(undefined);

export const DirectionProvider: FC<DirectionProviderProps> = ({ children, direction }) => {
  return <DirectionContext.Provider value={direction}>{children}</DirectionContext.Provider>;
};

export const useDirection = (localDirection?: Direction) => {
  const globalDirection = useContext(DirectionContext);
  return localDirection || globalDirection || "ltr";
};
