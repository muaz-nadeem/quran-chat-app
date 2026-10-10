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
import {
  getSurah,
  getSurahList,
  AyahData,
  SurahInfo,
  TranslationLang,
} from "@/lib/quran-api";
import { usePlanStore } from "@/stores/usePlanStore";
import AyahRow from "@/components/AyahRow";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

function BookmarkIcon({ color = "#FFFFFF" }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 4h12a1 1 0 011 1v16l-7-4-7 4V5a1 1 0 011-1z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        fill={color}
        fillOpacity={0.25}
      />
    </Svg>
  );
}

export default function SurahScreen() {
  const { surah, lang } = useLocalSearchParams<{
    surah: string | string[];
    lang?: string | string[];
  }>();
  const router = useRouter();
  const surahParam = Array.isArray(surah) ? surah[0] : surah;
  const langParam = Array.isArray(lang) ? lang[0] : lang;
  const surahNumber = Number(surahParam);
  const translationLang: TranslationLang = langParam === "ur" ? "ur" : "en";
  const validSurah =
    Number.isFinite(surahNumber) && surahNumber >= 1 && surahNumber <= 114;

  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [surahInfo, setSurahInfo] = useState<SurahInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const setBookmark = usePlanStore((s) => s.setBookmark);
  const lastReadSurah = usePlanStore((s) => s.lastReadSurah);

  const isBookmarked = lastReadSurah === surahNumber;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!validSurah) {
        setError("Invalid surah");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [ayahData, surahList] = await Promise.all([
          getSurah(surahNumber, translationLang),
          getSurahList(),
        ]);
        if (cancelled) return;
        setAyahs(ayahData ?? []);
        setSurahInfo(surahList.find((s) => s.number === surahNumber) ?? null);
      } catch {
        if (!cancelled) {
          setError("Could not load this surah. Please try again.");
          setAyahs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [surahNumber, translationLang, validSurah]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const saveBookmark = () => {
    const first = ayahs[0];
    setBookmark(
      first?.page ?? usePlanStore.getState().lastReadPage ?? 1,
      surahNumber,
      1
    );
    setToast("Bookmark saved");
  };

  const showBismillah = validSurah && surahNumber !== 9 && surahNumber !== 1;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View
        className="flex-row items-center px-4 py-3 bg-deep-green"
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
        <View className="flex-1 items-center px-2">
          <Text className="text-white font-bold text-lg tracking-wide">
            {surahInfo?.englishName ??
              (validSurah ? `Surah ${surahNumber}` : "Surah")}
          </Text>
          {surahInfo && (
            <Text className="text-white/70 text-xs mt-0.5">
              {surahInfo.name} · {surahInfo.numberOfAyahs} verses
            </Text>
          )}
        </View>
        <Pressable
          onPress={saveBookmark}
          disabled={!ayahs.length}
          className="flex-row items-center rounded-full px-3.5 py-2 active:opacity-80"
          style={{
            backgroundColor: isBookmarked ? "#B08D57" : "rgba(255,255,255,0.18)",
            opacity: ayahs.length ? 1 : 0.5,
          }}
        >
          <BookmarkIcon color="#FFFFFF" />
          <Text className="text-white text-xs font-bold ml-1.5">
            {isBookmarked ? "Saved" : "Save"}
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center bg-surface">
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text className="text-text-secondary mt-4 text-sm">
            Loading surah...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8 bg-surface">
          <Text className="text-text-primary text-center mb-4">{error}</Text>
          <Pressable
            onPress={() => router.back()}
            className="rounded-full bg-deep-green px-6 py-3"
          >
            <Text className="text-white font-semibold text-sm">Go back</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          className="flex-1 bg-surface"
          data={ayahs}
          keyExtractor={(item) => String(item.number)}
          renderItem={({ item, index }) => (
            <AyahRow
              ayah={item}
              surahNumber={surahNumber}
              isLast={index === ayahs.length - 1}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 48 }}
          ListHeaderComponent={
            showBismillah ? (
              <View className="py-8 items-center border-b border-surface-light bg-cream">
                <View className="px-8 py-4 rounded-2xl bg-surface border border-surface-light">
                  <Text className="text-text-primary text-[24px] text-center leading-[40px]">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </Text>
                  <Text className="text-text-secondary text-xs text-center mt-2 italic">
                    In the name of Allah, the Most Gracious, the Most Merciful
                  </Text>
                </View>
              </View>
            ) : null
          }
        />
      )}

      {toast && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="absolute left-6 right-6 bottom-12 items-center"
          pointerEvents="none"
        >
          <View className="rounded-full px-5 py-3 flex-row items-center bg-deep-green">
            <Text className="text-white text-sm font-semibold">✓ {toast}</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
