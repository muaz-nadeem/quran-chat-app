import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/useAuthStore";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

function EyeIcon({ visible, color }: { visible: boolean; color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {!visible && (
        <Path
          d="M4 4L20 20"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
}

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const signUp = useAuthStore((s) => s.signUp);
  const signIn = useAuthStore((s) => s.signIn);

  const [isSignIn, setIsSignIn] = useState(params.mode === "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = email.trim().includes("@") && password.length >= 6;

  const handleSubmit = async () => {
    if (!canSubmit || isLoading) return;
    setError("");
    setInfo("");
    setIsLoading(true);

    if (isSignIn) {
      const result = await signIn(email.trim(), password);
      setIsLoading(false);
      if (result.error) {
        setError(result.error);
      } else {
        router.replace("/(tabs)");
      }
    } else {
      const result = await signUp(email.trim(), password);
      setIsLoading(false);
      if (result.error) {
        setError(result.error);
      } else if (result.needsConfirmation) {
        setInfo(
          "Check your email to confirm your account, then come back and sign in."
        );
        setIsSignIn(true);
      } else {
        router.push("/(onboarding)/name");
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-8 justify-center">
          <Animated.View entering={FadeInUp.duration(600).delay(100)}>
            <Text className="text-3xl font-bold text-text-primary mb-3">
              {isSignIn ? "Welcome back 🌙" : "Create your account"}
            </Text>
            <Text className="text-base text-text-secondary mb-10 leading-6">
              {isSignIn
                ? "Sign in to pick up where you left off."
                : "Your conversations will be saved and available every time you return."}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(300)}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#98A29A"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              className="bg-surface text-text-primary text-base rounded-2xl px-6 py-5 mb-3 border border-surface-light"
              selectionColor="#10B981"
            />
            <View className="flex-row items-center bg-surface rounded-2xl border border-surface-light mb-2">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#98A29A"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                className="flex-1 text-text-primary text-base px-6 py-5"
                selectionColor="#10B981"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="px-4 py-5 active:opacity-50"
                hitSlop={8}
              >
                <EyeIcon visible={showPassword} color="#68736C" />
              </Pressable>
            </View>
            {!isSignIn && (
              <Text
                className={`text-xs ml-2 mb-2 ${
                  password.length === 0
                    ? "text-text-secondary"
                    : password.length >= 6
                      ? "text-emerald-light"
                      : "text-text-secondary"
                }`}
              >
                {password.length >= 6
                  ? "✓ Password meets the requirement"
                  : "Password must be at least 6 characters long"}
              </Text>
            )}

            {error ? (
              <Text className="text-danger text-sm ml-2 mb-2">{error}</Text>
            ) : null}
            {info ? (
              <Text className="text-gold text-sm ml-2 mb-2">{info}</Text>
            ) : null}

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit || isLoading}
              className={`rounded-2xl py-4 items-center mt-2 ${
                canSubmit ? "bg-emerald active:opacity-80" : "bg-surface-light"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  className={`text-lg font-bold ${
                    canSubmit ? "text-white" : "text-muted"
                  }`}
                >
                  {isSignIn ? "Sign In" : "Sign Up"}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setIsSignIn(!isSignIn);
                setError("");
                setInfo("");
              }}
              className="items-center mt-6 active:opacity-70"
            >
              <Text className="text-text-secondary text-sm">
                {isSignIn ? (
                  <>
                    Don't have an account?{" "}
                    <Text className="text-emerald font-semibold">Sign Up</Text>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <Text className="text-emerald font-semibold">Sign In</Text>
                  </>
                )}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
