import { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/useAuthStore";
import { INTEREST_TOPICS } from "@/constants/suggested-questions";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function InterestsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const setInterests = useAuthStore((s) => s.setInterests);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  const toggleTopic = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setInterests(selected);
    try {
      await completeOnboarding();
      router.replace("/(tabs)");
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        <Animated.View
          entering={FadeInUp.duration(600).delay(200)}
          className="px-8 pt-4 pb-6"
        >
          <Text className="text-3xl font-bold text-text-primary mb-3">
            What interests you? ✨
          </Text>
          <Text className="text-base text-text-secondary leading-6">
            Pick topics you'd like to explore in the Quran. You can always change these later.
          </Text>
        </Animated.View>

        <ScrollView
          className="flex-1 px-6"
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
                  className="w-1/2 p-1.5"
                >
                  <Pressable
                    onPress={() => toggleTopic(topic.id)}
                    className={`rounded-2xl p-4 border-2 ${
                      isSelected
                        ? "bg-emerald/15 border-emerald"
                        : "bg-surface border-surface-light"
                    }`}
                  >
                    <Text className="text-2xl mb-2">{topic.icon}</Text>
                    <Text
                      className={`text-sm font-semibold ${
                        isSelected ? "text-emerald-light" : "text-text-primary"
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
        className="px-8 pb-8 pt-4"
      >
        <Pressable
          onPress={handleComplete}
          disabled={isLoading}
          className="bg-emerald rounded-2xl py-4 items-center active:opacity-80"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-bold">
              {selected.length > 0
                ? `Continue (${selected.length} selected)`
                : "Skip for now"}
            </Text>
          )}
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
