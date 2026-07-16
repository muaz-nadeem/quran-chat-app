import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";

export default function Index() {
  const mode = useAuthStore((s) => s.mode);

  if (!mode) {
    return <Redirect href="/(onboarding)" />;
  }

  return <Redirect href="/(tabs)" />;
}
