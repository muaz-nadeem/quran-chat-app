import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePlanStore } from "@/stores/usePlanStore";
import { refreshNotifications } from "@/lib/notifications";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function ReadyScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const pagesPerDay = useAuthStore((s) => s.pagesPerDay);
  const planDays = useAuthStore((s) => s.planDays);
  const initPlan = usePlanStore((s) => s.initPlan);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await completeOnboarding();
      initPlan(pagesPerDay, planDays);
      void refreshNotifications();
      router.replace("/(tabs)");
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-7">
        <Animated.View
          entering={FadeInUp.duration(800).delay(200)}
          className="items-center"
        >
          <View className="w-24 h-24 rounded-full bg-cream border border-surface-light items-center justify-center mb-8">
            <Text className="text-5xl">🌟</Text>
          </View>

          <Text
            className="text-[28px] text-text-on-green text-center mb-4"
            style={{ fontFamily: "LibreBaskerville_700Bold" }}
          >
            Your faith grows{"\n"}every day
          </Text>

          <Text className="text-[15px] text-text-on-green-muted text-center leading-6 mb-10 px-2">
            Each day you show up, your connection with the Quran grows stronger.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(600)}
          className="w-full"
        >
          <View className="bg-surface border border-surface-light rounded-2xl p-5 mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                Now
              </Text>
              <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                Week 3
              </Text>
            </View>
            <View className="h-2 bg-surface-light rounded-full overflow-hidden">
              <View className="h-full w-1/3 bg-deep-green rounded-full" />
            </View>
            <Text className="text-text-secondary text-sm text-center mt-3 leading-5">
              Consistent daily time with the Quran — steady growth, real depth
            </Text>
          </View>

          <View className="flex-row justify-between px-1">
            {[
              `${pagesPerDay} page${pagesPerDay === 1 ? "" : "s"}/day`,
              `${planDays} days`,
              "From page 1",
            ].map((label) => (
              <View key={label} className="bg-gold-soft rounded-full px-3.5 py-2">
                <Text className="text-gold text-xs font-semibold">{label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(1000)}
        className="px-7 pb-8"
      >
        <Pressable
          onPress={handleStart}
          disabled={isLoading}
          className="rounded-full py-4 items-center active:opacity-80 bg-deep-green"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-xs font-bold uppercase tracking-[2px]">
              Start My Journey
            </Text>
          )}
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
