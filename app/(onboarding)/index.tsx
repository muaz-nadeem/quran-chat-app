import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";

export default function WelcomeScreen() {
  const router = useRouter();
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);
  const clearAllConversations = useChatStore((s) => s.clearAllConversations);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const handleGuest = async () => {
    setIsGuestLoading(true);
    await continueAsGuest();
    await clearAllConversations();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-8">
        <Animated.View
          entering={FadeInUp.duration(800).delay(200)}
          className="items-center mb-12"
        >
          <View className="w-28 h-28 rounded-full bg-emerald/20 items-center justify-center mb-8">
            <Text className="text-6xl">📖</Text>
          </View>

          <Text className="text-4xl font-bold text-text-primary text-center mb-4">
            Quran Chat
          </Text>

          <Text className="text-lg text-text-secondary text-center leading-7">
            Ask anything about the Quran{"\n"}and get answers that make sense
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(800).delay(600)}
          className="w-full space-y-4"
        >
          <View className="flex-row items-center bg-surface border border-surface-light rounded-2xl p-4 mb-3">
            <View className="w-10 h-10 rounded-full bg-emerald/20 items-center justify-center mr-4">
              <Text className="text-lg">💬</Text>
            </View>
            <View className="flex-1">
              <Text className="text-text-primary font-semibold text-base">
                AI-Powered Answers
              </Text>
              <Text className="text-text-secondary text-sm">
                Get clear, referenced responses
              </Text>
            </View>
          </View>

          <View className="flex-row items-center bg-surface border border-surface-light rounded-2xl p-4 mb-3">
            <View className="w-10 h-10 rounded-full bg-gold/20 items-center justify-center mr-4">
              <Text className="text-lg">📜</Text>
            </View>
            <View className="flex-1">
              <Text className="text-text-primary font-semibold text-base">
                Quranic References
              </Text>
              <Text className="text-text-secondary text-sm">
                Every answer cites Surah & Ayah
              </Text>
            </View>
          </View>

          <View className="flex-row items-center bg-surface border border-surface-light rounded-2xl p-4 mb-3">
            <View className="w-10 h-10 rounded-full bg-emerald/20 items-center justify-center mr-4">
              <Text className="text-lg">🌙</Text>
            </View>
            <View className="flex-1">
              <Text className="text-text-primary font-semibold text-base">
                Daily Verse
              </Text>
              <Text className="text-text-secondary text-sm">
                Start each day with the Quran
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(1000)}
        className="px-8 pb-8"
      >
        <Pressable
          onPress={() => router.push("/(onboarding)/auth")}
          className="bg-emerald rounded-2xl py-4 items-center active:opacity-80 mb-3"
        >
          <Text className="text-white text-lg font-bold">Create Account</Text>
        </Pressable>

        <Pressable
          onPress={handleGuest}
          disabled={isGuestLoading}
          className="bg-surface border border-surface-light rounded-2xl py-4 items-center active:opacity-80 mb-4"
        >
          {isGuestLoading ? (
            <ActivityIndicator color="#10B981" />
          ) : (
            <Text className="text-text-primary text-lg font-bold">
              Continue as Guest
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/(onboarding)/auth",
              params: { mode: "signin" },
            })
          }
          className="items-center active:opacity-70"
        >
          <Text className="text-text-secondary text-sm">
            Already have an account?{" "}
            <Text className="text-emerald font-semibold">Sign In</Text>
          </Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
