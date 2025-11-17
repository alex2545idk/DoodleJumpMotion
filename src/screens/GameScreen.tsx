import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Doodle } from "../components/Doodle";
import { Platform as PlatformComponent } from "../components/Platform";
import { Score } from "../components/Score";
import {
  DOODLE_SIZE,
  GRAVITY,
  height,
  JUMP_HEIGHT,
  MOVE_SPEED,
  PLATFORM_HEIGHT,
  PLATFORM_WIDTH,
  width,
} from "../constants/config";

// --- TYPY I POMOCNICZE FUNKCJE ---

type PlatformData = {
  x: number;
  y: number;
};

const PLATFORM_COUNT = 20;
const MAX_DISTANCE = 90;
const MIN_DISTANCE = 50;

// losowy X w bezpiecznym zakresie
const getRandomPlatformX = () =>
  Math.random() * (width - PLATFORM_WIDTH - 40) + 20;

// czy nowa platforma nachodzi na jakąś inną na podobnej wysokości
const isOverlappingPlatform = (
  newX: number,
  newY: number,
  platforms: PlatformData[]
) => {
  return platforms.some((p) => {
    const closeInY = Math.abs(p.y - newY) < PLATFORM_HEIGHT; // podobna wysokość
    const overlapInX =
      newX < p.x + PLATFORM_WIDTH && newX + PLATFORM_WIDTH > p.x;
    return closeInY && overlapInX;
  });
};

// generowanie początkowych platform – bez nachodzenia
const createInitialPlatforms = (): PlatformData[] => {
  const positions: PlatformData[] = [];
  let currentY = height - 100; // pierwsza platforma przy dole ekranu

  for (let i = 0; i < PLATFORM_COUNT; i++) {
    const y =
      i === 0
        ? currentY
        : (currentY -=
            Math.random() * (MAX_DISTANCE - MIN_DISTANCE) + MIN_DISTANCE);

    let x = getRandomPlatformX();
    let attempts = 0;

    while (attempts < 50 && isOverlappingPlatform(x, y, positions)) {
      x = getRandomPlatformX();
      attempts++;
    }

    positions.push({ x, y });
  }

  return positions;
};

// --- KOMPONENT POJEDYNCZEJ PLATFORMY (z animacją) ---

type PlatformAnimatedProps = {
  index: number;
  platforms: SharedValue<PlatformData[]>;
  cameraOffset: SharedValue<number>;
};

const PlatformAnimated: React.FC<PlatformAnimatedProps> = ({
  index,
  platforms,
  cameraOffset,
}) => {
  const style = useAnimatedStyle(() => {
    const p = platforms.value[index];
    if (!p) {
      return {
        position: "absolute",
        left: 0,
        top: height + 100,
        width: PLATFORM_WIDTH,
        height: PLATFORM_HEIGHT,
      };
    }

    return {
      position: "absolute",
      left: p.x,
      top: p.y + cameraOffset.value,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
    };
  });

  return (
    <Animated.View style={style}>
      <PlatformComponent
        x={0}
        y={0}
        width={PLATFORM_WIDTH}
        height={PLATFORM_HEIGHT}
      />
    </Animated.View>
  );
};

// --- GŁÓWNY EKRAN GRY ---

export const GameScreen: React.FC = () => {
  // pozycja Doodle
  const x = useSharedValue(width / 2 - DOODLE_SIZE / 2);
  const y = useSharedValue(height - 200);
  const velocityY = useSharedValue(0);

  const cameraOffset = useSharedValue(0);
  const platforms = useSharedValue<PlatformData[]>(createInitialPlatforms());

  const [score, setScore] = useState(0);

  const moveDirection = useRef<"left" | "right" | null>(null);
  const started = useRef(false);
  const gameOver = useRef(false);
  const scrollOffset = useRef(0);
  const lastJumpTime = useRef(0);

  // styl Doodle z uwzględnieniem kamery
  const doodleStyle = useAnimatedStyle(() => ({
    left: x.value,
    top: y.value + cameraOffset.value,
    width: DOODLE_SIZE,
    height: DOODLE_SIZE,
    position: "absolute",
  }));

  // tworzy nową platformę na górze (bez nachodzenia)
  const respawnPlatform = (index: number) => {
    const current = platforms.value;
    const highestY = Math.min(...current.map((p) => p.y));
    const verticalDistance = Math.random() * 40 + 60; // 60–100 pikseli
    const newY = highestY - verticalDistance;

    let newX = getRandomPlatformX();
    let attempts = 0;
    while (attempts < 50 && isOverlappingPlatform(newX, newY, current)) {
      newX = getRandomPlatformX();
      attempts++;
    }

    const updated = [...current];
    updated[index] = { x: newX, y: newY };
    platforms.value = updated;
  };

  // główna pętla gry
  useEffect(() => {
    if (gameOver.current) return;

    const interval = setInterval(() => {
      const now = Date.now();

      // sterowanie poziome
      if (moveDirection.current === "left") {
        x.value = Math.max(0, x.value - MOVE_SPEED);
      } else if (moveDirection.current === "right") {
        x.value = Math.min(width - DOODLE_SIZE, x.value + MOVE_SPEED);
      }

      // grawitacja
      velocityY.value += GRAVITY;
      y.value += velocityY.value;

      // kamera (scroll w górę)
      const SCROLL_THRESHOLD = height * 0.5;
      const targetOffset = Math.max(0, SCROLL_THRESHOLD - y.value);
      cameraOffset.value += (targetOffset - cameraOffset.value) * 0.15;

      // przesuwanie i respawn platform
      if (cameraOffset.value > 5) {
        const current = platforms.value;
        const updated = [...current];

        for (let i = 0; i < updated.length; i++) {
          const realY = updated[i].y + cameraOffset.value;

          if (realY > height + PLATFORM_HEIGHT + 100) {
            // ta platforma jest już daleko pod ekranem -> przerzucamy ją na górę
            const highestY = Math.min(...updated.map((p) => p.y));
            const verticalDistance = Math.random() * 40 + 60;
            const newY = highestY - verticalDistance;

            let newX = getRandomPlatformX();
            let attempts = 0;
            while (
              attempts < 50 &&
              isOverlappingPlatform(newX, newY, updated.filter((_, idx) => idx !== i))
            ) {
              newX = getRandomPlatformX();
              attempts++;
            }

            updated[i] = { x: newX, y: newY };
          }
        }

        platforms.value = updated;
        scrollOffset.current = cameraOffset.value;
        setScore(Math.floor(scrollOffset.current / 10));
      }

      // odbijanie od platform – tylko gdy spadamy + mały cooldown
      const MIN_JUMP_INTERVAL = 200;
      const canJumpNow = now - lastJumpTime.current > MIN_JUMP_INTERVAL;

      if (velocityY.value > 0 && canJumpNow) {
        const doodleBottom = y.value + DOODLE_SIZE;
        const current = platforms.value;

        let closestIndex = -1;
        let closestDistance = Number.POSITIVE_INFINITY;

        for (let i = 0; i < current.length; i++) {
          const p = current[i];
          const platformTop = p.y;

          // platforma musi być pod spodem
          if (platformTop < doodleBottom - 5) continue;

          // ODBIJANIE OD CAŁEJ SZEROKOŚCI PLATFORMY (z małym marginesem)
          const isHorizontallyAligned =
            x.value + DOODLE_SIZE > p.x - 5 &&
            x.value < p.x + PLATFORM_WIDTH + 5;

          if (!isHorizontallyAligned) continue;

          const distance = platformTop - doodleBottom;
          if (distance >= 0 && distance < 20 && distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
          }
        }

        if (closestIndex >= 0) {
          const hitPlatform = platforms.value[closestIndex];
          lastJumpTime.current = now;
          y.value = hitPlatform.y - DOODLE_SIZE;
          velocityY.value = -JUMP_HEIGHT;
        }
      }

      // Game Over – wypadnięcie na dół
      if (y.value > height + DOODLE_SIZE) {
        gameOver.current = true;
        clearInterval(interval);
        Alert.alert("Game Over", `Your score: ${score}`, [
          { text: "OK", onPress: () => {} },
        ]);
      }

      // "start" gry, jeśli chcesz coś z tym robić
      if (!started.current && y.value < height - 150) {
        started.current = true;
      }
    }, 16);

    return () => clearInterval(interval);
  }, [score]);

  return (
    <View style={styles.container}>
      <Score y={score} />

      <Animated.View style={doodleStyle}>
        <View style={styles.doodleInner}>
          <Doodle x={0} y={0} size={DOODLE_SIZE} />
        </View>
      </Animated.View>

      {Array.from({ length: PLATFORM_COUNT }).map((_, i) => (
        <PlatformAnimated
          key={i}
          index={i}
          platforms={platforms}
          cameraOffset={cameraOffset}
        />
      ))}

      {/* Sterowanie – lewa/prawa połowa ekranu */}
      <View
        style={styles.leftControl}
        onTouchStart={() => (moveDirection.current = "left")}
        onTouchEnd={() => (moveDirection.current = null)}
      />
      <View
        style={styles.rightControl}
        onTouchStart={() => (moveDirection.current = "right")}
        onTouchEnd={() => (moveDirection.current = null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB",
    position: "relative",
  },
  doodleInner: {
    width: DOODLE_SIZE,
    height: DOODLE_SIZE,
  },
  leftControl: {
    position: "absolute",
    left: 0,
    top: 0,
    width: width / 2,
    height: height,
    backgroundColor: "transparent",
  },
  rightControl: {
    position: "absolute",
    right: 0,
    top: 0,
    width: width / 2,
    height: height,
    backgroundColor: "transparent",
  },
});
