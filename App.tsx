import React, { useState } from "react";
import { View, Dimensions, TouchableWithoutFeedback } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const BALL_RADIUS = 20;
const BALL_COLOR = "#ADD8E6";
const BALL_GRAVITY = 0.5; // пиксели за кадр
const DEFAULT_BOUNCE_VELOCITY = -10;
const PLATFORM_HEIGHT = 10;
const PLATFORM_WIDTH = 100;

const defaultPlatforms = new Array(10).fill(0).map(() => ({
  x: Math.random() * SCREEN_WIDTH,
  y: Math.random() * SCREEN_HEIGHT,
}));

export default function App() {
  const x = useSharedValue(SCREEN_WIDTH / 2);
  const y = useSharedValue(SCREEN_HEIGHT / 2);
  const velocityY = useSharedValue(DEFAULT_BOUNCE_VELOCITY);

  const [platforms] = useState(
    defaultPlatforms.map((p) => ({
      x: useSharedValue(p.x),
      y: useSharedValue(p.y),
    }))
  );

  // Функция обновления позиции шарика и платформ
  const update = () => {
    velocityY.value += BALL_GRAVITY;

    y.value += velocityY.value;

    if (y.value > SCREEN_HEIGHT - BALL_RADIUS) {
      y.value = SCREEN_HEIGHT - BALL_RADIUS;
      velocityY.value = DEFAULT_BOUNCE_VELOCITY;
    }

    platforms.forEach((platform) => {
      // Столкновение с платформой
      if (
        y.value + BALL_RADIUS >= platform.y.value &&
        y.value - BALL_RADIUS <= platform.y.value + PLATFORM_HEIGHT &&
        x.value + BALL_RADIUS > platform.x.value &&
        x.value - BALL_RADIUS < platform.x.value + PLATFORM_WIDTH &&
        velocityY.value > 0
      ) {
        y.value = platform.y.value - BALL_RADIUS;
        velocityY.value = DEFAULT_BOUNCE_VELOCITY;
      }

      // Перемещение платформ, если шар поднимается
      if (velocityY.value < 0 && y.value < SCREEN_HEIGHT / 2) {
        platform.y.value = withTiming(
          platform.y.value + Math.abs(velocityY.value),
          { duration: 16 }
        );
      }

      // Платформа вышла за экран
      if (platform.y.value > SCREEN_HEIGHT) {
        platform.y.value = withTiming(-PLATFORM_HEIGHT, { duration: 16 });
        platform.x.value = Math.random() * SCREEN_WIDTH;
      }
    });
  };

  // Стиль шарика
  const ballStyle = useAnimatedStyle(() => {
    update(); // вызываем каждый рендер
    return {
      position: "absolute",
      left: x.value - BALL_RADIUS,
      top: y.value - BALL_RADIUS,
      width: BALL_RADIUS * 2,
      height: BALL_RADIUS * 2,
      borderRadius: BALL_RADIUS,
      backgroundColor: BALL_COLOR,
    };
  });

  // Стиль платформ
  const platformStyles = platforms.map((platform) =>
    useAnimatedStyle(() => ({
      position: "absolute",
      left: platform.x.value,
      top: platform.y.value,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
      backgroundColor: "#000000",
    }))
  );

  const handleTap = (evt: { nativeEvent: { locationX: number } }) => {
    const tapX = evt.nativeEvent.locationX;
    const speed = 30;
    if (tapX < SCREEN_WIDTH / 2) {
      x.value = withTiming(Math.max(0, x.value - speed), { duration: 50 });
    } else {
      x.value = withTiming(Math.min(SCREEN_WIDTH, x.value + speed), {
        duration: 50,
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={{ flex: 1, backgroundColor: "#87CEEB" }}>
        {platforms.map((_, i) => (
          <Animated.View key={i} style={platformStyles[i]} />
        ))}
        <Animated.View style={ballStyle} />
      </View>
    </TouchableWithoutFeedback>
  );
}
