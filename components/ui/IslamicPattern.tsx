import { View, useWindowDimensions } from "react-native";
import Svg, { Defs, Pattern, Rect, Path, G } from "react-native-svg";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";

interface IslamicPatternProps {
  opacity?: number;
}

export default function IslamicPattern({ opacity }: IslamicPatternProps) {
  const { width, height } = useWindowDimensions();
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];
  const patternOpacity = opacity ?? colors.patternOpacity;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: patternOpacity,
      }}
      pointerEvents="none"
    >
      <Svg width={width} height={height}>
        <Defs>
          <Pattern
            id="islamicGrid"
            x="0"
            y="0"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <G>
              <Path
                d="M24 4 L28 20 L44 24 L28 28 L24 44 L20 28 L4 24 L20 20 Z"
                fill="none"
                stroke={colors.pattern}
                strokeWidth="0.8"
              />
              <Path
                d="M24 12 L30 24 L24 36 L18 24 Z"
                fill="none"
                stroke={colors.pattern}
                strokeWidth="0.5"
              />
              <Rect
                x="22"
                y="22"
                width="4"
                height="4"
                fill="none"
                stroke={colors.pattern}
                strokeWidth="0.5"
              />
            </G>
          </Pattern>
        </Defs>
        <Rect width={width} height={height} fill="url(#islamicGrid)" />
      </Svg>
    </View>
  );
}
