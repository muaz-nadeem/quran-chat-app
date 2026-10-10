import { getVerse, VerseWithTranslation } from "@/lib/quran-api";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface Props {
  surah: number;
  ayah: number;
}

export default function VerseCard({ surah, ayah }: Props) {
  const [verse, setVerse] = useState<VerseWithTranslation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVerse();
  }, [surah, ayah]);

  async function loadVerse() {
    try {
      const data = await getVerse(surah, ayah);
      setVerse(data);
    } catch {
      setVerse(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="bg-surface-tint rounded-2xl p-4 my-2 border border-surface-light">
        <ActivityIndicator color="#A97E3F" size="small" />
      </View>
    );
  }

  if (!verse) {
    return (
      <View className="bg-surface-tint rounded-2xl p-4 my-2 border border-surface-light">
        <Text className="text-gold text-xs font-semibold mb-1">
          📖 Quran {surah}:{ayah}
        </Text>
        <Text className="text-text-secondary text-sm italic">
          Verse reference could not be loaded
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-surface-tint rounded-2xl p-4 my-2 border border-surface-light">
      <View className="flex-row items-center mb-3">
        <Text className="text-gold text-xs font-bold uppercase tracking-wider">
          📖 {verse.surahEnglishName}
        </Text>
        <View className="bg-gold/15 rounded-full px-2 py-0.5 ml-2">
          <Text className="text-gold-light text-xs font-semibold">
            {surah}:{ayah}
          </Text>
        </View>
      </View>

      <Text className="text-text-primary text-xl text-right leading-[40px] mb-3">
        {verse.arabic}
      </Text>

      <View className="h-px bg-gold/15 mb-3" />

      <Text className="text-text-secondary text-sm leading-6 italic">
        "{verse.translation}"
      </Text>
    </View>
  );
}
