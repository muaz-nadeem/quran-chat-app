import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TOTAL_QURAN_PAGES } from "@/lib/quran-api";
import { refreshNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/useAuthStore";

export interface DayAssignment {
  day: number;
  startPage: number;
  endPage: number;
}

interface PlanState {
  pagesPerDay: number;
  planDays: number;
  startPage: number;
  currentDay: number;
  completedDays: number[];
  dayAssignments: DayAssignment[];
  todayPagesDone: number[];
  lastReadPage: number;
  lastReadSurah: number | null;
  lastReadAyah: number | null;
  startDate: string | null;
  streak: number;

  loadPlan: () => Promise<void>;
  initPlan: (pagesPerDay?: number, planDays?: number) => void;
  getTodayAssignment: () => DayAssignment | null;
  getTodayProgress: () => { done: number; total: number; percent: number };
  markPageRead: (page: number) => void;
  setBookmark: (page: number, surah?: number, ayah?: number) => void;
  completeDay: () => void;
  persist: () => void;
}

const PLAN_STORAGE_KEY = "reading_plan_v2";

function buildAssignments(
  pagesPerDay: number,
  planDays: number,
  startPage = 1
): DayAssignment[] {
  const assignments: DayAssignment[] = [];
  let page = startPage;
  for (let day = 1; day <= planDays; day++) {
    if (page > TOTAL_QURAN_PAGES) break;
    const end = Math.min(page + pagesPerDay - 1, TOTAL_QURAN_PAGES);
    assignments.push({ day, startPage: page, endPage: end });
    page = end + 1;
  }
  return assignments;
}

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

export const usePlanStore = create<PlanState>((set, get) => ({
  pagesPerDay: 5,
  planDays: 7,
  startPage: 1,
  currentDay: 1,
  completedDays: [],
  dayAssignments: [],
  todayPagesDone: [],
  lastReadPage: 1,
  lastReadSurah: null,
  lastReadAyah: null,
  startDate: null,
  streak: 0,

  persist: () => {
    const s = get();
    AsyncStorage.setItem(
      PLAN_STORAGE_KEY,
      JSON.stringify({
        pagesPerDay: s.pagesPerDay,
        planDays: s.planDays,
        startPage: s.startPage,
        currentDay: s.currentDay,
        completedDays: s.completedDays,
        dayAssignments: s.dayAssignments,
        todayPagesDone: s.todayPagesDone,
        lastReadPage: s.lastReadPage,
        lastReadSurah: s.lastReadSurah,
        lastReadAyah: s.lastReadAyah,
        startDate: s.startDate,
        progressDate: todayKey(),
      })
    );
  },

  loadPlan: async () => {
    try {
      const streakData = await AsyncStorage.getItem("streak_data");
      let streak = 0;
      if (streakData) {
        const { count, lastDate } = JSON.parse(streakData);
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .split("T")[0];
        if (lastDate === todayKey() || lastDate === yesterday) {
          streak = count;
        }
      }

      const stored = await AsyncStorage.getItem(PLAN_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const isNewCalendarDay = data.progressDate !== todayKey();
        let currentDay = data.currentDay ?? 1;
        let todayPagesDone: number[] = data.todayPagesDone ?? [];

        if (isNewCalendarDay) {
          // Advance to next plan day only after a new calendar day
          if ((data.completedDays ?? []).includes(currentDay)) {
            currentDay = Math.min(
              currentDay + 1,
              (data.dayAssignments ?? []).length || data.planDays || 7
            );
          }
          todayPagesDone = [];
        }

        set({
          pagesPerDay: data.pagesPerDay ?? 5,
          planDays: data.planDays ?? 7,
          startPage: data.startPage ?? 1,
          currentDay,
          completedDays: data.completedDays ?? [],
          dayAssignments:
            data.dayAssignments ??
            buildAssignments(data.pagesPerDay ?? 5, data.planDays ?? 7),
          todayPagesDone,
          lastReadPage: data.lastReadPage ?? 1,
          lastReadSurah: data.lastReadSurah ?? null,
          lastReadAyah: data.lastReadAyah ?? null,
          startDate: data.startDate,
          streak,
        });
        get().persist();
      } else {
        get().initPlan();
        set({ streak });
      }
    } catch {
      get().initPlan();
    }
  },

  initPlan: (pagesPerDayArg?, planDaysArg?) => {
    const auth = useAuthStore.getState();
    const pagesPerDay = pagesPerDayArg ?? auth.pagesPerDay ?? 5;
    const planDays = planDaysArg ?? auth.planDays ?? 7;
    const dayAssignments = buildAssignments(pagesPerDay, planDays, 1);

    set({
      pagesPerDay,
      planDays,
      startPage: 1,
      currentDay: 1,
      completedDays: [],
      dayAssignments,
      todayPagesDone: [],
      lastReadPage: 1,
      lastReadSurah: 1,
      lastReadAyah: 1,
      startDate: todayKey(),
    });
    get().persist();
  },

  getTodayAssignment: () => {
    const { dayAssignments, currentDay } = get();
    return dayAssignments.find((d) => d.day === currentDay) ?? null;
  },

  getTodayProgress: () => {
    const assignment = get().getTodayAssignment();
    if (!assignment) return { done: 0, total: 0, percent: 0 };
    const total = assignment.endPage - assignment.startPage + 1;
    const done = get().todayPagesDone.filter(
      (p) => p >= assignment.startPage && p <= assignment.endPage
    ).length;
    return {
      done,
      total,
      percent: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  },

  markPageRead: (page) => {
    const { todayPagesDone, getTodayAssignment, completedDays, currentDay } =
      get();
    const assignment = getTodayAssignment();

    get().setBookmark(page);

    if (!assignment) return;
    if (page < assignment.startPage || page > assignment.endPage) return;

    const pages = todayPagesDone.includes(page)
      ? todayPagesDone
      : [...todayPagesDone, page].sort((a, b) => a - b);

    set({ todayPagesDone: pages });
    get().persist();

    const total = assignment.endPage - assignment.startPage + 1;
    const done = pages.filter(
      (p) => p >= assignment.startPage && p <= assignment.endPage
    ).length;
    if (done >= total && !completedDays.includes(currentDay)) {
      get().completeDay();
    } else {
      refreshNotifications();
    }
  },

  setBookmark: (page, surah?, ayah?) => {
    set({
      lastReadPage: Math.min(Math.max(1, page), TOTAL_QURAN_PAGES),
      lastReadSurah: surah ?? get().lastReadSurah,
      lastReadAyah: ayah ?? get().lastReadAyah,
    });
    get().persist();
  },

  completeDay: () => {
    const { completedDays, currentDay, streak } = get();
    if (completedDays.includes(currentDay)) return;

    const newStreak = streak + 1;
    AsyncStorage.setItem(
      "streak_data",
      JSON.stringify({ count: newStreak, lastDate: todayKey() })
    );

    set({
      completedDays: [...completedDays, currentDay],
      streak: newStreak,
    });
    get().persist();
    refreshNotifications();
  },
}));
