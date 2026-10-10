import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  LibreBaskerville_400Regular,
  LibreBaskerville_700Bold,
} from "@expo-google-fonts/libre-baskerville";
import { Amiri_400Regular, Amiri_700Bold } from "@expo-google-fonts/amiri";
import { useColorScheme } from "nativewind";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useThemeStore, THEME_COLORS } from "@/stores/useThemeStore";
import {
  attachNotificationRefreshListener,
  initNotifications,
} from "@/lib/notifications";
import "../global.css";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const loadProfile = useAuthStore((s) => s.loadProfile);
  const loadConversations = useChatStore((s) => s.loadConversations);
  const isLoading = useAuthStore((s) => s.isLoading);
  const themeMode = useThemeStore((s) => s.mode);
  const loadTheme = useThemeStore((s) => s.loadTheme);
  const colors = THEME_COLORS[themeMode];
  const { setColorScheme } = useColorScheme();

  const [fontsLoaded] = useFonts({
    LibreBaskerville_400Regular,
    LibreBaskerville_700Bold,
    Amiri_400Regular,
    Amiri_700Bold,
  });

  useEffect(() => {
    async function init() {
      await loadTheme();
      await loadProfile();
      await loadConversations();
      await initNotifications();
    }
    init();
  }, []);

  useEffect(() => {
    const detach = attachNotificationRefreshListener();
    return detach;
  }, []);

  useEffect(() => {
    setColorScheme(themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (!isLoading && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, fontsLoaded]);

  // Always render Stack — never early-return a bare View (causes nav crash)
  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "fade",
        }}
      >
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="chat/[id]"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="quran/[surah]"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="quran/juz/[juz]"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="quran/page/[page]"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="qibla"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="hadith/index"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="hadith/[collection]"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="mosques/index"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="premium/index"
          options={{ animation: "slide_from_bottom" }}
        />
      </Stack>
    </>
  );
}
