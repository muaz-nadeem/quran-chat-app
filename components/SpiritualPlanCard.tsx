import { Text, View } from "react-native";
import { useAuthStore } from "@/stores/useAuthStore";
import { getPlanForGoal } from "@/constants/daily-plans";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";
import Badge from "@/components/ui/Badge";

export default function SpiritualPlanCard() {
  const goal = useAuthStore((s) => s.goal);
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];
  const plan = getPlanForGoal(goal);

  const dayIndex =
    Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    ) % plan.days.length;
  const today = plan.days[dayIndex];

  return (
    <View
      className="mb-4"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.gold,
        borderWidth: 1,
        borderTopWidth: 3,
        borderTopColor: colors.gold,
        borderRadius: 22,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
        elevation: 5,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Badge label={`Day ${today.day}`} variant="gold" />
        <Text className="text-xs" style={{ color: colors.textSecondary }}>
          {plan.name}
        </Text>
      </View>

      <Text
        className="text-lg mb-2"
        style={{
          fontFamily: "LibreBaskerville_700Bold",
          color: colors.gold,
        }}
      >
        {today.title}
      </Text>

      <Text
        className="text-sm leading-5 mb-3"
        style={{ color: colors.textSecondary, fontFamily: "Amiri_400Regular" }}
      >
        {today.verse.text}
      </Text>

      <Text className="text-xs mb-2" style={{ color: colors.muted }}>
        Surah {today.verse.surah}:{today.verse.ayah}
      </Text>

      <Text className="text-sm leading-5 mb-3" style={{ color: colors.textPrimary }}>
        {today.reflection}
      </Text>

      <View
        className="rounded-2xl p-3"
        style={{ backgroundColor: colors.surfaceTint }}
      >
        <Text className="text-xs font-bold uppercase mb-1" style={{ color: colors.gold }}>
          Du&apos;a
        </Text>
        <Text className="text-sm italic" style={{ color: colors.textPrimary }}>
          {today.dua}
        </Text>
      </View>
    </View>
  );
}
