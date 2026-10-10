import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, Platform } from "react-native";
import {
  getEffectivePrayerTimesForNotifications,
  timeToMinutes,
} from "@/lib/prayer-api";

let Notifications: typeof import("expo-notifications") | null = null;

const READING_CHANNEL = "reading-reminders";
/** Bump channel id whenever sound/config changes — Android locks channel sound forever. */
const PRAYER_ADHAN_CHANNEL = "prayer-adhan-v3";
const PRAYER_SYSTEM_CHANNEL = "prayer-system-v2";
const ADHAN_SOUND = "adhan.wav";
const PRAYER_SOUND_KEY = "prayer_notification_sound";

export type PrayerSoundMode = "adhan" | "system";

const READING_IDS = [
  "reading-morning",
  "reading-midday",
  "reading-evening",
] as const;
const PRAYER_IDS = [
  "prayer-fajr",
  "prayer-dhuhr",
  "prayer-asr",
  "prayer-maghrib",
  "prayer-isha",
] as const;

const READING_SLOTS = [
  {
    id: "reading-morning" as const,
    hour: 10,
    minute: 0,
    title: "Start your day with the Quran 📖",
    body: "Begin your daily reading and move closer to your goal.",
  },
  {
    id: "reading-midday" as const,
    hour: 14,
    minute: 0,
    title: "Half the day is gone ⏳",
    body: "You still have Quran pages left today. Keep your streak alive.",
  },
  {
    id: "reading-evening" as const,
    hour: 22,
    minute: 0,
    title: "Day is ending soon 🌙",
    body: "Finish today's reading task before the day ends.",
  },
];

try {
  Notifications = require("expo-notifications");
  Notifications?.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  // expo-notifications unavailable (e.g. Expo Go on SDK 53+)
}

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

export function areNotificationsSupported(): boolean {
  return Platform.OS !== "web" && Notifications != null;
}

export async function getPrayerSoundMode(): Promise<PrayerSoundMode> {
  try {
    const stored = await AsyncStorage.getItem(PRAYER_SOUND_KEY);
    return stored === "system" ? "system" : "adhan";
  } catch {
    return "adhan";
  }
}

export async function setPrayerSoundMode(mode: PrayerSoundMode): Promise<void> {
  await AsyncStorage.setItem(PRAYER_SOUND_KEY, mode);
  const enabled = await AsyncStorage.getItem("notifications_enabled");
  if (enabled === "true") {
    // Don't block Settings UI on reschedule
    void refreshNotifications();
  }
}

export async function setupNotificationChannels() {
  if (!Notifications || Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(READING_CHANNEL, {
    name: "Reading reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: "default",
    vibrationPattern: [0, 200, 100, 200],
    enableVibrate: true,
  });

  await Notifications.setNotificationChannelAsync(PRAYER_ADHAN_CHANNEL, {
    name: "Prayer adhan",
    importance: Notifications.AndroidImportance.MAX,
    sound: ADHAN_SOUND,
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.ALARM,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
    },
    vibrationPattern: [0, 500, 200, 500, 200, 500],
    enableVibrate: true,
    bypassDnd: false,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });

  await Notifications.setNotificationChannelAsync(PRAYER_SYSTEM_CHANNEL, {
    name: "Prayer reminders",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 400, 150, 400],
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web" || !Notifications) return false;

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;

    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    });
    return status === "granted";
  } catch {
    return false;
  }
}

/** True when today's assigned pages are all marked read */
export async function isTodayReadingComplete(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem("reading_plan_v2");
    if (!stored) return false;

    const data = JSON.parse(stored);
    if (data.progressDate !== todayKey()) return false;

    const assignment = (data.dayAssignments ?? []).find(
      (d: { day: number }) => d.day === data.currentDay
    );
    if (!assignment) return false;

    const pages: number[] = data.todayPagesDone ?? [];
    const done = pages.filter(
      (p: number) => p >= assignment.startPage && p <= assignment.endPage
    ).length;
    const total = assignment.endPage - assignment.startPage + 1;

    return (
      done >= total || (data.completedDays ?? []).includes(data.currentDay)
    );
  } catch {
    return false;
  }
}

/** Only used when disabling all notifications */
async function cancelReadingReminders() {
  if (!Notifications) return;
  for (const id of READING_IDS) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {}
  }
}

export async function scheduleReadingReminders() {
  if (!Notifications) return;

  for (const slot of READING_SLOTS) {
    try {
      await Notifications.cancelScheduledNotificationAsync(slot.id);
      await Notifications.scheduleNotificationAsync({
        identifier: slot.id,
        content: {
          title: slot.title,
          body: slot.body,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: slot.hour,
          minute: slot.minute,
          ...(Platform.OS === "android" ? { channelId: READING_CHANNEL } : {}),
        },
      });
    } catch {}
  }
}

export async function schedulePrayerAlarm(
  prayerName: string,
  hour: number,
  minute: number,
  soundMode: PrayerSoundMode
) {
  if (!Notifications) return;

  const useAdhan = soundMode === "adhan";
  const channelId = useAdhan ? PRAYER_ADHAN_CHANNEL : PRAYER_SYSTEM_CHANNEL;
  const id = `prayer-${prayerName.toLowerCase()}`;

  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {}

  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: `${prayerName} Prayer 🕌`,
      body: `It's time for ${prayerName}. Answer the call to prayer.`,
      ...(Platform.OS === "android"
        ? {
            // Do NOT set sound here on Android 8+ — it overrides channel sound.
            priority: (useAdhan ? "max" : "high") as "max" | "high",
            vibrate: useAdhan
              ? [0, 500, 200, 500, 200, 500]
              : [0, 400, 150, 400],
          }
        : {
            sound: useAdhan ? ADHAN_SOUND : "default",
            interruptionLevel: (useAdhan ? "timeSensitive" : "active") as
              | "timeSensitive"
              | "active",
          }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      // Critical on Android 8+: channel (and its custom sound) is chosen here.
      ...(Platform.OS === "android" ? { channelId } : {}),
    },
  });
}

export async function scheduleAllPrayerReminders() {
  if (!Notifications) return;

  const times = await getEffectivePrayerTimesForNotifications();
  const soundMode = await getPrayerSoundMode();

  for (const name of ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const) {
    const mins = timeToMinutes(times[name]);
    if (!Number.isFinite(mins)) continue;

    try {
      await schedulePrayerAlarm(
        name,
        Math.floor(mins / 60),
        mins % 60,
        soundMode
      );
    } catch {}
  }
}

/** Re-sync all reminders based on current state & prayer times */
export async function refreshNotifications() {
  if (!Notifications) return;

  const enabled = await AsyncStorage.getItem("notifications_enabled");
  if (enabled !== "true") return;

  try {
    await setupNotificationChannels();

    // Always keep reading reminders active — they're DAILY repeating triggers.
    // If we cancel them on completion, they won't fire the next day either
    // (unless the user opens the app again).
    await scheduleReadingReminders();

    await scheduleAllPrayerReminders();
  } catch {}
}

/**
 * Request permission + mark enabled immediately.
 * Heavy scheduling runs in the background so Settings/onboarding stay snappy.
 */
export async function enableAllReminders(): Promise<boolean> {
  if (Platform.OS === "web" || !Notifications) return false;

  const granted = await requestNotificationPermissions();
  if (!granted) return false;

  await AsyncStorage.setItem("notifications_enabled", "true");
  void refreshNotifications();
  return true;
}

export async function disableAllReminders() {
  await AsyncStorage.setItem("notifications_enabled", "false");
  void cancelAllNotifications();
}

export async function cancelAllNotifications() {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

/** Call once on app start — sets up channels and refreshes if enabled */
export async function initNotifications() {
  if (!areNotificationsSupported()) return;

  try {
    await setupNotificationChannels();
    const enabled = await AsyncStorage.getItem("notifications_enabled");
    if (enabled === "true") {
      void refreshNotifications();
    }
  } catch {}
}

/** Re-check reading reminders when app returns to foreground */
export function attachNotificationRefreshListener() {
  if (!areNotificationsSupported()) return () => {};

  const sub = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      void refreshNotifications();
    }
  });

  return () => sub.remove();
}

// Legacy exports kept for any remaining imports
export async function scheduleDailyVerseNotification() {
  /* replaced by reading-morning slot */
}
export async function scheduleDailyPlanReminder() {
  /* replaced by reading slots */
}
