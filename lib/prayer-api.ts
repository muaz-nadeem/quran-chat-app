import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://api.aladhan.com/v1";
const STORAGE_KEY = "prayer_times_cache";
const MANUAL_TIMES_KEY = "prayer_manual_times";
const LOCATION_KEY = "prayer_location";

export interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface NextPrayer {
  name: string;
  time: string;
  countdownMinutes: number;
}

interface CachedPrayerData {
  date: string;
  city: string;
  country: string;
  times: PrayerTimes;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Normalize "16:45", "16:45:00", "4:05 PM" → minutes from midnight */
export function timeToMinutes(time: string): number {
  const cleaned = time.trim();
  const ampm = cleaned.match(/\b(am|pm)\b/i);
  const parts = cleaned.replace(/\s*(am|pm)\b/i, "").split(":");
  let h = Number(parts[0]);
  const m = Number(parts[1] ?? 0);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN;

  if (ampm) {
    const isPm = ampm[1].toLowerCase() === "pm";
    if (isPm && h < 12) h += 12;
    if (!isPm && h === 12) h = 0;
  }

  return h * 60 + m;
}

export function formatPrayerTime(time: string): string {
  const mins = timeToMinutes(time);
  if (!Number.isFinite(mins)) return time;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export async function getPrayerTimes(
  city: string,
  country: string
): Promise<PrayerTimes> {
  const today = todayKey();

  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const cached: CachedPrayerData = JSON.parse(stored);
      if (
        cached.date === today &&
        cached.city === city &&
        cached.country === country
      ) {
        return cached.times;
      }
    }
  } catch {
    // cache miss
  }

  const res = await fetch(
    `${BASE_URL}/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=1`
  );
  const json = await res.json();
  const t = json.data.timings;

  const times: PrayerTimes = {
    Fajr: t.Fajr.slice(0, 5),
    Dhuhr: t.Dhuhr.slice(0, 5),
    Asr: t.Asr.slice(0, 5),
    Maghrib: t.Maghrib.slice(0, 5),
    Isha: t.Isha.slice(0, 5),
  };

  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: today, city, country, times } as CachedPrayerData)
    );
  } catch {
    // non-critical
  }

  return times;
}

export async function getManualPrayerTimes(): Promise<PrayerTimes | null> {
  try {
    const saved = await AsyncStorage.getItem(MANUAL_TIMES_KEY);
    if (!saved) return null;
    return JSON.parse(saved) as PrayerTimes;
  } catch {
    return null;
  }
}

const DEFAULT_PRAYER_TIMES: PrayerTimes = {
  Fajr: "05:00",
  Dhuhr: "12:30",
  Asr: "15:45",
  Maghrib: "18:30",
  Isha: "20:00",
};

async function getAnyCachedPrayerTimes(): Promise<PrayerTimes | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const cached: CachedPrayerData = JSON.parse(stored);
    return cached.times ?? null;
  } catch {
    return null;
  }
}

/** Prefer manual overrides; otherwise saved location (or Lahore default). */
export async function getEffectivePrayerTimes(): Promise<PrayerTimes> {
  const manual = await getManualPrayerTimes();
  if (manual) return manual;

  let city = "Lahore";
  let country = "Pakistan";
  try {
    const saved = await AsyncStorage.getItem(LOCATION_KEY);
    if (saved) {
      const loc = JSON.parse(saved);
      if (loc.city) city = loc.city;
      if (loc.country) country = loc.country;
    }
  } catch {}

  return getPrayerTimes(city, country);
}

/** For notification scheduling — never throws; uses cache/defaults if API is slow. */
export async function getEffectivePrayerTimesForNotifications(): Promise<PrayerTimes> {
  const manual = await getManualPrayerTimes();
  if (manual) return manual;

  try {
    const times = await Promise.race([
      getEffectivePrayerTimes(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("prayer-times-timeout")), 8000)
      ),
    ]);
    return times;
  } catch {
    const cached = await getAnyCachedPrayerTimes();
    return cached ?? DEFAULT_PRAYER_TIMES;
  }
}

const PRAYER_ORDER: (keyof PrayerTimes)[] = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

export function getNextPrayer(times: PrayerTimes): NextPrayer {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (const name of PRAYER_ORDER) {
    const prayerMinutes = timeToMinutes(times[name]);
    if (!Number.isFinite(prayerMinutes)) continue;
    if (prayerMinutes > nowMinutes) {
      return {
        name,
        time: formatPrayerTime(times[name]),
        countdownMinutes: prayerMinutes - nowMinutes,
      };
    }
  }

  const fajrMinutes = timeToMinutes(times.Fajr);
  const safeFajr = Number.isFinite(fajrMinutes) ? fajrMinutes : 0;
  return {
    name: "Fajr",
    time: formatPrayerTime(times.Fajr),
    countdownMinutes: 24 * 60 - nowMinutes + safeFajr,
  };
}
