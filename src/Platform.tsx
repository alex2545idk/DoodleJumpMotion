// import { SharedValue } from "react-native-reanimated";
// import Animated, { useAnimatedStyle } from "react-native-reanimated";
// import { Rect } from "react-native-svg";

// export type PlatformDefinition = {
//   x: number;
//   y: number;
// };

// export const PLATFORM_HEIGHT = 10;
// export const PLATFORM_WIDTH = 100;

// export const Platform = ({
//   platformDefinition,
// }: {
//   platformDefinition: SharedValue<PlatformDefinition>;
// }) => {
//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       transform: [
//         { translateX: platformDefinition.value.x },
//         { translateY: platformDefinition.value.y },
//       ],
//     } as any;
//   });

//   return (
//     <Animated.View style={animatedStyle}>
//       <Rect width={PLATFORM_WIDTH} height={PLATFORM_HEIGHT} fill="#000000" />
//     </Animated.View>
//   );
// };
