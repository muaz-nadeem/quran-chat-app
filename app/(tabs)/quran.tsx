import { useEffect, useState, useMemo } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import HeroHeader from "@/components/ui/HeroHeader";
import GreenBackground from "@/components/ui/GreenBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import { getSurahList, SurahInfo, JUZ_DATA, JuzInfo } from "@/lib/quran-api";
import { usePlanStore } from "@/stores/usePlanStore";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";
import { BookmarkIcon, BookIcon } from "@/components/icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Path } from "react-native-svg";

type BrowseMode = "surah" | "juz";
type TranslationLang = "en" | "ur";

export default function QuranScreen() {
  const router = useRouter();
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [browseMode, setBrowseMode] = useState<BrowseMode>("surah");
  const [translationLang, setTranslationLang] = useState<TranslationLang>("en");
  const lastReadPage = usePlanStore((s) => s.lastReadPage);

  useEffect(() => {
    getSurahList()
      .then(setSurahs)
      .finally(() => setLoading(false));
    AsyncStorage.getItem("quran_translation_lang").then((val) => {
      if (val === "en" || val === "ur") setTranslationLang(val);
    });
  }, []);

  const handleLangToggle = (lang: TranslationLang) => {
    setTranslationLang(lang);
    AsyncStorage.setItem("quran_translation_lang", lang);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return surahs;
    const q = search.toLowerCase();
    return surahs.filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q)
    );
  }, [surahs, search]);

  const renderSurah = ({ item }: { item: SurahInfo }) => (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/quran/[surah]",
          params: { surah: item.number, lang: translationLang },
        })
      }
      className="flex-row items-center rounded-2xl px-4 py-4 mb-3 active:opacity-80"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.gold,
        borderWidth: 1,
        borderTopWidth: 3,
        borderTopColor: colors.gold,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
      }}
    >
      <View
        className="w-11 h-11 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: colors.emeraldDark }}
      >
        <Text className="text-white font-bold text-sm">{item.number}</Text>
      </View>
      <View className="flex-1">
        <Text className="font-bold text-[16px]" style={{ color: colors.textPrimary }}>
          {item.englishName}
        </Text>
        <View className="flex-row items-center mt-1.5 gap-2">
          <View
            className="px-2 py-0.5 rounded"
            style={{
              backgroundColor:
                item.revelationType === "Meccan"
                  ? colors.surfaceTint
                  : colors.goldSoft,
            }}
          >
            <Text
              className="text-[10px] font-semibold uppercase"
              style={{
                color:
                  item.revelationType === "Meccan" ? colors.emerald : colors.gold,
              }}
            >
              {item.revelationType === "Meccan" ? "MECCAN" : "MEDINAN"}
            </Text>
          </View>
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {item.numberOfAyahs} ayahs
          </Text>
        </View>
      </View>
      <View className="items-end ml-3">
        <Text
          className="text-[20px] leading-[28px]"
          style={{ fontFamily: "Amiri_400Regular", color: colors.textPrimary }}
        >
          {item.name}
        </Text>
      </View>
    </Pressable>
  );

  const renderJuz = ({ item }: { item: JuzInfo }) => {
    const startSurah = surahs.find((s) => s.number === item.startSurah);
    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/quran/juz/[juz]",
            params: { juz: item.number, lang: translationLang },
          })
        }
        className="flex-row items-center rounded-2xl px-4 py-4 mb-3 active:opacity-80"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.gold,
          borderWidth: 1,
          borderTopWidth: 3,
          borderTopColor: colors.gold,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        <View
          className="w-11 h-11 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: colors.gold }}
        >
          <Text className="font-bold text-sm" style={{ color: colors.gold }}>
            {item.number}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-bold text-[16px]" style={{ color: colors.textPrimary }}>
            {item.name}
          </Text>
          <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
            Starts at {startSurah?.englishName ?? `Surah ${item.startSurah}`}, Ayah{" "}
            {item.startAyah}
          </Text>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
        edges={["top"]}
      >
        <ActivityIndicator size="large" color={colors.emerald} />
      </SafeAreaView>
    );
  }

  const heroContent = lastReadPage > 0 ? (
    <Pressable
      onPress={() => router.push(`/quran/page/${lastReadPage}`)}
      className="mt-3 active:opacity-80"
    >
      <View
        className="rounded-2xl px-4 py-3 flex-row items-center"
        style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
      >
        <BookmarkIcon color="#FFFFFF" size={18} />
        <View className="flex-1 ml-3">
          <Text className="text-white/70 text-xs font-semibold uppercase">
            Resume Reading
          </Text>
          <Text className="text-white font-bold">Page {lastReadPage}</Text>
        </View>
        <Text className="text-white font-bold">→</Text>
      </View>
    </Pressable>
  ) : null;

  return (
    <GreenBackground>
      <SafeAreaView className="flex-1" edges={["left", "right"]}>
      <HeroHeader
        title="Quran"
        subtitle="Read, listen & reflect"
        compact
        blend
        rightAction={
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.goldSoft }}
          >
            <BookIcon color={colors.gold} size={20} />
          </View>
        }
      >
        {heroContent}
      </HeroHeader>

      <View className="flex-1 pt-2">
        <View className="mx-5 mb-4 flex-row rounded-full p-1" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
          {(["surah", "juz"] as BrowseMode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => setBrowseMode(m)}
              className="flex-1 py-2.5 rounded-full items-center"
              style={{
                backgroundColor: browseMode === m ? colors.gold : "transparent",
              }}
            >
              <Text
                className="font-semibold text-sm"
                style={{
                  color: browseMode === m ? colors.heroStart : colors.textOnGreenMuted,
                }}
              >
                {m === "surah" ? "Surah-wise" : "Para-wise"}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="flex-row mx-5 mb-4 gap-2">
          {(["en", "ur"] as TranslationLang[]).map((lang) => (
            <Pressable
              key={lang}
              onPress={() => handleLangToggle(lang)}
              className="px-4 py-1.5 rounded-full"
              style={{
                backgroundColor:
                  translationLang === lang ? colors.goldSoft : "rgba(255,255,255,0.08)",
                borderWidth: translationLang === lang ? 1 : 0,
                borderColor: colors.gold,
              }}
            >
              <Text
                className="font-medium text-xs"
                style={{
                  color:
                    translationLang === lang ? colors.gold : colors.textOnGreenMuted,
                }}
              >
                {lang === "en" ? "English" : "اردو"}
              </Text>
            </Pressable>
          ))}
        </View>

        {browseMode === "surah" && (
          <View className="px-5 mb-4">
            <View
              className="flex-row items-center rounded-2xl px-4 py-3"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.gold,
                borderWidth: 1,
              }}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                  stroke={colors.muted}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <TextInput
                className="flex-1 ml-3 text-[15px]"
                style={{ color: colors.textPrimary }}
                placeholder="Search surahs..."
                placeholderTextColor={colors.muted}
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
              />
            </View>
          </View>
        )}

        {browseMode === "surah" ? (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.number)}
            renderItem={renderSurah}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          />
        ) : (
          <FlatList
            data={JUZ_DATA}
            keyExtractor={(item) => String(item.number)}
            renderItem={renderJuz}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          />
        )}
      </View>
      </SafeAreaView>
    </GreenBackground>
  );
}
