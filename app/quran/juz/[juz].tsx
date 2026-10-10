import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getJuz, JuzAyahData, TranslationLang } from "@/lib/quran-api";
import { useQuranAudioStore } from "@/lib/quran-audio";
import { HeadphonesIcon } from "@/components/icons";
import Svg, { Path } from "react-native-svg";

export default function JuzScreen() {
  const { juz, lang } = useLocalSearchParams<{ juz: string; lang?: string }>();
  const router = useRouter();
  const juzNumber = Number(juz);
  const translationLang: TranslationLang = lang === "ur" ? "ur" : "en";

  const [ayahs, setAyahs] = useState<JuzAyahData[]>([]);
  const [loading, setLoading] = useState(true);
  const playAyah = useQuranAudioStore((s) => s.playAyah);
  const currentSurah = useQuranAudioStore((s) => s.currentSurah);
  const currentAyah = useQuranAudioStore((s) => s.currentAyah);

  useEffect(() => {
    getJuz(juzNumber, translationLang)
      .then(setAyahs)
      .finally(() => setLoading(false));
  }, [juzNumber, translationLang]);

  const renderAyah = ({ item, index }: { item: JuzAyahData; index: number }) => {
    const prevAyah = index > 0 ? ayahs[index - 1] : null;
    const showSurahHeader = !prevAyah || prevAyah.surahNumber !== item.surahNumber;
    const isActive =
      currentSurah === item.surahNumber && currentAyah === item.numberInSurah;

    return (
      <View>
        {showSurahHeader && (
          <View className="bg-deep-green py-3.5 px-6">
            <Text className="text-white font-bold text-[15px] tracking-wide">
              {item.surahName}
            </Text>
          </View>
        )}
        <View className="px-5 py-5 border-b border-surface-light/60">
          <Text
            className="text-text-primary text-[22px] text-center leading-[48px] mb-4"
            style={{ fontFamily: "System" }}
          >
            {item.arabic}
          </Text>
          <View className="flex-row items-start">
            <Pressable
              onPress={() => playAyah(item.surahNumber, item.numberInSurah)}
              className="w-7 h-7 rounded-full items-center justify-center mr-3 mt-0.5"
              style={{ backgroundColor: isActive ? "#C9A227" : "#1B4332" }}
            >
              {isActive ? (
                <Text className="text-white text-[8px]">▶</Text>
              ) : (
                <HeadphonesIcon color="#FFFFFF" size={12} />
              )}
            </Pressable>
            <View className="w-7 h-7 rounded-full bg-deep-green items-center justify-center mr-3 mt-0.5">
              <Text className="text-white text-[10px] font-bold">
                {item.numberInSurah}
              </Text>
            </View>
            <Text className="flex-1 text-sm text-text-secondary leading-[22px]">
              {item.translation}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-4 bg-deep-green"
        style={{
          shadowColor: "#1B4332",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center active:opacity-70 bg-white/10"
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18l-6-6 6-6"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-white font-bold text-lg tracking-wide">
            Para {juzNumber}
          </Text>
          <Text className="text-white/70 text-xs mt-0.5">
            Juz {juzNumber} · {ayahs.length} verses
          </Text>
        </View>
        <View className="w-10" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#C9A227" />
          <Text className="text-text-on-green-muted mt-4 text-sm">
            Loading para...
          </Text>
        </View>
      ) : (
        <FlatList
          className="flex-1 bg-surface"
          data={ayahs}
          keyExtractor={(item) => String(item.number)}
          renderItem={renderAyah}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 48 }}
        />
      )}
    </SafeAreaView>
  );
}
