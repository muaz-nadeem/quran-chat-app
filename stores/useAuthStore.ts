import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";

export type AuthMode = "account" | "guest" | null;

interface AuthState {
  mode: AuthMode;
  displayName: string;
  interests: string[];
  goal: string | null;
  journey: string | null;
  commitments: string[];
  pagesPerDay: number;
  planDays: number;
  onboardingCompleted: boolean;
  /** YYYY-MM-DD — salah tracker starts from this day */
  onboardedAt: string | null;
  userId: string | null;
  email: string | null;
  isLoading: boolean;

  setDisplayName: (name: string) => void;
  setInterests: (interests: string[]) => void;
  setGoal: (goal: string) => void;
  setJourney: (journey: string) => void;
  setCommitments: (commitments: string[]) => void;
  setPagesPerDay: (pages: number) => void;
  setPlanDays: (days: number) => void;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  continueAsGuest: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setOnboardedAt: (dateKey: string) => Promise<void>;
  loadProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  mode: null,
  displayName: "",
  interests: [],
  goal: null,
  journey: null,
  commitments: [],
  pagesPerDay: 5,
  planDays: 7,
  onboardingCompleted: false,
  onboardedAt: null,
  userId: null,
  email: null,
  isLoading: true,

  setDisplayName: (name) => set({ displayName: name }),
  setInterests: (interests) => set({ interests }),
  setGoal: (goal) => set({ goal }),
  setJourney: (journey) => set({ journey }),
  setCommitments: (commitments) => set({ commitments }),
  setPagesPerDay: (pages) => set({ pagesPerDay: pages }),
  setPlanDays: (days) => set({ planDays: days }),

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (!data.session) return { needsConfirmation: true };

    await AsyncStorage.setItem("authMode", "account");
    set({ mode: "account", userId: data.session.user.id, email });
    return {};
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };

    let displayName = "";
    let interests: string[] = [];
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, interests")
      .eq("id", data.session.user.id)
      .single();
    if (profile) {
      displayName = profile.display_name ?? "";
      interests = profile.interests ?? [];
    }

    await AsyncStorage.multiSet([
      ["authMode", "account"],
      ["displayName", displayName],
      ["interests", JSON.stringify(interests)],
      ["onboardingCompleted", "true"],
    ]);
    set({
      mode: "account",
      userId: data.session.user.id,
      email,
      displayName,
      interests,
      onboardingCompleted: true,
    });
    return {};
  },

  continueAsGuest: async () => {
    try {
      await supabase.auth.signInAnonymously();
    } catch {
      // ignore
    }
    const existing = await AsyncStorage.getItem("onboardingCompleted");
    if (existing !== "true") {
      await AsyncStorage.removeItem("conversations");
    }
    await AsyncStorage.setItem("authMode", "guest");
    set({ mode: "guest" });
  },

  completeOnboarding: async () => {
    const {
      displayName,
      interests,
      goal,
      journey,
      commitments,
      pagesPerDay,
      planDays,
      userId,
    } = get();
    const now = new Date();
    const onboardedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    await AsyncStorage.multiSet([
      ["displayName", displayName],
      ["interests", JSON.stringify(interests)],
      ["goal", goal ?? ""],
      ["journey", journey ?? ""],
      ["commitments", JSON.stringify(commitments)],
      ["pagesPerDay", String(pagesPerDay)],
      ["planDays", String(planDays)],
      ["onboardingCompleted", "true"],
      ["onboardedAt", onboardedAt],
      ["authMode", get().mode ?? "guest"],
    ]);
    set({
      onboardingCompleted: true,
      onboardedAt,
      mode: get().mode ?? "guest",
    });
    if (userId) {
      await supabase
        .from("profiles")
        .upsert({ id: userId, display_name: displayName, interests });
    }
  },

  setOnboardedAt: async (dateKey) => {
    const trimmed = dateKey.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return;
    await AsyncStorage.setItem("onboardedAt", trimmed);
    set({ onboardedAt: trimmed });
  },

  loadProfile: async () => {
    const stored = await AsyncStorage.multiGet([
      "authMode",
      "displayName",
      "interests",
      "goal",
      "journey",
      "commitments",
      "pagesPerDay",
      "planDays",
      "onboardingCompleted",
      "onboardedAt",
    ]);
    const mode = stored[0][1] as AuthMode;
    const displayName = stored[1][1];
    const interests = stored[2][1];
    const goal = stored[3][1];
    const journey = stored[4][1];
    const commitments = stored[5][1];
    const pagesPerDay = stored[6][1] ? Number(stored[6][1]) : 5;
    const planDays = stored[7][1] ? Number(stored[7][1]) : 7;
    const onboardingFlag = stored[8][1] === "true";
    let onboardedAt = stored[9][1];
    const onboardingCompleted =
      onboardingFlag || (!!mode && !!displayName && displayName.length >= 2);

    if (onboardingCompleted && !onboardingFlag) {
      await AsyncStorage.setItem("onboardingCompleted", "true");
    }

    if (onboardingCompleted && !onboardedAt) {
      const now = new Date();
      onboardedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      await AsyncStorage.setItem("onboardedAt", onboardedAt);
    }

    let resolvedMode = mode ?? null;
    if (onboardingCompleted && !resolvedMode) {
      resolvedMode = "guest";
      await AsyncStorage.setItem("authMode", "guest");
    }

    const applyLocalProfile = (session: { user: { id: string; email?: string } } | null = null) => {
      set({
        mode: resolvedMode,
        displayName: displayName ?? "",
        interests: interests ? JSON.parse(interests) : [],
        goal: goal || null,
        journey: journey || null,
        commitments: commitments ? JSON.parse(commitments) : [],
        pagesPerDay: Number.isFinite(pagesPerDay) ? pagesPerDay : 5,
        planDays: Number.isFinite(planDays) ? planDays : 7,
        onboardingCompleted,
        onboardedAt: onboardedAt || null,
        userId: session?.user?.id ?? null,
        email: session?.user?.email ?? null,
        isLoading: false,
      });
    };

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (resolvedMode === "account" && !session) {
        await AsyncStorage.removeItem("authMode");
        set({ mode: null, isLoading: false, onboardingCompleted: false });
        return;
      }

      applyLocalProfile(session);
    } catch {
      // Supabase unreachable (offline, deleted project, bad URL) — use local data
      applyLocalProfile();
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    await AsyncStorage.multiRemove([
      "authMode",
      "displayName",
      "interests",
      "goal",
      "journey",
      "commitments",
      "onboardingCompleted",
      "onboardedAt",
      "conversations",
      "daily_plan",
      "reading_plan_v2",
      "streak_data",
      "prayer_logs_v1",
    ]);
    set({
      mode: null,
      displayName: "",
      interests: [],
      goal: null,
      journey: null,
      commitments: [],
      pagesPerDay: 5,
      planDays: 7,
      onboardingCompleted: false,
      onboardedAt: null,
      userId: null,
      email: null,
    });
  },
}));
