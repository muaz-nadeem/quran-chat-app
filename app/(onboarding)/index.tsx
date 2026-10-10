import { View, Text, Pressable } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useAuthStore } from "@/stores/useAuthStore";
import HeroHeader from "@/components/ui/HeroHeader";
import GreenBackground from "@/components/ui/GreenBackground";
import { BookIcon, SparkleIcon, MosqueIcon } from "@/components/icons";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";

const FEATURES = [
  {
    Icon: BookIcon,
    title: "Read & Listen",
    subtitle: "Full Quran with translation & recitation",
  },
  {
    Icon: SparkleIcon,
    title: "Islamic Guide AI",
    subtitle: "Answers from Quran and authentic Hadith",
  },
  {
    Icon: MosqueIcon,
    title: "Prayer & Daily Plan",
    subtitle: "Never miss a prayer or daily verse",
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (!isLoading && onboardingCompleted) {
      router.replace("/(tabs)");
    }
  }, [isLoading, onboardingCompleted]);

  if (isLoading || onboardingCompleted) return null;

  const handleGetStarted = async () => {
    await continueAsGuest();
    router.push("/(onboarding)/name");
  };

  return (
    <GreenBackground>
    <SafeAreaView className="flex-1" edges={["left", "right", "bottom"]}>
      <HeroHeader
        title="Quran Chat"
        subtitle="Your personal Islamic companion"
        compact
        blend
      />

      <View className="flex-1 justify-center px-7">
        <Animated.View
          entering={FadeInUp.duration(800).delay(200)}
          className="items-center mb-8 pt-6"
        >
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.surfaceTint }}
          >
            <BookIcon color={colors.emerald} size={36} />
          </View>
          <Text className="text-base text-center leading-6 px-4" style={{ color: colors.textOnGreenMuted }}>
            Quran, prayer, hadith & daily growth — all in one beautiful app.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(700).delay(600)}>
          {FEATURES.map((feature, index) => (
            <Animated.View
              key={feature.title}
              entering={FadeInDown.duration(500).delay(700 + index * 120)}
            >
              <View
                className="flex-row items-center rounded-2xl px-4 py-3.5 mb-2.5"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.surfaceLight,
                }}
              >
                <View
                  className="w-11 h-11 rounded-xl items-center justify-center mr-3.5"
                  style={{ backgroundColor: colors.surfaceTint }}
                >
                  <feature.Icon color={colors.emerald} size={22} />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-[15px] mb-0.5" style={{ color: colors.textPrimary }}>
                    {feature.title}
                  </Text>
                  <Text className="text-[13px]" style={{ color: colors.textSecondary }}>
                    {feature.subtitle}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(1200)} className="pb-8 mt-4">
          <Pressable
            onPress={handleGetStarted}
            className="rounded-full py-4 items-center active:opacity-80"
            style={{ backgroundColor: colors.gold }}
          >
            <Text
              className="text-xs font-bold uppercase tracking-[2px]"
              style={{ color: colors.heroStart }}
            >
              Get Started
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
    </GreenBackground>
  );
}
