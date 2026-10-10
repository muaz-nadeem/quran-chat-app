import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import { usePlanStore } from "@/stores/usePlanStore";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";

function ProgressRing({
  progress,
  trackColor,
  fillColor,
  labelColor,
}: {
  progress: number;
  trackColor: string;
  fillColor: string;
  labelColor: string;
}) {
  const size = 72;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={fillColor}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text className="font-bold text-sm" style={{ color: labelColor }}>
        {progress}%
      </Text>
    </View>
  );
}

export default function DailyPlanCard() {
  const router = useRouter();
  const themeMode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[themeMode];
  const currentDay = usePlanStore((s) => s.currentDay);
  const completedDays = usePlanStore((s) => s.completedDays);
  const pagesPerDay = usePlanStore((s) => s.pagesPerDay);
  const planDays = usePlanStore((s) => s.planDays);
  const dayAssignments = usePlanStore((s) => s.dayAssignments);
  const todayPagesDone = usePlanStore((s) => s.todayPagesDone);
  const getTodayAssignment = usePlanStore((s) => s.getTodayAssignment);
  const getTodayProgress = usePlanStore((s) => s.getTodayProgress);

  const assignment = getTodayAssignment();
  const { done, total, percent } = getTodayProgress();
  const isCompleted = completedDays.includes(currentDay);

  if (!assignment || dayAssignments.length === 0) return null;

  const startReading = () => {
    let page = assignment.startPage;
    const doneSet = new Set(todayPagesDone);
    for (let p = assignment.startPage; p <= assignment.endPage; p++) {
      if (!doneSet.has(p)) {
        page = p;
        break;
      }
    }
    router.push(`/quran/page/${page}`);
  };

  return (
    <View className="mx-6 mb-5">
      <View
        className="rounded-[22px] p-6 items-center"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.gold,
          borderWidth: 1,
          borderTopWidth: 3,
          borderTopColor: colors.gold,
        }}
      >
        <ProgressRing
          progress={percent}
          trackColor={colors.surfaceLight}
          fillColor={colors.gold}
          labelColor={colors.gold}
        />

        <Text
          className="text-[22px] mt-4 mb-2 text-center"
          style={{
            fontFamily: "LibreBaskerville_700Bold",
            color: colors.gold,
          }}
        >
          Today's Reading
        </Text>

        <Text className="text-sm text-center leading-5 mb-4 px-2" style={{ color: colors.textSecondary }}>
          {isCompleted
            ? `Day ${currentDay} done — ${total} page${total === 1 ? "" : "s"} complete.`
            : `${done} of ${total} pages today · ${pagesPerDay}/day for ${planDays} days`}
        </Text>

        <View className="flex-row mb-5" style={{ gap: 8 }}>
          <View className="bg-gold-soft rounded-full px-3 py-1.5">
            <Text className="text-gold text-xs font-semibold uppercase">
              Pages {assignment.startPage}–{assignment.endPage}
            </Text>
          </View>
          <View className="bg-gold-soft rounded-full px-3 py-1.5">
            <Text className="text-gold text-xs font-semibold uppercase">
              Day {currentDay}
            </Text>
          </View>
        </View>

        {!isCompleted ? (
          <Pressable
            onPress={startReading}
            className="w-full rounded-full py-3.5 items-center active:opacity-80"
            style={{ backgroundColor: colors.emeraldDark }}
          >
            <Text className="text-white text-xs font-bold uppercase tracking-[1.5px]">
              {done > 0 ? "Continue Today's Pages" : "Start Today's Pages"}
            </Text>
          </Pressable>
        ) : (
          <View
            className="w-full rounded-full py-3.5 items-center"
            style={{ backgroundColor: colors.surfaceTint }}
          >
            <Text
              className="text-xs font-bold uppercase tracking-[1.5px]"
              style={{ color: colors.emerald }}
            >
              Day {currentDay} Complete ✓
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
