import { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import HeroHeader from "@/components/ui/HeroHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getHadithCollection,
  getCollectionById,
  Hadith,
} from "@/lib/hadith-api";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";

export default function HadithCollectionScreen() {
  const { collection } = useLocalSearchParams<{ collection: string }>();
  const router = useRouter();
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];
  const info = getCollectionById(collection ?? "");
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!collection) return;
    setLoading(true);
    getHadithCollection(collection, page, 10)
      .then(setHadiths)
      .finally(() => setLoading(false));
  }, [collection, page]);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <HeroHeader
        title={info?.name ?? "Hadith"}
        subtitle={info?.arabicName}
        compact
        rightAction={
          <Pressable onPress={() => router.back()}>
            <Text className="text-white/80 text-sm font-semibold">Back</Text>
          </Pressable>
        }
      />

      <View className="flex-1 rounded-t-[28px] -mt-6 px-6 pt-6" style={{ backgroundColor: colors.background }}>
        {loading ? (
          <ActivityIndicator color={colors.emerald} className="mt-8" />
        ) : (
          <FlatList
            data={hadiths}
            keyExtractor={(item) => String(item.number)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
            renderItem={({ item }) => (
              <View
                className="mb-4 p-4 rounded-2xl"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.surfaceLight,
                  borderWidth: 1,
                }}
              >
                <Text className="text-xs font-bold uppercase mb-2" style={{ color: colors.gold }}>
                  Hadith {item.number}
                </Text>
                {item.arabic ? (
                  <Text
                    className="text-lg leading-8 mb-3"
                    style={{ fontFamily: "Amiri_400Regular", color: colors.textPrimary }}
                  >
                    {item.arabic}
                  </Text>
                ) : null}
                <Text className="text-sm leading-6" style={{ color: colors.textSecondary }}>
                  {item.english}
                </Text>
                {item.narrator ? (
                  <Text className="text-xs mt-2 italic" style={{ color: colors.muted }}>
                    Narrated by {item.narrator}
                  </Text>
                ) : null}
              </View>
            )}
            ListFooterComponent={
              <Pressable
                onPress={() => setPage((p) => p + 1)}
                className="rounded-full py-3 items-center mb-4"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="font-bold text-sm" style={{ color: colors.emerald }}>
                  Load More
                </Text>
              </Pressable>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
