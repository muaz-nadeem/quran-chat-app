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
        <View className="flex-1 px-7 justify-center">
          <Animated.View entering={FadeInUp.duration(600).delay(200)}>
            <Text className="text-text-on-green-muted text-xs font-semibold tracking-wider uppercase mb-4">
              Let's get to know you
            </Text>
            <Text
              className="text-[28px] text-text-on-green tracking-tight mb-3"
              style={{ fontFamily: "LibreBaskerville_700Bold" }}
            >
              Assalamu Alaikum
            </Text>
            <Text className="text-base text-text-on-green-muted mb-10 leading-6">
              What should we call you?
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(400)}>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
              placeholderTextColor="#9CA39A"
              autoFocus
              className="bg-surface text-text-primary text-lg rounded-2xl px-5 py-4 mb-3 border border-surface-light"
              selectionColor="#74C69D"
            />
            <Text className="text-text-on-green-muted text-sm ml-1">
              This helps us personalize your experience
            </Text>
          </Animated.View>
        </View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(600)}
          className="px-7 pb-8"
        >
          <Pressable
            onPress={() => canContinue && router.push("/(onboarding)/journey")}
            disabled={!canContinue}
            className={`rounded-full py-4 items-center ${canContinue ? "bg-deep-green" : "bg-surface-light"}`}
          >
            <Text
              className={`text-xs font-bold uppercase tracking-[2px] ${
                canContinue ? "text-white" : "text-muted"
              }`}
            >
              Continue →
            </Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
