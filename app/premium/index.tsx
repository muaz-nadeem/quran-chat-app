import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import ScreenShell from "@/components/ui/ScreenShell";
import Button from "@/components/ui/Button";
import { CheckIcon } from "@/components/icons";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";

const FREE_FEATURES = [
  "Read the full Quran",
  "Basic prayer times",
  "5 AI questions per day",
  "Prayer tracker",
];

const PREMIUM_FEATURES = [
  "Unlimited AI Islamic Guide",
  "Offline audio recitation",
  "Full Hadith library",
  "Qibla compass",
  "Nearby mosque finder",
  "Ramadan mode",
  "Cloud sync across devices",
  "Ad-free experience",
];

export default function PremiumScreen() {
  const router = useRouter();
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];

  return (
    <ScreenShell
      title="Go Premium"
      subtitle="Unlock the full experience"
      compactHero
    >
      <View
        className="rounded-2xl p-5 mb-5 items-center"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.gold,
        }}
      >
        <Text
          className="text-3xl mb-1"
          style={{
            fontFamily: "LibreBaskerville_700Bold",
            color: colors.gold,
          }}
        >
          $4.99
        </Text>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          per month · cancel anytime
        </Text>
      </View>

      <View className="flex-row mb-5" style={{ gap: 12 }}>
        <View
          className="flex-1 rounded-2xl p-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.surfaceLight,
            borderWidth: 1,
          }}
        >
          <Text className="font-bold mb-3" style={{ color: colors.textPrimary }}>
            Free
          </Text>
          {FREE_FEATURES.map((f) => (
            <View key={f} className="flex-row items-center mb-2">
              <CheckIcon color={colors.muted} size={14} />
              <Text className="text-xs ml-2 flex-1" style={{ color: colors.textSecondary }}>
                {f}
              </Text>
            </View>
          ))}
        </View>

        <View
          className="flex-1 rounded-2xl p-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.gold,
            borderWidth: 2,
          }}
        >
          <Text className="font-bold mb-3" style={{ color: colors.gold }}>
            Premium
          </Text>
          {PREMIUM_FEATURES.map((f) => (
            <View key={f} className="flex-row items-center mb-2">
              <CheckIcon color={colors.gold} size={14} />
              <Text className="text-xs ml-2 flex-1" style={{ color: colors.textPrimary }}>
                {f}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Button
        label="Start Premium — Coming Soon"
        onPress={() => {}}
        disabled
        style={{ marginBottom: 12 }}
      />

      <Pressable onPress={() => router.back()} className="items-center py-3">
        <Text style={{ color: colors.textOnGreenMuted }}>Maybe later</Text>
      </Pressable>

      <Text
        className="text-xs text-center mt-4 leading-5"
        style={{ color: colors.textOnGreenMuted }}
      >
        Subscriptions will be available when the app launches on the App Store and
        Google Play. This is a preview of planned premium features.
      </Text>
    </ScreenShell>
  );
}
