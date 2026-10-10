import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { enableAllReminders } from "@/lib/notifications";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function NotificationsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnable = async () => {
    if (isLoading) return;
    setIsLoading(true);
    // Navigate immediately after permission — don't wait for scheduling.
    try {
      await enableAllReminders();
    } catch {
      // still continue onboarding
    }
    router.push("/(onboarding)/ready");
  };

  const handleSkip = () => {
    router.push("/(onboarding)/ready");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-7 pt-4">
        <Animated.View entering={FadeInUp.duration(500).delay(100)}>
          <View className="h-1 bg-surface-light rounded-full mb-2 overflow-hidden">
            <View className="h-full w-full bg-gold rounded-full" />
          </View>
          <Text className="text-text-on-green-muted text-xs font-semibold uppercase tracking-wider mb-8">
            Step 4 of 4
          </Text>
        </Animated.View>

        <View className="flex-1 items-center justify-center">
          <Animated.View
            entering={FadeInUp.duration(800).delay(200)}
            className="items-center w-full"
          >
            <View className="w-24 h-24 rounded-full bg-cream border border-surface-light items-center justify-center mb-8">
              <Text className="text-5xl">🔔</Text>
            </View>

            <Text
              className="text-[26px] text-text-on-green text-center mb-4"
              style={{ fontFamily: "LibreBaskerville_700Bold" }}
            >
              Don't let tomorrow{"\n"}start without Allah
            </Text>

            <Text className="text-[15px] text-text-on-green-muted text-center leading-6 mb-8 px-2">
              Get reading nudges morning, midday & evening — plus prayer
              reminders at salah time (adhan or system sound in Settings).
            </Text>

            <View className="w-full bg-surface border border-surface-light rounded-2xl p-5">
              {[
                { icon: "🌅", label: "Morning — start your Quran reading" },
                { icon: "☀️", label: "Midday — half the day reminder" },
                { icon: "🌙", label: "Evening — finish before day ends" },
                { icon: "🕌", label: "Prayer reminders at salah time" },
              ].map((item, i) => (
                <View
                  key={item.label}
                  className={`flex-row items-center ${i < 3 ? "mb-4" : ""}`}
                >
                  <View className="w-9 h-9 rounded-xl bg-cream items-center justify-center mr-3">
                    <Text className="text-base">{item.icon}</Text>
                  </View>
                  <Text className="text-text-primary font-medium text-[15px]">
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>
      </View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(800)}
        className="px-7 pb-8"
      >
        <Pressable
          onPress={handleEnable}
          disabled={isLoading}
          className="rounded-full py-4 items-center active:opacity-80 mb-3 bg-deep-green"
        >
          <Text className="text-white text-xs font-bold uppercase tracking-[2px]">
            Enable Notifications
          </Text>
        </Pressable>
        <Pressable onPress={handleSkip} className="py-3 items-center">
          <Text className="text-text-on-green-muted text-[15px]">Maybe later</Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
