import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";

export default function Index() {
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted);
  const mode = useAuthStore((s) => s.mode);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return null;

  // Finished onboarding → always land on home (even if mode was missing)
  if (onboardingCompleted) {
    return <Redirect href="/(tabs)" />;
  }

  // Started guest/account flow but not finished → resume personalization
  if (mode) {
    return <Redirect href="/(onboarding)/name" />;
  }

  return <Redirect href="/(onboarding)" />;
}
