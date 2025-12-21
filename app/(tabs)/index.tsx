// app/(tabs)/index.tsx
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { GameScreen } from "../../src/screens/GameScreen"; // путь к твоему экрану

export default function HomeScreen() {
  const [seed, setSeed] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const gameSeed = (window as any).GAME_SEED;
      if (gameSeed) {
        setSeed(gameSeed);
      }
    }
  }, []);

  if (!seed) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading level...</Text>
      </View>
    );
  }

  return <GameScreen seed={seed} />;
}
