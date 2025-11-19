import React, { createContext, ReactNode, useContext, useState } from "react";

export type Difficulty = "easy" | "medium" | "hard";

type GameSettingsContextValue = {
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
};

const GameSettingsContext = createContext<GameSettingsContextValue | undefined>(
  undefined
);

export const GameSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  return (
    <GameSettingsContext.Provider value={{ difficulty, setDifficulty }}>
      {children}
    </GameSettingsContext.Provider>
  );
};

export const useGameSettings = () => {
  const ctx = useContext(GameSettingsContext);
  if (!ctx) {
    throw new Error("useGameSettings must be used inside GameSettingsProvider");
  }
  return ctx;
};
