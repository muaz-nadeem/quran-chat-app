import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/useAuthStore";
import { JOURNEY_OPTIONS } from "@/constants/onboarding-options";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function JourneyScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const setJourney = useAuthStore((s) => s.setJourney);

  const handleContinue = () => {
    if (selected) {
      setJourney(selected);
      router.push("/(onboarding)/pages");
    }
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
            <Pressable onPress={() => router.push("/(onboarding)/ready")}>
              <Text className="text-text-on-green-muted text-xs font-semibold uppercase tracking-wider">
                Skip
              </Text>
            </Pressable>
          </View>
          <View className="h-1 bg-surface-light rounded-full mb-2 overflow-hidden">
            <View className="h-full w-2/5 bg-gold rounded-full" />
          </View>
          <Text className="text-text-on-green-muted text-xs font-semibold uppercase tracking-wider mb-5">
            Step 2 of 4
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(200)}>
          <Text
            className="text-[26px] text-text-on-green tracking-tight mb-3"
            style={{ fontFamily: "LibreBaskerville_700Bold" }}
          >
            How long have you been seeking this?
          </Text>
          <Text className="text-[15px] text-text-on-green-muted leading-6 mb-6">
            The longer it's been, the more your journey matters.
          </Text>
        </Animated.View>

        <View>
          {JOURNEY_OPTIONS.map((option, index) => {
            const isSelected = selected === option.id;
            return (
              <Animated.View
                key={option.id}
                entering={FadeInDown.duration(400).delay(350 + index * 80)}
              >
                <Pressable
                  onPress={() => setSelected(option.id)}
                  className={`flex-row items-center rounded-2xl px-4 py-3.5 mb-2.5 border ${
                    isSelected
                      ? "bg-gold-soft border-gold"
                      : "bg-surface border-surface-light"
                  }`}
                >
                  <View className="w-11 h-11 rounded-xl bg-cream items-center justify-center mr-3.5">
                    <Text className="text-lg">{option.icon}</Text>
                  </View>
                  <Text
                    className={`flex-1 text-[15px] font-semibold ${
                      isSelected ? "text-gold" : "text-text-primary"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(800)}
        className="px-7 pb-8 pt-4"
      >
        <Pressable
          onPress={handleContinue}
          disabled={!selected}
          className={`rounded-full py-4 items-center ${selected ? "bg-deep-green" : "bg-surface-light"}`}
        >
          <Text
            className={`text-xs font-bold uppercase tracking-[2px] ${
              selected ? "text-white" : "text-muted"
            }`}
          >
            Continue →
          </Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
