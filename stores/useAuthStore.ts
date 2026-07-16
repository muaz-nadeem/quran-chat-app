import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";

export type AuthMode = "account" | "guest" | null;

interface AuthState {
  mode: AuthMode;
  displayName: string;
  interests: string[];
  userId: string | null;
  email: string | null;
  isLoading: boolean;

  setDisplayName: (name: string) => void;
  setInterests: (interests: string[]) => void;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  continueAsGuest: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  loadProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  mode: null,
  displayName: "",
  interests: [],
  userId: null,
  email: null,
  isLoading: true,

  setDisplayName: (name) => set({ displayName: name }),
  setInterests: (interests) => set({ interests }),

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    // With email confirmation enabled, no session is returned until verified.
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
    ]);
    set({
      mode: "account",
      userId: data.session.user.id,
      email,
      displayName,
      interests,
    });
    return {};
  },

  continueAsGuest: async () => {
    try {
      // Optional: gives the guest a Supabase identity if anonymous
      // sign-ins are enabled. Guest mode works fine without it.
      await supabase.auth.signInAnonymously();
    } catch {
      // ignore — proceed as a local guest
    }
    // Guests never inherit stored history.
    await AsyncStorage.removeItem("conversations");
    await AsyncStorage.setItem("authMode", "guest");
    set({ mode: "guest", displayName: "", interests: [] });
  },

  completeOnboarding: async () => {
    const { displayName, interests, userId } = get();
    await AsyncStorage.multiSet([
      ["displayName", displayName],
      ["interests", JSON.stringify(interests)],
    ]);
    if (userId) {
      await supabase
        .from("profiles")
        .upsert({ id: userId, display_name: displayName, interests });
    }
  },

  loadProfile: async () => {
    try {
      const stored = await AsyncStorage.multiGet([
        "authMode",
        "displayName",
        "interests",
      ]);
      const mode = stored[0][1] as AuthMode;
      const displayName = stored[1][1];
      const interests = stored[2][1];

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mode === "account" && !session) {
        // Account session expired or was revoked — require sign-in again.
        await AsyncStorage.removeItem("authMode");
        set({ mode: null, isLoading: false });
        return;
      }

      set({
        mode: mode ?? null,
        displayName: displayName ?? "",
        interests: interests ? JSON.parse(interests) : [],
        userId: session?.user?.id ?? null,
        email: session?.user?.email ?? null,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    await AsyncStorage.multiRemove([
      "authMode",
      "displayName",
      "interests",
      "conversations",
    ]);
    set({
      mode: null,
      displayName: "",
      interests: [],
      userId: null,
      email: null,
    });
  },
}));
