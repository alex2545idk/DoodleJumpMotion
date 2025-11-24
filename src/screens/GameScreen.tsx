import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
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
import { usePose } from "../contexts/PoseContext";

interface PlatformType {
  x: SharedValue<number>;
  y: SharedValue<number>;
}

export const GameScreen = () => {
  const PLATFORM_COUNT = 20;

  const x = useSharedValue(width / 2 - DOODLE_SIZE / 2);
  const y = useSharedValue(height - 200);
  const velocityY = useSharedValue(0);

  const [score, setScore] = useState(0);
  const moveDirection = useRef<"left" | "right" | null>(null);
  const started = useRef(false);
  const gameOver = useRef(false);
  const lastPlatformHit = useRef<number | null>(null);
  const scrollOffset = useRef(0);
  const lastJumpTime = useRef(0);
  const cameraOffset = useSharedValue(0);

  const { torsoCoords, isJumping } = usePose();

  // Добавляем состояние для отслеживания нажатых клавиш
  const [keysPressed, setKeysPressed] = useState({
    ArrowLeft: false,
    ArrowRight: false,
  });

  // Обработчики клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        setKeysPressed((prev) => ({ ...prev, [e.key]: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        setKeysPressed((prev) => ({ ...prev, [e.key]: false }));
      }
    };

    // Добавляем обработчики событий
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Очистка при размонтировании
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Обновляем направление движения на основе состояния клавиш
  useEffect(() => {
    if (keysPressed.ArrowLeft && !keysPressed.ArrowRight) {
      moveDirection.current = "left";
    } else if (keysPressed.ArrowRight && !keysPressed.ArrowLeft) {
      moveDirection.current = "right";
    } else {
      moveDirection.current = null;
    }
  }, [keysPressed]);

  // Управление через камеру - определение направления движения
  useEffect(() => {
    const centerX = 0.5; // Центр экрана по X
    const deadZone = 0.1; // Мертвая зона в центре

    if (torsoCoords.x < centerX - deadZone) {
      moveDirection.current = "left";
    } else if (torsoCoords.x > centerX + deadZone) {
      moveDirection.current = "right";
    } else {
      moveDirection.current = null;
    }
  }, [torsoCoords.x]);

  // Обработка прыжка через камеру
  useEffect(() => {
    if (isJumping && !gameOver.current) {
      const currentTime = Date.now();
      const MIN_JUMP_INTERVAL = 300;

      if (currentTime - lastJumpTime.current > MIN_JUMP_INTERVAL) {
        // Высота прыжка зависит от того, насколько высоко поднялся торс
        const jumpStrength = Math.min(1.5, 1 + (0.5 - torsoCoords.y) * 3);
        velocityY.value = -JUMP_HEIGHT * jumpStrength;
        lastJumpTime.current = currentTime;
      }
    }
  }, [isJumping, torsoCoords.y]);

  useEffect(() => {
    const centerX = 0.5;
    const deadZone = 0.1;

    // Приоритет у камеры, если она активна
    if (torsoCoords.x !== 0 || torsoCoords.y !== 0) {
      // Камерное управление
      if (torsoCoords.x < centerX - deadZone) {
        moveDirection.current = "left";
      } else if (torsoCoords.x > centerX + deadZone) {
        moveDirection.current = "right";
      } else {
        // Если камера в мертвой зоне, проверяем клавиатуру
        if (keysPressed.ArrowLeft && !keysPressed.ArrowRight) {
          moveDirection.current = "left";
        } else if (keysPressed.ArrowRight && !keysPressed.ArrowLeft) {
          moveDirection.current = "right";
        } else {
          moveDirection.current = null;
        }
      }
    } else {
      // Если камера неактивна, используем только клавиатуру
      if (keysPressed.ArrowLeft && !keysPressed.ArrowRight) {
        moveDirection.current = "left";
      } else if (keysPressed.ArrowRight && !keysPressed.ArrowLeft) {
        moveDirection.current = "right";
      } else {
        moveDirection.current = null;
      }
    }
  }, [torsoCoords.x, torsoCoords.y, keysPressed]);

  const platformPositions = useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    const MAX_DISTANCE = 90;
    const MIN_DISTANCE = 50;

    const startPlatformY = height - 100;
    const startPlatformX = width / 2 - PLATFORM_WIDTH / 2;

    positions.push({
      x: startPlatformX,
      y: startPlatformY,
    });

    let currentY =
      startPlatformY -
      (Math.random() * (MAX_DISTANCE - MIN_DISTANCE) + MIN_DISTANCE);

    for (let i = 1; i < PLATFORM_COUNT; i++) {
      const platformX = Math.random() * (width - PLATFORM_WIDTH - 40) + 20;

      positions.push({
        x: platformX,
        y: currentY,
      });

      currentY -= Math.random() * (MAX_DISTANCE - MIN_DISTANCE) + MIN_DISTANCE;
    }

    return positions;
  }, []);

  // Создаем shared values для всех 20 платформ
  const platform0X = useSharedValue(platformPositions[0].x);
  const platform0Y = useSharedValue(platformPositions[0].y);
  const platform1X = useSharedValue(platformPositions[1].x);
  const platform1Y = useSharedValue(platformPositions[1].y);
  const platform2X = useSharedValue(platformPositions[2].x);
  const platform2Y = useSharedValue(platformPositions[2].y);
  const platform3X = useSharedValue(platformPositions[3].x);
  const platform3Y = useSharedValue(platformPositions[3].y);
  const platform4X = useSharedValue(platformPositions[4].x);
  const platform4Y = useSharedValue(platformPositions[4].y);
  const platform5X = useSharedValue(platformPositions[5].x);
  const platform5Y = useSharedValue(platformPositions[5].y);
  const platform6X = useSharedValue(platformPositions[6].x);
  const platform6Y = useSharedValue(platformPositions[6].y);
  const platform7X = useSharedValue(platformPositions[7].x);
  const platform7Y = useSharedValue(platformPositions[7].y);
  const platform8X = useSharedValue(platformPositions[8].x);
  const platform8Y = useSharedValue(platformPositions[8].y);
  const platform9X = useSharedValue(platformPositions[9].x);
  const platform9Y = useSharedValue(platformPositions[9].y);
  const platform10X = useSharedValue(platformPositions[10].x);
  const platform10Y = useSharedValue(platformPositions[10].y);
  const platform11X = useSharedValue(platformPositions[11].x);
  const platform11Y = useSharedValue(platformPositions[11].y);
  const platform12X = useSharedValue(platformPositions[12].x);
  const platform12Y = useSharedValue(platformPositions[12].y);
  const platform13X = useSharedValue(platformPositions[13].x);
  const platform13Y = useSharedValue(platformPositions[13].y);
  const platform14X = useSharedValue(platformPositions[14].x);
  const platform14Y = useSharedValue(platformPositions[14].y);
  const platform15X = useSharedValue(platformPositions[15].x);
  const platform15Y = useSharedValue(platformPositions[15].y);
  const platform16X = useSharedValue(platformPositions[16].x);
  const platform16Y = useSharedValue(platformPositions[16].y);
  const platform17X = useSharedValue(platformPositions[17].x);
  const platform17Y = useSharedValue(platformPositions[17].y);
  const platform18X = useSharedValue(platformPositions[18].x);
  const platform18Y = useSharedValue(platformPositions[18].y);
  const platform19X = useSharedValue(platformPositions[19].x);
  const platform19Y = useSharedValue(platformPositions[19].y);

  const platforms = useMemo<PlatformType[]>(
    () => [
      { x: platform0X, y: platform0Y },
      { x: platform1X, y: platform1Y },
      { x: platform2X, y: platform2Y },
      { x: platform3X, y: platform3Y },
      { x: platform4X, y: platform4Y },
      { x: platform5X, y: platform5Y },
      { x: platform6X, y: platform6Y },
      { x: platform7X, y: platform7Y },
      { x: platform8X, y: platform8Y },
      { x: platform9X, y: platform9Y },
      { x: platform10X, y: platform10Y },
      { x: platform11X, y: platform11Y },
      { x: platform12X, y: platform12Y },
      { x: platform13X, y: platform13Y },
      { x: platform14X, y: platform14Y },
      { x: platform15X, y: platform15Y },
      { x: platform16X, y: platform16Y },
      { x: platform17X, y: platform17Y },
      { x: platform18X, y: platform18Y },
      { x: platform19X, y: platform19Y },
    ],
    [
      platform0X,
      platform0Y,
      platform1X,
      platform1Y,
      platform2X,
      platform2Y,
      platform3X,
      platform3Y,
      platform4X,
      platform4Y,
      platform5X,
      platform5Y,
      platform6X,
      platform6Y,
      platform7X,
      platform7Y,
      platform8X,
      platform8Y,
      platform9X,
      platform9Y,
      platform10X,
      platform10Y,
      platform11X,
      platform11Y,
      platform12X,
      platform12Y,
      platform13X,
      platform13Y,
      platform14X,
      platform14Y,
      platform15X,
      platform15Y,
      platform16X,
      platform16Y,
      platform17X,
      platform17Y,
      platform18X,
      platform18Y,
      platform19X,
      platform19Y,
    ]
  );

  const doodleStyle = useAnimatedStyle(() => ({
    left: x.value,
    top: y.value + cameraOffset.value,
    width: DOODLE_SIZE,
    height: DOODLE_SIZE,
    position: "absolute",
  }));

  const platformStyles = platforms.map((p) =>
    useAnimatedStyle(() => ({
      left: p.x.value,
      top: p.y.value + cameraOffset.value,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
      position: "absolute",
    }))
  );

  const createNewPlatform = (platform: PlatformType) => {
    const highestY = Math.min(...platforms.map((p) => p.y.value));

    const verticalDistance = Math.random() * 40 + 60;
    const newY = highestY - verticalDistance;

    const newX = Math.random() * (width - PLATFORM_WIDTH - 60) + 30;

    platform.y.value = newY;
    platform.x.value = newX;
  };

  // useEffect(() => {
  //   if (gameOver.current) return;

  //   const interval = setInterval(() => {
  //     const currentTime = Date.now();

  //     // Управление теперь работает и для касаний, и для клавиатуры
  //     if (moveDirection.current === "left") {
  //       x.value = Math.max(0, x.value - MOVE_SPEED);
  //     } else if (moveDirection.current === "right") {
  //       x.value = Math.min(width - DOODLE_SIZE, x.value + MOVE_SPEED);
  //     }

  //     velocityY.value += GRAVITY;
  //     y.value += velocityY.value;

  //     const SCROLL_THRESHOLD = height * 0.5;
  //     const targetOffset = Math.max(0, SCROLL_THRESHOLD - y.value);

  //     cameraOffset.value += (targetOffset - cameraOffset.value) * 0.15;

  //     if (cameraOffset.value > 5) {
  //       platforms.forEach((p) => {
  //         const realY = p.y.value + cameraOffset.value;

  //         if (realY > height + PLATFORM_HEIGHT + 100) {
  //           createNewPlatform(p);
  //           p.y.value -= cameraOffset.value;
  //         }
  //       });

  //       scrollOffset.current = cameraOffset.value;
  //       setScore(Math.floor(scrollOffset.current / 10));
  //     }

  //     const MIN_JUMP_INTERVAL = 200;
  //     const canJumpNow = currentTime - lastJumpTime.current > MIN_JUMP_INTERVAL;

  //     if (velocityY.value > 0 && canJumpNow) {
  //       const doodleBottom = y.value + DOODLE_SIZE;

  //       let closestPlatformIndex: number = -1;
  //       let closestDistance: number = 999;

  //       platforms.forEach((p, index) => {
  //         const platformTop = p.y.value;

  //         if (platformTop < doodleBottom - 5) return;

  //         const isHorizontallyAligned =
  //           x.value + DOODLE_SIZE > p.x.value + 15 &&
  //           x.value < p.x.value + PLATFORM_WIDTH - 15;

  //         if (!isHorizontallyAligned) return;

  //         const distance = platformTop - doodleBottom;

  //         if (distance >= 0 && distance < 20 && distance < closestDistance) {
  //           closestPlatformIndex = index;
  //           closestDistance = distance;
  //         }
  //       });

  //       if (closestPlatformIndex >= 0) {
  //         const closestPlatform = platforms[closestPlatformIndex];
  //         lastJumpTime.current = currentTime;
  //         lastPlatformHit.current = closestPlatformIndex;
  //         y.value = closestPlatform.y.value - DOODLE_SIZE;
  //         velocityY.value = -JUMP_HEIGHT;
  //       }
  //     }

  //     if (velocityY.value < -5) {
  //       lastPlatformHit.current = null;
  //     }

  //     if (y.value > height + DOODLE_SIZE) {
  //       gameOver.current = true;
  //       clearInterval(interval);
  //       Alert.alert("Game Over", `Your score: ${score}`, [
  //         {
  //           text: "OK",
  //           onPress: () => {},
  //         },
  //       ]);
  //     }

  //     if (!started.current && y.value < height - 150) {
  //       started.current = true;
  //     }
  //   }, 16);

  //   return () => clearInterval(interval);
  // }, [platforms, score]);

  useEffect(() => {
    if (gameOver.current) return;

    const interval = setInterval(() => {
      // === СОХРАНЕНО: Управление движением ===
      if (moveDirection.current === "left") {
        x.value = Math.max(0, x.value - MOVE_SPEED);
      } else if (moveDirection.current === "right") {
        x.value = Math.min(width - DOODLE_SIZE, x.value + MOVE_SPEED);
      }

      // === СОХРАНЕНО: Физика ===
      velocityY.value += GRAVITY;
      y.value += velocityY.value;

      // === СОХРАНЕНО: Логика камеры ===
      const SCROLL_THRESHOLD = height * 0.5;
      const targetOffset = Math.max(0, SCROLL_THRESHOLD - y.value);
      cameraOffset.value += (targetOffset - cameraOffset.value) * 0.15;

      // === СОХРАНЕНО: Генерация платформ ===
      if (cameraOffset.value > 5) {
        platforms.forEach((p) => {
          const realY = p.y.value + cameraOffset.value;
          if (realY > height + PLATFORM_HEIGHT + 100) {
            createNewPlatform(p);
            p.y.value -= cameraOffset.value;
          }
        });
        scrollOffset.current = cameraOffset.value;
        setScore(Math.floor(scrollOffset.current / 10));
      }

      // === ИЗМЕНЕНО: Логика прыжков (только приземление) ===
      if (velocityY.value > 0) {
        const doodleBottom = y.value + DOODLE_SIZE;
        let closestPlatformIndex: number = -1;
        let closestDistance: number = 999;

        platforms.forEach((p, index) => {
          const platformTop = p.y.value;
          if (platformTop < doodleBottom - 5) return;

          const isHorizontallyAligned =
            x.value + DOODLE_SIZE > p.x.value + 15 &&
            x.value < p.x.value + PLATFORM_WIDTH - 15;

          if (!isHorizontallyAligned) return;

          const distance = platformTop - doodleBottom;
          if (distance >= 0 && distance < 20 && distance < closestDistance) {
            closestPlatformIndex = index;
            closestDistance = distance;
          }
        });

        if (closestPlatformIndex >= 0) {
          const closestPlatform = platforms[closestPlatformIndex];
          lastPlatformHit.current = closestPlatformIndex;
          y.value = closestPlatform.y.value - DOODLE_SIZE;
          velocityY.value = -JUMP_HEIGHT * 0.8; // Меньший отскок
        }
      }

      // === СОХРАНЕНО: Game Over проверка ===
      if (y.value > height + DOODLE_SIZE) {
        gameOver.current = true;
        clearInterval(interval);
        Alert.alert("Game Over", `Your score: ${score}`, [
          {
            text: "OK",
            onPress: () => {},
          },
        ]);
      }

      if (!started.current && y.value < height - 150) {
        started.current = true;
      }
    }, 16);

    return () => clearInterval(interval);
  }, [platforms, score]);

  return (
    <View style={styles.container}>
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          Camera: X: {torsoCoords.x.toFixed(2)} Y: {torsoCoords.y.toFixed(2)}
        </Text>
        <Text style={styles.debugText}>
          Direction: {moveDirection.current || "null"}
        </Text>
        <Text style={styles.debugText}>
          Jumping: {isJumping ? "YES" : "NO"}
        </Text>
      </View>
      <Score y={score} />

      <Animated.View style={doodleStyle}>
        <View style={styles.doodleInner}>
          <Doodle x={0} y={0} size={DOODLE_SIZE} />
        </View>
      </Animated.View>

      {platforms.map((_, i) => (
        <Animated.View key={i} style={platformStyles[i]}>
          <PlatformComponent
            x={0}
            y={0}
            width={PLATFORM_WIDTH}
            height={PLATFORM_HEIGHT}
          />
        </Animated.View>
      ))}

      {/* Управление касаниями остается для мобильных устройств */}
      <View
        style={styles.leftControl}
        onTouchStart={() => (moveDirection.current = "left")}
        onTouchEnd={() => {
          // Сбрасываем только если не нажата клавиша
          if (!keysPressed.ArrowLeft) {
            moveDirection.current = null;
          }
        }}
      />
      <View
        style={styles.rightControl}
        onTouchStart={() => (moveDirection.current = "right")}
        onTouchEnd={() => {
          // Сбрасываем только если не нажата клавиша
          if (!keysPressed.ArrowRight) {
            moveDirection.current = null;
          }
        }}
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
  debugInfo: {
    position: "absolute",
    top: 50,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  debugText: {
    color: "white",
    fontSize: 12,
    fontFamily: "monospace",
  },
});
