import { getRandomVerse, VerseWithTranslation } from "@/lib/quran-api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function VerseOfTheDay() {
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

  if (loading) {
    return (
      <View className="bg-surface rounded-3xl p-6 mx-6 mb-6">
        <View className="items-center py-8">
          <ActivityIndicator color="#10B981" />
        </View>
      </View>
    );
  }

  if (!verse) return null;

  return (
    <View className="mx-6 mb-6">
      <View className="bg-surface rounded-3xl p-6 border border-surface-light overflow-hidden">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Text className="text-lg mr-2">🌙</Text>
            <Text className="text-emerald font-bold text-sm uppercase tracking-wider">
              Verse of the Day
            </Text>
          </View>
          <View className="bg-emerald/10 rounded-full px-3 py-1">
            <Text className="text-emerald-light text-xs font-semibold">
              {verse.surahEnglishName} {verse.surahNumber}:{verse.ayahNumber}
            </Text>
          </View>
        </View>

        <Text
          className="text-text-primary text-2xl text-right leading-[48px] mb-4"
          style={{ fontFamily: "System" }}
        >
          {verse.arabic}
        </Text>

        <View className="h-px bg-emerald/10 mb-4" />

        <Text className="text-text-secondary text-base leading-7 italic">
          "{verse.translation}"
        </Text>
      </View>
    </View>
  );
}
