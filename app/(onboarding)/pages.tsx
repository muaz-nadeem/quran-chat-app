import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/useAuthStore";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const PAGE_OPTIONS = [1, 2, 3, 5, 10];
const PLAN_OPTIONS: { id: number; label: string; sub: string }[] = [
  { id: 7, label: "7 days", sub: "A focused week" },
  { id: 30, label: "30 days", sub: "A full month" },
];

export default function PagesScreen() {
  const router = useRouter();
  const [pages, setPages] = useState(5);
  const [planDays, setPlanDaysLocal] = useState(7);
  const setPagesPerDay = useAuthStore((s) => s.setPagesPerDay);
  const setPlanDays = useAuthStore((s) => s.setPlanDays);

  const handleContinue = () => {
    setPagesPerDay(pages);
    setPlanDays(planDays);
    router.push("/(onboarding)/notifications");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-7 pt-4">
        <Animated.View entering={FadeInUp.duration(500).delay(100)}>
          <View className="flex-row items-center justify-between mb-2">
            <Text
              className="text-gold text-base"
              style={{ fontFamily: "LibreBaskerville_700Bold" }}
            >
              Quran Chat
            </Text>
            <Pressable onPress={() => router.push("/(onboarding)/notifications")}>
              <Text className="text-text-on-green-muted text-xs font-semibold uppercase tracking-wider">
                Skip
              </Text>
            </Pressable>
          </View>
          <View className="h-1 bg-surface-light rounded-full mb-2 overflow-hidden">
            <View className="h-full w-3/4 bg-gold rounded-full" />
          </View>
          <Text className="text-text-on-green-muted text-xs font-semibold uppercase tracking-wider mb-5">
            Step 3 of 4
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(200)}>
          <Text
            className="text-[26px] text-text-on-green tracking-tight mb-3"
            style={{ fontFamily: "LibreBaskerville_700Bold" }}
          >
            How many pages a day?
          </Text>
          <Text className="text-[15px] text-text-on-green-muted leading-6 mb-6">
            We'll build a plan from the start of the Quran — page 1 onward.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(350)}>
          <Text className="text-text-on-green-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Pages per day
          </Text>
          <View className="flex-row flex-wrap mb-6" style={{ gap: 10 }}>
            {PAGE_OPTIONS.map((n) => {
              const selected = pages === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => setPages(n)}
                  className={`rounded-2xl px-5 py-3.5 border ${
                    selected
                      ? "bg-gold-soft border-gold"
                      : "bg-surface border-surface-light"
                  }`}
                >
                  <Text
                    className={`text-base font-bold ${
                      selected ? "text-gold" : "text-text-primary"
                    }`}
                  >
                    {n}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(450)}>
          <Text className="text-text-on-green-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Plan length
          </Text>
          {PLAN_OPTIONS.map((option) => {
            const selected = planDays === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => setPlanDaysLocal(option.id)}
                className={`flex-row items-center rounded-2xl px-4 py-3.5 mb-2.5 border ${
                  selected
                    ? "bg-gold-soft border-gold"
                    : "bg-surface border-surface-light"
                }`}
              >
                <View className="flex-1">
                  <Text
                    className={`text-[15px] font-semibold ${
                      selected ? "text-gold" : "text-text-primary"
                    }`}
                  >
                    {option.label}
                  </Text>
                  <Text className="text-text-secondary text-xs mt-0.5">
                    {option.sub} · {pages * option.id} pages total
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(700)}
        className="px-7 pb-8 pt-4"
      >
        <Pressable
          onPress={handleContinue}
          className="rounded-full py-4 items-center bg-deep-green"
        >
          <Text className="text-white text-xs font-bold uppercase tracking-[2px]">
            Continue →
          </Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
