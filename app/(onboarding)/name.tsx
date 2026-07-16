import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/useAuthStore";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function NameScreen() {
  const router = useRouter();
  const displayName = useAuthStore((s) => s.displayName);
  const setDisplayName = useAuthStore((s) => s.setDisplayName);

  const canContinue = displayName.trim().length >= 2;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-8 justify-center">
          <Animated.View entering={FadeInUp.duration(600).delay(200)}>
            <Text className="text-3xl font-bold text-text-primary mb-3">
              Assalamu Alaikum! 👋
            </Text>
            <Text className="text-lg text-text-secondary mb-10 leading-7">
              What should we call you?
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(400)}>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
              placeholderTextColor="#98A29A"
              autoFocus
              className="bg-surface text-text-primary text-lg rounded-2xl px-6 py-5 mb-4 border border-surface-light"
              selectionColor="#10B981"
            />
            <Text className="text-text-secondary text-sm ml-2">
              This helps us personalize your experience
            </Text>
          </Animated.View>
        </View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(600)}
          className="px-8 pb-8"
        >
          <Pressable
            onPress={() => canContinue && router.push("/(onboarding)/interests")}
            className={`rounded-2xl py-4 items-center ${
              canContinue ? "bg-emerald active:opacity-80" : "bg-surface-light"
            }`}
            disabled={!canContinue}
          >
            <Text
              className={`text-lg font-bold ${
                canContinue ? "text-white" : "text-muted"
              }`}
            >
              Continue
            </Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
