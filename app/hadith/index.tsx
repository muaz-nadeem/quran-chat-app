import { FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import ScreenShell from "@/components/ui/ScreenShell";
import { HADITH_COLLECTIONS } from "@/lib/hadith-api";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";
import { ScrollIcon } from "@/components/icons";

export default function HadithIndexScreen() {
  const router = useRouter();
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];

  return (
    <ScreenShell
      title="Hadith Library"
      subtitle="Authentic prophetic traditions"
      compactHero
    >
      <Text className="text-sm mb-4" style={{ color: colors.textOnGreenMuted }}>
        Browse collections from Sahih Bukhari, Muslim, and more.
      </Text>

      <FlatList
        data={HADITH_COLLECTIONS}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/hadith/${item.id}` as never)}
            className="active:opacity-80 mb-3"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceLight,
              borderWidth: 1,
              borderRadius: 18,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              className="w-12 h-12 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: colors.goldSoft }}
            >
              <ScrollIcon color={colors.gold} size={22} />
            </View>
            <View className="flex-1">
              <Text
                className="font-bold text-base"
                style={{ color: colors.textPrimary }}
              >
                {item.name}
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                {item.count.toLocaleString()} hadith
              </Text>
            </View>
            <Text
              className="text-lg"
              style={{ fontFamily: "Amiri_400Regular", color: colors.emerald }}
            >
              {item.arabicName}
            </Text>
          </Pressable>
        )}
      />
    </ScreenShell>
  );
}
