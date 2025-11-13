import React, { useState, useEffect } from "react";
import { Text, StyleSheet, Platform as RNPlatform } from "react-native";
import { SharedValue } from "react-native-reanimated";

const fontFamily = RNPlatform.select({ ios: "Helvetica", default: "serif" });

const styles = StyleSheet.create({
  score: {
    position: "absolute",
    left: 16,
    top: 50,
    fontSize: 18,
    color: "white",
    fontFamily,
    zIndex: 100,
  },
});

type ScoreProps = {
  score: SharedValue<number>;
};

export const Score: React.FC<ScoreProps> = ({ score }) => {
  const [scoreStr, setScoreStr] = useState("Score: 0");

  useEffect(() => {
    const interval = setInterval(() => {
      setScoreStr(`Score: ${Math.floor(score.value)}`);
    }, 100);

    return () => clearInterval(interval);
  }, [score]);

  return <Text style={styles.score}>{scoreStr}</Text>;
};
