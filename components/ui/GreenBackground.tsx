import { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import IslamicPattern from "./IslamicPattern";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";

interface GreenBackgroundProps {
  children: ReactNode;
  style?: ViewStyle;
}

export default function GreenBackground({ children, style }: GreenBackgroundProps) {
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }, style]}>
      <LinearGradient
        colors={[colors.heroStart, colors.background, colors.heroEnd]}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <IslamicPattern />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
});
