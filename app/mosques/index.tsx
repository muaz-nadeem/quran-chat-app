import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import ScreenShell from "@/components/ui/ScreenShell";
import Badge from "@/components/ui/Badge";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";
import { MapPinIcon, MosqueIcon } from "@/components/icons";

const MOCK_MOSQUES = [
  { id: "1", name: "Central Masjid", distance: "0.8 km", address: "Main Street" },
  { id: "2", name: "Al-Noor Islamic Center", distance: "1.4 km", address: "Park Avenue" },
  { id: "3", name: "Jamia Mosque", distance: "2.1 km", address: "University Road" },
];

export default function MosquesScreen() {
  const router = useRouter();
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];

  return (
    <ScreenShell
      title="Nearby Mosques"
      subtitle="Find places to pray"
      compactHero
    >
      <View
        className="rounded-2xl p-4 mb-5 items-center"
        style={{
          backgroundColor: colors.emeraldSoft,
          borderWidth: 1,
          borderColor: colors.gold,
        }}
      >
        <Badge label="Coming Soon" variant="gold" />
        <Text
          className="text-sm text-center mt-3 leading-5"
          style={{ color: colors.textOnGreenMuted }}
        >
          Live map search with GPS will be available in a future update. Premium
          members get unlimited mosque discovery.
        </Text>
        <Pressable
          onPress={() => router.push("/premium/index" as never)}
          className="mt-3 rounded-full px-5 py-2"
          style={{ backgroundColor: colors.emeraldDark }}
        >
          <Text className="text-white text-xs font-bold uppercase">View Premium</Text>
        </Pressable>
      </View>

      <View
        className="rounded-2xl h-40 mb-5 items-center justify-center"
        style={{
          backgroundColor: colors.surfaceLight,
          borderWidth: 1,
          borderColor: colors.surfaceLight,
        }}
      >
        <MapPinIcon color={colors.muted} size={32} />
        <Text className="text-sm mt-2" style={{ color: colors.muted }}>
          Map preview
        </Text>
      </View>

      <Text
        className="text-base mb-3"
        style={{
          fontFamily: "LibreBaskerville_700Bold",
          color: colors.gold,
        }}
      >
        Sample Results
      </Text>

      {MOCK_MOSQUES.map((mosque) => (
        <View
          key={mosque.id}
          className="flex-row items-center mb-3 p-4 rounded-2xl"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.surfaceLight,
            borderWidth: 1,
          }}
        >
          <View
            className="w-11 h-11 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: colors.surfaceTint }}
          >
            <MosqueIcon color={colors.emerald} size={20} />
          </View>
          <View className="flex-1">
            <Text className="font-semibold" style={{ color: colors.textPrimary }}>
              {mosque.name}
            </Text>
            <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
              {mosque.address}
            </Text>
          </View>
          <Text className="text-sm font-bold" style={{ color: colors.gold }}>
            {mosque.distance}
          </Text>
        </View>
      ))}
    </ScreenShell>
  );
}
