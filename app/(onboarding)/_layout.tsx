import { Stack } from "expo-router";
import { useThemeStore, THEME_COLORS } from "@/stores/useThemeStore";

export default function OnboardingLayout() {
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    />
  );
}
