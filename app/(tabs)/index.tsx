import DailyPlanCard from "@/components/DailyPlanCard";
import DiscoverRow from "@/components/DiscoverRow";
import SpiritualPlanCard from "@/components/SpiritualPlanCard";
import VerseOfTheDay from "@/components/VerseOfTheDay";
import Card from "@/components/ui/Card";
import ScreenShell from "@/components/ui/ScreenShell";
import {
  FlameIcon,
  MoonIcon,
  MosqueIcon,
  BookIcon,
  BookmarkIcon,
  SparkleIcon,
  CheckIcon,
} from "@/components/icons";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { usePlanStore } from "@/stores/usePlanStore";
import { usePrayerLogStore } from "@/stores/usePrayerLogStore";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";
import { getNextPrayer, getEffectivePrayerTimes, NextPrayer } from "@/lib/prayer-api";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const themeMode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[themeMode];
  const displayName = useAuthStore((s) => s.displayName);
  const createConversation = useChatStore((s) => s.createConversation);
  const loadPlan = usePlanStore((s) => s.loadPlan);
  const streak = usePlanStore((s) => s.streak);
  const lastReadPage = usePlanStore((s) => s.lastReadPage);
  const lastReadSurah = usePlanStore((s) => s.lastReadSurah);
  const loadLogs = usePrayerLogStore((s) => s.loadLogs);
  const todayCompletedCount = usePrayerLogStore((s) => s.todayCompletedCount);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);

  useEffect(() => {
    loadPlan();
    loadLogs();
  }, []);

  const loadNextPrayer = useCallback(async () => {
    try {
      const times = await getEffectivePrayerTimes();
      setNextPrayer(getNextPrayer(times));
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNextPrayer();
      loadLogs();
    }, [loadNextPrayer, loadLogs])
  );

  const handleNewChat = (question?: string) => {
    const id = createConversation(question ?? "New conversation");
    if (question) {
      router.push({
        pathname: "/chat/[id]",
        params: { id, initialMessage: question },
      });
    } else {
      router.push({ pathname: "/chat/[id]", params: { id } });
    }
  };

  const formatCountdown = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
  };

  const to12Hour = (time24: string) => {
    const [h, m] = time24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  };

  const prayersDone = todayCompletedCount();

  const heroContent = nextPrayer ? (
    <View
      className="mt-4 rounded-2xl px-4 py-3.5"
      style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
    >
      <Text className="text-white/70 text-xs font-bold uppercase tracking-[1.5px] mb-1">
        Next Prayer
      </Text>
      <View className="flex-row items-center justify-between">
        <View>
          <Text
            className="text-white text-xl"
            style={{ fontFamily: "LibreBaskerville_700Bold" }}
          >
            {nextPrayer.name}
          </Text>
          <Text className="text-white/70 text-xs mt-0.5">
            in {formatCountdown(nextPrayer.countdownMinutes)}
          </Text>
        </View>
        <Text className="text-white text-2xl font-bold">
          {to12Hour(nextPrayer.time)}
        </Text>
      </View>
    </View>
  ) : null;

  const streakBadge =
    streak > 0 ? (
      <View
        className="rounded-full px-3 py-1.5 flex-row items-center"
        style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
      >
        <FlameIcon color={colors.gold} size={16} />
        <Text className="font-bold text-sm ml-1" style={{ color: colors.gold }}>
          {streak}
        </Text>
      </View>
    ) : null;

  return (
    <ScreenShell
      title="Assalamu Alaikum"
      subtitle={displayName || "Friend"}
      rightAction={streakBadge}
      heroContent={heroContent}
    >
      <View className="flex-row items-center mb-4">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: colors.goldSoft }}
        >
          <MoonIcon color={colors.gold} size={20} />
        </View>
        <Text className="text-sm" style={{ color: colors.textOnGreenMuted }}>
          Your daily spiritual companion
        </Text>
      </View>

      <View style={{ marginHorizontal: -24, marginBottom: 16 }}>
        <VerseOfTheDay />
      </View>

      <DiscoverRow />

      <Pressable onPress={() => handleNewChat()} className="mb-4 active:opacity-90">
        <View
          className="rounded-[22px] p-5"
          style={{
            backgroundColor: colors.gold,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.2)",
          }}
        >
          <Text
            className="text-xl mb-2"
            style={{
              fontFamily: "LibreBaskerville_700Bold",
              color: colors.heroStart,
            }}
          >
            Ask the Islamic Guide
          </Text>
          <Text
            className="text-sm leading-5 mb-4"
            style={{ color: "rgba(8, 28, 18, 0.75)" }}
          >
            Get answers rooted in the Quran and authentic Hadith — clear, comprehensive, and easy to understand.
          </Text>
          <View className="flex-row items-center">
            <View
              className="w-9 h-9 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: "rgba(8, 28, 18, 0.15)" }}
            >
              <SparkleIcon color={colors.heroStart} size={18} />
            </View>
            <Text
              className="text-xs font-bold uppercase tracking-[1.5px]"
              style={{ color: colors.heroStart }}
            >
              Start a Conversation
            </Text>
          </View>
        </View>
      </Pressable>

      {nextPrayer && (
        <Card onPress={() => router.push("/(tabs)/prayer")} noMargin>
          <Text className="text-gold text-xs font-bold uppercase tracking-[1.5px] mb-3">
            Prayer Schedule
          </Text>
          <View
            className="flex-row items-center justify-between rounded-2xl px-4 py-3"
            style={{ backgroundColor: colors.surfaceTint }}
          >
            <View className="flex-row items-center">
              <MosqueIcon color={colors.emerald} size={22} />
              <View className="ml-3">
                <Text
                  className="text-base"
                  style={{
                    fontFamily: "LibreBaskerville_700Bold",
                    color: colors.textPrimary,
                  }}
                >
                  {nextPrayer.name}
                </Text>
                <Text className="text-xs" style={{ color: colors.textSecondary }}>
                  in {formatCountdown(nextPrayer.countdownMinutes)}
                </Text>
              </View>
            </View>
            <Text className="text-lg font-bold" style={{ color: colors.emerald }}>
              {to12Hour(nextPrayer.time)}
            </Text>
          </View>
        </Card>
      )}

      <Card onPress={() => router.push("/(tabs)/prayer?tab=track")} noMargin>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: colors.surfaceTint }}
            >
              <MosqueIcon color={colors.emerald} size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-gold text-xs font-bold uppercase tracking-[1.5px] mb-1">
                Prayer Tracker
              </Text>
              <Text
                className="text-base"
                style={{
                  fontFamily: "LibreBaskerville_700Bold",
                  color: colors.textPrimary,
                }}
              >
                Track your prayers
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                Mark each salah as you pray
              </Text>
            </View>
          </View>
          <View
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: colors.surfaceTintGold }}
          >
            <Text className="font-bold text-sm" style={{ color: colors.emerald }}>
              {prayersDone}/5
            </Text>
          </View>
        </View>
      </Card>

      {lastReadPage > 0 && (
        <Card onPress={() => router.push(`/quran/page/${lastReadPage}`)} noMargin>
          <View className="flex-row items-center">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: colors.goldSoft }}
            >
              <BookmarkIcon color={colors.gold} size={22} />
            </View>
            <View className="flex-1">
              <Text className="text-gold text-xs font-bold uppercase tracking-[1.5px] mb-1">
                Resume reading
              </Text>
              <Text
                className="text-base"
                style={{
                  fontFamily: "LibreBaskerville_700Bold",
                  color: colors.textPrimary,
                }}
              >
                Page {lastReadPage}
                {lastReadSurah ? ` · Surah ${lastReadSurah}` : ""}
              </Text>
            </View>
            <Text className="text-lg font-bold" style={{ color: colors.gold }}>
              →
            </Text>
          </View>
        </Card>
      )}

      <View style={{ marginHorizontal: -24 }}>
        <DailyPlanCard />
      </View>

      <SpiritualPlanCard />

      <View className="flex-row mb-4" style={{ gap: 10 }}>
        <Pressable
          onPress={() => router.push("/(tabs)/quran")}
          className="flex-1 active:opacity-70"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.gold,
            borderWidth: 1,
            borderTopWidth: 3,
            borderTopColor: colors.gold,
            borderRadius: 18,
            padding: 16,
          }}
        >
          <View
            className="w-10 h-10 rounded-xl items-center justify-center mb-3"
            style={{ backgroundColor: colors.goldSoft }}
          >
            <BookIcon color={colors.gold} size={20} />
          </View>
          <Text className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
            Read Quran
          </Text>
          <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
            Surah & Para
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(tabs)/prayer")}
          className="flex-1 active:opacity-70"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.gold,
            borderWidth: 1,
            borderTopWidth: 3,
            borderTopColor: colors.gold,
            borderRadius: 18,
            padding: 16,
          }}
        >
          <View
            className="w-10 h-10 rounded-xl items-center justify-center mb-3"
            style={{ backgroundColor: colors.goldSoft }}
          >
            <MosqueIcon color={colors.gold} size={20} />
          </View>
          <Text className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
            Prayer Times
          </Text>
          <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
            Full schedule
          </Text>
        </Pressable>
      </View>

      <Card noMargin>
        <View className="flex-row items-center justify-between mb-4">
          <Text
            className="text-lg"
            style={{
              fontFamily: "LibreBaskerville_700Bold",
              color: colors.textPrimary,
            }}
          >
            Your Streak
          </Text>
          <View className="flex-row items-center">
            <FlameIcon color={colors.gold} size={20} />
            <Text className="font-bold text-xl ml-1" style={{ color: colors.textPrimary }}>
              {streak}
            </Text>
            <Text className="text-sm ml-1" style={{ color: colors.textSecondary }}>
              days
            </Text>
          </View>
        </View>
        <View className="flex-row justify-between">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => {
            const today = new Date().getDay();
            const isToday = i === today;
            const isPast = i < today;
            const isActive = isPast && streak > 0 && i >= today - streak;
            return (
              <View key={i} className="items-center">
                <Text className="text-xs mb-1.5" style={{ color: colors.textSecondary }}>
                  {day}
                </Text>
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isToday
                      ? colors.emerald
                      : isActive
                        ? colors.surfaceTint
                        : colors.surfaceLight,
                  }}
                >
                  {isToday ? (
                    <FlameIcon color="#FFFFFF" size={14} />
                  ) : isActive ? (
                    <CheckIcon color={colors.emerald} size={14} />
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </Card>
    </ScreenShell>
  );
}
