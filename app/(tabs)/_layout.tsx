import { Tabs } from "expo-router";
import { ColorValue, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useThemeStore, THEME_COLORS } from "@/stores/useThemeStore";
import AudioPlayerBar from "@/components/AudioPlayerBar";

type IconComp = (p: { color: ColorValue; size: number }) => React.ReactNode;

function HomeIcon({ color, size }: { color: ColorValue; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3L21 9.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9.5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 22V12H15V22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BookIcon({ color, size }: { color: ColorValue; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChatIcon({ color, size }: { color: ColorValue; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 15L18.75 17.25L21 18L18.75 18.75L18 21L17.25 18.75L15 18L17.25 17.25L18 15Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PrayerIcon({ color, size }: { color: ColorValue; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2V6" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M12 18V22" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M4.93 4.93L7.76 7.76" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M16.24 16.24L19.07 19.07" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M2 12H6" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M18 12H22" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M4.93 19.07L7.76 16.24" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M16.24 7.76L19.07 4.93" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path
        d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

function ProfileIcon({ color, size }: { color: ColorValue; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TabIcon({
  focused,
  color,
  label,
  Icon,
  activeBg,
}: {
  focused: boolean;
  color: ColorValue;
  label: string;
  Icon: IconComp;
  activeBg: string;
}) {
  if (focused) {
    return (
      <View
        style={{
          backgroundColor: activeBg,
          borderRadius: 24,
          paddingHorizontal: 14,
          paddingVertical: 8,
          alignItems: "center",
          minWidth: 68,
        }}
      >
        <Icon color="#FFFFFF" size={20} />
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 10,
            fontWeight: "700",
            marginTop: 2,
          }}
        >
          {label}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ alignItems: "center", minWidth: 68, paddingVertical: 8 }}>
      <Icon color={color} size={22} />
      <Text
        style={{
          color: color,
          fontSize: 11,
          fontWeight: "600",
          marginTop: 3,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const themeMode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[themeMode];
  const inactive = themeMode === "dark" ? "#8FA898" : "rgba(255,255,255,0.55)";

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          backgroundColor: colors.heroStart,
          borderTopColor: colors.gold,
          borderTopWidth: 1,
          height: 90,
          paddingBottom: 22,
          paddingTop: 10,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              color={color}
              label="Home"
              Icon={HomeIcon}
              activeBg={colors.gold}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: "Quran",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              color={color}
              label="Quran"
              Icon={BookIcon}
              activeBg={colors.gold}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "AI Chat",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              color={color}
              label="AI Chat"
              Icon={ChatIcon}
              activeBg={colors.gold}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: "Prayer",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              color={color}
              label="Prayer"
              Icon={PrayerIcon}
              activeBg={colors.gold}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              color={color}
              label="Profile"
              Icon={ProfileIcon}
              activeBg={colors.gold}
            />
          ),
        }}
      />
      <Tabs.Screen name="saved" options={{ href: null }} />
    </Tabs>
    <AudioPlayerBar />
    </>
  );
}
