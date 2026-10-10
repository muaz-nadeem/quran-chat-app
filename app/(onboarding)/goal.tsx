import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/useAuthStore";
import { GOALS } from "@/constants/onboarding-options";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function GoalScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const setGoal = useAuthStore((s) => s.setGoal);

  const handleContinue = () => {
    if (selected) {
      setGoal(selected);
      router.push("/(onboarding)/journey");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-7 pt-4">
        <Animated.View entering={FadeInUp.duration(500).delay(100)}>
          <View className="flex-row items-center justify-between mb-3">
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

          <View className="h-[3px] bg-surface-light rounded-full mb-3 overflow-hidden">
            <View className="h-full w-2/5 bg-gold rounded-full" />
          </View>

          <Text className="text-gold text-xs font-bold uppercase tracking-[1.5px] mb-5">
            Step 2 of 5
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(200)}>
          <Text
            className="text-[28px] text-text-on-green tracking-tight mb-3"
            style={{ fontFamily: "LibreBaskerville_700Bold" }}
          >
            What are your goals?
          </Text>
          <Text className="text-[15px] text-text-on-green-muted leading-6 mb-6">
            Select the paths you wish to prioritize. This helps us personalize
            your journey towards peace and spiritual growth.
          </Text>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {GOALS.map((goal, index) => {
            const isSelected = selected === goal.id;
            return (
              <Animated.View
                key={goal.id}
                entering={FadeInDown.duration(400).delay(350 + index * 80)}
              >
                <Pressable
                  onPress={() => setSelected(goal.id)}
                  className={`flex-row items-center rounded-2xl px-4 py-4 mb-3 border ${
                    isSelected
                      ? "bg-gold-soft border-gold"
                      : "bg-surface border-surface-light"
                  }`}
                >
                  <View className="w-11 h-11 rounded-full bg-cream items-center justify-center mr-4">
                    <Text className="text-lg">{goal.icon}</Text>
                  </View>
                  <Text
                    className={`flex-1 text-[16px] font-semibold ${
                      isSelected ? "text-gold" : "text-text-primary"
                    }`}
                  >
                    {goal.label}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}

          <View className="bg-gold-soft rounded-2xl px-5 py-4 mt-2 mb-4">
            <Text
              className="text-text-primary text-[14px] leading-6 italic text-center"
              style={{ fontFamily: "LibreBaskerville_400Regular" }}
            >
              "Verily, in the remembrance of Allah do hearts find rest." (13:28)
            </Text>
          </View>
        </ScrollView>
      </View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(800)}
        className="px-7 pb-8 pt-2"
      >
        <Pressable
          onPress={() => router.back()}
          className="items-center mb-3 py-2"
        >
          <Text className="text-text-on-green-muted text-sm">← Back</Text>
        </Pressable>

        <Pressable
          onPress={handleContinue}
          disabled={!selected}
          className={`rounded-full py-4 items-center ${selected ? "bg-deep-green" : "bg-surface-light"}`}
        >
          <Text
            className={`text-[15px] font-bold ${
              selected ? "text-white" : "text-muted"
            }`}
          >
            Continue
          </Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
