import { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import IslamicPattern from "./IslamicPattern";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";

interface HeroHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
  children?: ReactNode;
  compact?: boolean;
  blend?: boolean;
}

export default function HeroHeader({
  title,
  subtitle,
  rightAction,
  children,
  compact = false,
  blend = false,
}: HeroHeaderProps) {
  const insets = useSafeAreaInsets();
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];

  const content = (
    <View style={[styles.content, compact ? styles.compact : styles.full]}>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.textOnGreen }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textOnGreenMuted }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightAction ? <View>{rightAction}</View> : null}
      </View>
      {children}
    </View>
  );

  if (blend) {
    return <View style={{ paddingTop: insets.top }}>{content}</View>;
  }

  return (
    <View style={{ paddingTop: insets.top }}>
      <LinearGradient
        colors={[colors.heroStart, colors.heroEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, compact ? styles.compact : styles.full]}
      >
        <IslamicPattern />
        {content}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: "relative",
    overflow: "hidden",
  },
  full: {
    paddingBottom: 24,
  },
  compact: {
    paddingBottom: 16,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  titleBlock: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontFamily: "LibreBaskerville_700Bold",
    fontSize: 24,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});
