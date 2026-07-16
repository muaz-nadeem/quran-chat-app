import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import "../global.css";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const loadProfile = useAuthStore((s) => s.loadProfile);
  const loadConversations = useChatStore((s) => s.loadConversations);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    async function init() {
      await loadProfile();
      await loadConversations();
      SplashScreen.hideAsync();
    }
    init();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F6F7F4" }} />
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F6F7F4" },
          animation: "fade",
        }}
      >
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="chat/[id]"
          options={{
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </>
  );
}
