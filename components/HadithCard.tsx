import { View, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { Hadith, getHadithCollection } from "@/lib/hadith-api";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";

interface HadithCardProps {
  collection: string;
  number: number;
}

export default function HadithCard({ collection, number }: HadithCardProps) {
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHadithCollection(collection, number, 1)
      .then((items) => {
        const match = items.find((h) => h.number === number) ?? items[0];
        setHadith(match ?? null);
      })
      .finally(() => setLoading(false));
  }, [collection, number]);

  if (loading) {
    return (
      <View
        className="rounded-xl p-3 my-2"
        style={{ backgroundColor: colors.goldSoft }}
      >
        <ActivityIndicator color={colors.gold} size="small" />
      </View>
    );
  }

  if (!hadith) return null;

  return (
    <View
      className="rounded-xl p-3 my-2"
      style={{
        backgroundColor: colors.goldSoft,
        borderLeftWidth: 3,
        borderLeftColor: colors.gold,
      }}
    >
      <Text className="text-xs font-bold uppercase mb-1" style={{ color: colors.gold }}>
        Hadith · {collection} {hadith.number}
      </Text>
      <Text
        className="text-sm leading-5 mb-2"
        style={{ fontFamily: "Amiri_400Regular", color: colors.textPrimary }}
      >
        {hadith.arabic}
      </Text>
      <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
        {hadith.english}
      </Text>
      {hadith.narrator ? (
        <Text className="text-xs mt-2 italic" style={{ color: colors.muted }}>
          — {hadith.narrator}
        </Text>
      ) : null}
    </View>
  );
}
