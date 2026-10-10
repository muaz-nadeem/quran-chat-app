import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/useAuthStore";
import { INTEREST_TOPICS } from "@/constants/suggested-questions";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function InterestsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const setInterests = useAuthStore((s) => s.setInterests);

  const toggleTopic = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    setInterests(selected);
    router.push("/(onboarding)/notifications");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        <Animated.View entering={FadeInUp.duration(500).delay(100)} className="px-7 pt-4">
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
            <View className="h-full w-4/5 bg-gold rounded-full" />
          </View>
          <Text className="text-text-on-green-muted text-xs font-semibold uppercase tracking-wider mb-5">
            Step 4 of 5
          </Text>
          <Text
            className="text-[26px] text-text-on-green tracking-tight mb-3"
            style={{ fontFamily: "LibreBaskerville_700Bold" }}
          >
            What interests you?
          </Text>
          <Text className="text-[15px] text-text-on-green-muted leading-6 mb-6">
            Pick topics you'd like to explore in the Quran.
          </Text>
        </Animated.View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row flex-wrap">
            {INTEREST_TOPICS.map((topic, index) => {
              const isSelected = selected.includes(topic.id);
              return (
                <Animated.View
                  key={topic.id}
                  entering={FadeInDown.duration(400).delay(200 + index * 60)}
                  style={{ width: "50%", padding: 6 }}
                >
                  <Pressable
                    onPress={() => toggleTopic(topic.id)}
                    className={`rounded-2xl p-4 border ${
                      isSelected
                        ? "bg-gold-soft border-gold"
                        : "bg-surface border-surface-light"
                    }`}
                  >
                    <View className="w-10 h-10 rounded-xl bg-cream items-center justify-center mb-3">
                      <Text className="text-xl">{topic.icon}</Text>
                    </View>
                    <Text
                      className={`text-sm font-semibold ${
                        isSelected ? "text-gold" : "text-text-primary"
                      }`}
                    >
                      {topic.label}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(800)}
        className="px-7 pb-8 pt-4"
      >
        <Pressable
          onPress={handleComplete}
          className="rounded-full py-4 items-center active:opacity-80 bg-deep-green"
        >
          <Text className="text-white text-xs font-bold uppercase tracking-[2px]">
            {selected.length > 0
              ? `Continue (${selected.length}) →`
              : "Skip for now →"}
          </Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
