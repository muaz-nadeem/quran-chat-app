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
  getPage,
  PageAyah,
  TOTAL_QURAN_PAGES,
  TranslationLang,
} from "@/lib/quran-api";
import { usePlanStore } from "@/stores/usePlanStore";
import { useQuranAudioStore } from "@/lib/quran-audio";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";
import { HeadphonesIcon } from "@/components/icons";
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

export default function QuranPageScreen() {
  const { page: pageParam, lang } = useLocalSearchParams<{
    page: string;
    lang?: string;
  }>();
  const router = useRouter();
  const themeMode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[themeMode];
  const pageNumber = Math.min(
    Math.max(1, Number(pageParam) || 1),
    TOTAL_QURAN_PAGES
  );
  const translationLang: TranslationLang = lang === "ur" ? "ur" : "en";

  const [ayahs, setAyahs] = useState<PageAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const markPageRead = usePlanStore((s) => s.markPageRead);
  const setBookmark = usePlanStore((s) => s.setBookmark);
  const lastReadPage = usePlanStore((s) => s.lastReadPage);
  const todayPagesDone = usePlanStore((s) => s.todayPagesDone);
  const getTodayAssignment = usePlanStore((s) => s.getTodayAssignment);
  const playAyah = useQuranAudioStore((s) => s.playAyah);
  const currentSurah = useQuranAudioStore((s) => s.currentSurah);
  const currentAyah = useQuranAudioStore((s) => s.currentAyah);

  const isMarked = todayPagesDone.includes(pageNumber);
  const isBookmarked = lastReadPage === pageNumber;
  const assignment = getTodayAssignment();
  const inTodayPlan =
    !!assignment &&
    pageNumber >= assignment.startPage &&
    pageNumber <= assignment.endPage;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await getPage(pageNumber, translationLang);
        if (!cancelled) {
          setAyahs(data);
          // Quietly track resume position without toast
          if (data[0]) {
            setBookmark(pageNumber, data[0].surahNumber, data[0].numberInSurah);
          } else {
            setBookmark(pageNumber);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [pageNumber, translationLang]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const saveBookmark = () => {
    setBookmark(
      pageNumber,
      ayahs[0]?.surahNumber,
      ayahs[0]?.numberInSurah
    );
    setToast("Bookmark saved");
  };

  const surahLabel =
    ayahs.length > 0
      ? [...new Set(ayahs.map((a) => a.surahName))].join(" · ")
      : "";

  const goTo = (n: number) => {
    if (n < 1 || n > TOTAL_QURAN_PAGES) return;
    router.replace(`/quran/page/${n}`);
  };

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
            Page {pageNumber}
          </Text>
          {!!surahLabel && (
            <Text className="text-white/70 text-xs mt-0.5" numberOfLines={1}>
              {surahLabel}
            </Text>
          )}
        </View>
        <Pressable
          onPress={saveBookmark}
          className="flex-row items-center rounded-full px-3.5 py-2 active:opacity-80"
          style={{ backgroundColor: isBookmarked ? "#B08D57" : "rgba(255,255,255,0.18)" }}
        >
          <BookmarkIcon color="#FFFFFF" />
          <Text className="text-white text-xs font-bold ml-1.5">
            {isBookmarked ? "Saved" : "Save"}
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center bg-surface">
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : (
        <FlatList
          className="flex-1 bg-surface"
          data={ayahs}
          keyExtractor={(item) => String(item.number)}
          contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
          ListHeaderComponent={
            inTodayPlan ? (
              <View
                className="mb-4 rounded-2xl px-4 py-3"
                style={{ backgroundColor: colors.goldSoft }}
              >
                <Text
                  className="text-xs font-semibold text-center"
                  style={{ color: colors.gold }}
                >
                  Today's plan · pages {assignment!.startPage}–
                  {assignment!.endPage}
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const isActive =
              currentSurah === item.surahNumber &&
              currentAyah === item.numberInSurah;
            return (
            <View className="mb-5 pb-5 border-b border-surface-light">
              <View className="flex-row items-center mb-2">
                <Pressable
                  onPress={() =>
                    playAyah(item.surahNumber, item.numberInSurah)
                  }
                  className="w-7 h-7 rounded-full items-center justify-center mr-2"
                  style={{
                    backgroundColor: isActive ? colors.gold : colors.emeraldDark,
                  }}
                >
                  {isActive ? (
                    <Text className="text-white text-[8px]">▶</Text>
                  ) : (
                    <HeadphonesIcon color="#FFFFFF" size={12} />
                  )}
                </Pressable>
                <View
                  className="rounded-full px-2.5 py-1 mr-2"
                  style={{ backgroundColor: colors.surfaceTint }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: colors.emerald }}
                  >
                    {item.surahNumber}:{item.numberInSurah}
                  </Text>
                </View>
                <Text className="text-text-secondary text-xs">
                  {item.surahName}
                </Text>
              </View>
              <Text
                className="text-text-primary text-2xl leading-10 mb-3 text-right"
                style={{ writingDirection: "rtl" }}
              >
                {item.arabic}
              </Text>
              <Text className="text-text-secondary text-[15px] leading-6">
                {item.translation}
              </Text>
            </View>
            );
          }}
        />
      )}

      <View className="absolute bottom-0 left-0 right-0 bg-surface border-t border-surface-light px-5 pt-3 pb-8">
        <View className="flex-row mb-3" style={{ gap: 10 }}>
          <Pressable
            onPress={() => goTo(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="flex-1 rounded-full py-3 items-center border border-surface-light"
            style={{ opacity: pageNumber <= 1 ? 0.4 : 1 }}
          >
            <Text
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: colors.emerald }}
            >
              ← Prev
            </Text>
          </Pressable>
          <Pressable
            onPress={saveBookmark}
            className="rounded-full px-4 py-3 flex-row items-center justify-center border active:opacity-80"
            style={{
              borderColor: isBookmarked ? colors.gold : colors.surfaceLight,
              backgroundColor: isBookmarked
                ? colors.goldSoft
                : colors.surfaceTint,
            }}
          >
            <BookmarkIcon color={isBookmarked ? colors.gold : colors.emerald} />
            <Text
              className="text-xs font-bold uppercase tracking-wider ml-1.5"
              style={{ color: isBookmarked ? colors.gold : colors.emerald }}
            >
              Bookmark
            </Text>
          </Pressable>
          <Pressable
            onPress={() => goTo(pageNumber + 1)}
            disabled={pageNumber >= TOTAL_QURAN_PAGES}
            className="flex-1 rounded-full py-3 items-center border border-surface-light"
            style={{
              opacity: pageNumber >= TOTAL_QURAN_PAGES ? 0.4 : 1,
            }}
          >
            <Text
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: colors.emerald }}
            >
              Next →
            </Text>
          </Pressable>
        </View>

        {inTodayPlan && (
          <Pressable
            onPress={() => {
              markPageRead(pageNumber);
              if (
                assignment &&
                pageNumber < assignment.endPage &&
                pageNumber < TOTAL_QURAN_PAGES
              ) {
                goTo(pageNumber + 1);
              }
            }}
            className="rounded-full py-3.5 items-center active:opacity-80"
            style={{
              backgroundColor: isMarked ? colors.goldSoft : colors.emeraldDark,
            }}
          >
            <Text
              className="text-xs font-bold uppercase tracking-[1.5px]"
              style={{ color: isMarked ? colors.gold : colors.white }}
            >
              {isMarked ? "Page marked ✓" : "Mark page read"}
            </Text>
          </Pressable>
        )}
      </View>

      {toast && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="absolute left-6 right-6 items-center"
          style={{ bottom: inTodayPlan ? 150 : 110 }}
          pointerEvents="none"
        >
          <View
            className="rounded-full px-5 py-3 flex-row items-center"
            style={{ backgroundColor: colors.emeraldDark }}
          >
            <Text className="text-white text-sm font-semibold">
              ✓ {toast}
            </Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
