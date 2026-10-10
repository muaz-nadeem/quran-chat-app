import { Text, View } from "react-native";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";

interface BadgeProps {
  label: string;
  variant?: "gold" | "emerald" | "muted";
}

export default function Badge({ label, variant = "gold" }: BadgeProps) {
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];

  const styles = {
    gold: { bg: colors.goldSoft, text: colors.gold },
    emerald: { bg: colors.surfaceTint, text: colors.emeraldLight },
    muted: { bg: colors.surfaceLight, text: colors.textSecondary },
  }[variant];

  return (
    <View
      style={{
        backgroundColor: styles.bg,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          color: styles.text,
          fontSize: 11,
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
