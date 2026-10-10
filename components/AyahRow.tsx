import { Text, View, Pressable } from "react-native";
import { AyahData } from "@/lib/quran-api";
import { useQuranAudioStore } from "@/lib/quran-audio";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";
import { HeadphonesIcon } from "@/components/icons";

interface AyahRowProps {
  ayah: AyahData;
  surahNumber: number;
  isLast?: boolean;
}

export default function AyahRow({ ayah, surahNumber, isLast }: AyahRowProps) {
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];
  const playAyah = useQuranAudioStore((s) => s.playAyah);
  const currentSurah = useQuranAudioStore((s) => s.currentSurah);
  const currentAyah = useQuranAudioStore((s) => s.currentAyah);
  const isActive =
    currentSurah === surahNumber && currentAyah === ayah.numberInSurah;

  return (
    <View
      className={`px-5 py-5 ${isLast ? "" : "border-b"}`}
      style={{ borderColor: `${colors.surfaceLight}99` }}
    >
      <Text
        className="text-[22px] text-center leading-[50px] mb-4"
        style={{ fontFamily: "Amiri_400Regular", color: colors.textPrimary }}
      >
        {ayah.arabic}
      </Text>
      <View className="flex-row items-start">
        <Pressable
          onPress={() => playAyah(surahNumber, ayah.numberInSurah)}
          className="w-7 h-7 rounded-full items-center justify-center mr-3 mt-0.5"
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
        <View className="flex-1">
          <Text
            className="text-xs font-bold mb-1"
            style={{ color: colors.emerald }}
          >
            {ayah.numberInSurah}
          </Text>
          <Text
            className="text-sm leading-[22px]"
            style={{ color: colors.textSecondary }}
          >
            {ayah.translation}
          </Text>
        </View>
      </View>
    </View>
  );
}
