// src/components/Doodle.tsx
import React from "react";
import { Image, StyleSheet } from "react-native";

// 🔹 import grafiki ludzika
// Uwaga: dopasowałem ścieżkę tak, jak w Platform.tsx
const ludzik = require("../../assets/images/ludzik.png");

interface DoodleProps {
  x: number;
  y: number;
  size: number;
}

export const Doodle: React.FC<DoodleProps> = ({ x, y, size }) => {
  return (
    <Image
      source={ludzik}
      style={[
        styles.doodle,
        { left: x, bottom: y, width: size, height: size }
      ]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  doodle: {
    position: "absolute",
  },
});
