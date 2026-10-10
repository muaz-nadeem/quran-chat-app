import { getRandomVerse, VerseWithTranslation } from "@/lib/quran-api";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export default function VerseOfTheDay() {
  const router = useRouter();
  const themeMode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[themeMode];
  const [verse, setVerse] = useState<VerseWithTranslation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVerse();
  }, []);

  async function loadVerse() {
    try {
      const today = new Date().toISOString().split("T")[0];
      const cached = await AsyncStorage.getItem(`verse_${today}`);

      if (cached) {
        setVerse(JSON.parse(cached));
        setLoading(false);
        return;
      }

      const newVerse = await getRandomVerse();
      await AsyncStorage.setItem(`verse_${today}`, JSON.stringify(newVerse));
      setVerse(newVerse);
    } catch {
      setVerse({
        arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        translation:
          "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        surahNumber: 1,
        ayahNumber: 1,
        surahName: "الفاتحة",
        surahEnglishName: "Al-Faatiha",
      });
    } finally {
      setLoading(false);
    }
  }

  const cardStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.gold,
    borderWidth: 1,
    borderTopWidth: 3,
    borderTopColor: colors.gold,
    borderRadius: 22,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 5,
  };

  if (loading) {
    return (
      <View className="mx-6 mb-5" style={cardStyle}>
        <View className="items-center py-6">
          <ActivityIndicator color={colors.gold} />
        </View>
      </View>
    );
  }

  if (!verse) return null;

  return (
    <View className="mx-6 mb-5" style={cardStyle}>
      <Text
        className="text-xs font-bold uppercase tracking-[2px] text-center mb-5"
        style={{ color: colors.gold }}
      >
        Verse of the Day
      </Text>

      <Text
        className="text-[22px] text-center leading-[48px] mb-4"
        style={{ fontFamily: "Amiri_400Regular", color: colors.emerald }}
      >
        {verse.arabic}
      </Text>

      <Text
        className="text-[15px] leading-6 text-center mb-3"
        style={{ color: colors.textSecondary }}
      >
        {verse.translation}
      </Text>

      <Text
        className="text-sm text-center mb-5"
        style={{
          fontFamily: "LibreBaskerville_700Bold",
          color: colors.textPrimary,
        }}
      >
        Surah {verse.surahEnglishName} {verse.surahNumber}:{verse.ayahNumber}
      </Text>

      <Pressable
        onPress={() => {
          const n = Number(verse.surahNumber);
          if (!Number.isFinite(n) || n < 1 || n > 114) return;
          router.push(`/quran/${n}`);
        }}
        className="rounded-full py-3.5 items-center active:opacity-80"
        style={{ backgroundColor: colors.emeraldDark }}
      >
        <Text className="text-white text-xs font-bold uppercase tracking-[1.5px]">
          Reflect
        </Text>
      </Pressable>
    </View>
  );
}
