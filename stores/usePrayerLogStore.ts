import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PrayerName, PrayerStatus } from "@/constants/prayer-tracking";

export interface PrayerEntry {
  status: PrayerStatus;
  reasons: string[];
  notes: string;
  updatedAt: string;
}

/** dateKey → prayer → entry */
export type PrayerLogMap = Record<string, Partial<Record<PrayerName, PrayerEntry>>>;

interface PrayerLogState {
  logs: PrayerLogMap;
  loaded: boolean;
  loadLogs: () => Promise<void>;
  setPrayerEntry: (
    dateKey: string,
    prayer: PrayerName,
    entry: Omit<PrayerEntry, "updatedAt">
  ) => void;
  clearEntry: (dateKey: string, prayer: PrayerName) => void;
  getEntry: (dateKey: string, prayer: PrayerName) => PrayerEntry | null;
  todayCompletedCount: () => number;
}

const STORAGE_KEY = "prayer_logs_v1";

export const usePrayerLogStore = create<PrayerLogState>((set, get) => ({
  logs: {},
  loaded: false,

  loadLogs: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        set({ logs: JSON.parse(raw) as PrayerLogMap, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  setPrayerEntry: (dateKey, prayer, entry) => {
    const logs = { ...get().logs };
    const day = { ...(logs[dateKey] ?? {}) };
    day[prayer] = {
      ...entry,
      updatedAt: new Date().toISOString(),
    };
    logs[dateKey] = day;
    set({ logs });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  },

  clearEntry: (dateKey, prayer) => {
    const logs = { ...get().logs };
    const day = { ...(logs[dateKey] ?? {}) };
    delete day[prayer];
    logs[dateKey] = day;
    set({ logs });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  },

  getEntry: (dateKey, prayer) => {
    return get().logs[dateKey]?.[prayer] ?? null;
  },

  todayCompletedCount: () => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const day = get().logs[key] ?? {};
    return Object.keys(day).length;
  },
}));
