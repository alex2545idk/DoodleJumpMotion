// src/components/Platform.tsx
import React from "react";
import { Image, StyleSheet } from "react-native";

// 🔹 import trampoliny (dostosuj ścieżkę jeśli trzeba)
const trampolina = require("../../assets/images/trampolina.png");

interface PlatformProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const Platform: React.FC<PlatformProps> = ({ x, y, width, height }) => {
  return (
    <Image
      source={trampolina}
      style={[
        styles.platform,
        { left: x, bottom: y, width, height }
      ]}
      resizeMode="stretch"
    />
  );
};

const styles = StyleSheet.create({
  platform: {
    position: "absolute",
  },
});
