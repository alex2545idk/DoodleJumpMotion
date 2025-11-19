import { Difficulty, useGameSettings } from "@/src/context/GameSettingsContext";
import React from "react";
import {
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type DifficultyCloudProps = {
  label: Difficulty;
  title?: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
};

const DifficultyCloud: React.FC<DifficultyCloudProps> = ({
  label,
  title,
  description,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.cloud, selected && styles.cloudSelected]}
    >
      <Text style={[styles.cloudLabel, selected && styles.cloudLabelSelected]}>
        {title ?? label}
      </Text>
      {description ? (
        <Text
          style={[
            styles.cloudDescription,
            selected && styles.cloudDescriptionSelected,
          ]}
        >
          {description}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

export const OptionsScreen = () => {
  const { difficulty, setDifficulty } = useGameSettings();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ImageBackground
        style={styles.container}
        imageStyle={styles.bgImage}
        
        // source={require("../../../assets/images/menu/paper-bg.png")}
      >
        <View style={styles.header}>
          <Text style={styles.title}>options</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>difficulty</Text>

          <View style={styles.difficultyColumn}>
            <DifficultyCloud
              label="easy"
              title="easy"
              description="wolniej, więcej platform"
              selected={difficulty === "easy"}
              onPress={() => setDifficulty("easy")}
            />
            <DifficultyCloud
              label="medium"
              title="medium"
              description="domyślny poziom"
              selected={difficulty === "medium"}
              onPress={() => setDifficulty("medium")}
            />
            <DifficultyCloud
              label="hard"
              title="hard"
              description="szybciej, mniej platform"
              selected={difficulty === "hard"}
              onPress={() => setDifficulty("hard")}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            wybierz trudność, wróć do menu i naciśnij{" "}
            <Text style={styles.footerBold}>play</Text>
          </Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#bfe9ff", // błękitne tło
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  bgImage: {
    resizeMode: "cover",
    opacity: 0.25,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    letterSpacing: 1,
    color: "#2b2b2b",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#222",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#222",
  },
  difficultyColumn: {
    flexDirection: "column",
    gap: 12,
  },
  cloud: {
    borderWidth: 2,
    borderColor: "#1b6fa8",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#e7f5ff",
  },
  cloudSelected: {
    backgroundColor: "#ffffff",
    borderColor: "#0e4c80",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 2,
  },
  cloudLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0e4c80",
    textAlign: "center",
  },
  cloudLabelSelected: {
    color: "#082a47",
  },
  cloudDescription: {
    fontSize: 12,
    color: "#3d7fa8",
    textAlign: "center",
    marginTop: 2,
  },
  cloudDescriptionSelected: {
    color: "#1b4f70",
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    textAlign: "center",
    color: "#1e3747",
  },
  footerBold: {
    fontWeight: "bold",
  },
});
