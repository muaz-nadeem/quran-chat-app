import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  loadTheme: () => Promise<void>;
}

export const THEME_COLORS = {
  light: {
    background: "#0B1F14",
    surface: "#163D2B",
    surfaceElevated: "#1C4A35",
    surfaceLight: "#2D5C47",
    textPrimary: "#F2F7F4",
    textSecondary: "#9BB8A8",
    textOnGreen: "#FFFFFF",
    textOnGreenMuted: "rgba(255, 255, 255, 0.72)",
    muted: "#6B8F7A",
    emerald: "#74C69D",
    emeraldLight: "#95D5B2",
    emeraldDark: "#1F5038",
    emeraldSoft: "rgba(255, 255, 255, 0.08)",
    surfaceTint: "rgba(255, 255, 255, 0.06)",
    surfaceTintGold: "rgba(212, 175, 55, 0.18)",
    gold: "#D4AF37",
    goldSoft: "rgba(212, 175, 55, 0.18)",
    danger: "#E07A7A",
    heroStart: "#081810",
    heroEnd: "#122A1E",
    pattern: "#D4AF37",
    patternOpacity: 0.1,
    cardShadow: "rgba(0, 0, 0, 0.35)",
    white: "#FFFFFF",
    cream: "#1F4D38",
  },
  dark: {
    background: "#060F0A",
    surface: "#122A1E",
    surfaceElevated: "#163528",
    surfaceLight: "#243D30",
    textPrimary: "#F2F7F4",
    textSecondary: "#9BB8A8",
    textOnGreen: "#F2F7F4",
    textOnGreenMuted: "rgba(242, 242, 242, 0.65)",
    muted: "#6B8F7A",
    emerald: "#74C69D",
    emeraldLight: "#95D5B2",
    emeraldDark: "#2D6A4F",
    emeraldSoft: "rgba(255, 255, 255, 0.06)",
    surfaceTint: "rgba(255, 255, 255, 0.05)",
    surfaceTintGold: "rgba(212, 168, 75, 0.15)",
    gold: "#D4A84B",
    goldSoft: "rgba(212, 168, 75, 0.15)",
    danger: "#E07A7A",
    heroStart: "#040A07",
    heroEnd: "#0F2918",
    pattern: "#D4A84B",
    patternOpacity: 0.08,
    cardShadow: "rgba(0, 0, 0, 0.45)",
    white: "#FFFFFF",
    cream: "#1A3D2E",
  },
};

export const useThemeStore = create<ThemeState>((set) => ({
  mode: "light",

  setMode: (mode) => {
    set({ mode });
    AsyncStorage.setItem("theme_mode", mode);
  },

  loadTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem("theme_mode");
      if (stored === "light" || stored === "dark") {
        set({ mode: stored });
      }
    } catch {
      // default to light
    }
  },
}));
