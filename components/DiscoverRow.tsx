import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
  CompassIcon,
  HeadphonesIcon,
  ScrollIcon,
  MapPinIcon,
} from "@/components/icons";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";

const ITEMS = [
  {
    id: "qibla",
    label: "Qibla",
    subtitle: "Find direction",
    route: "/qibla" as const,
    Icon: CompassIcon,
  },
  {
    id: "listen",
    label: "Listen",
    subtitle: "Recitation",
    route: "/(tabs)/quran" as const,
    Icon: HeadphonesIcon,
  },
  {
    id: "hadith",
    label: "Hadith",
    subtitle: "Prophetic wisdom",
    route: "/hadith/index" as const,
    Icon: ScrollIcon,
  },
  {
    id: "mosques",
    label: "Mosques",
    subtitle: "Nearby",
    route: "/mosques/index" as const,
    Icon: MapPinIcon,
  },
];

export default function DiscoverRow() {
  const router = useRouter();
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];

  return (
    <View className="mb-4">
      <Text
        className="text-lg mb-3"
        style={{
          fontFamily: "LibreBaskerville_700Bold",
          color: colors.gold,
        }}
      >
        Discover
      </Text>
      <View className="flex-row flex-wrap" style={{ gap: 10 }}>
        {ITEMS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => router.push(item.route as never)}
            className="active:opacity-80"
            style={{
              width: "47%",
              backgroundColor: "rgba(255,255,255,0.07)",
              borderColor: colors.gold,
              borderWidth: 1,
              borderRadius: 18,
              padding: 14,
            }}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mb-2"
              style={{ backgroundColor: colors.goldSoft }}
            >
              <item.Icon color={colors.gold} size={20} />
            </View>
            <Text
              className="font-semibold text-sm"
              style={{ color: colors.textOnGreen }}
            >
              {item.label}
            </Text>
            <Text className="text-xs mt-0.5" style={{ color: colors.textOnGreenMuted }}>
              {item.subtitle}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
