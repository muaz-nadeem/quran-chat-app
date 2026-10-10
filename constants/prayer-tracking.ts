export type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

export type PrayerStatus = "jamaah" | "ontime" | "late" | "missed";

export const PRAYER_NAMES: PrayerName[] = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

export const PRAYER_STATUSES: {
  id: PrayerStatus;
  label: string;
  color: string;
  icon: string;
}[] = [
  { id: "jamaah", label: "In Jamaah", color: "#2D6A4F", icon: "👥" },
  { id: "ontime", label: "On Time", color: "#B08D57", icon: "🧍" },
  { id: "late", label: "Late", color: "#A05A3C", icon: "🕐" },
  { id: "missed", label: "Missed", color: "#C45C5C", icon: "🚫" },
];

export const PRAYER_REASONS = [
  "Alarm",
  "Appointment",
  "Caregiving",
  "Education",
  "Emergency",
  "Family/Friends",
  "Gaming",
  "Guests",
  "Health",
  "Leisure",
  "Other",
  "Shopping",
  "Sleep",
  "Sports",
  "Travel",
  "TV",
  "Work",
] as const;

export function statusColor(status: PrayerStatus | null | undefined): string {
  if (!status) return "transparent";
  return PRAYER_STATUSES.find((s) => s.id === status)?.color ?? "#6B7368";
}

export function formatTrackDate(dateKey: string): { label: string; weekday: string } {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const label = `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${String(y).slice(-2)}`;
  return { label, weekday };
}

export function dateKeyFromDate(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Dates from onboard day through today (inclusive), newest first.
 * Never includes days before onboarding.
 */
export function trackDateKeys(onboardedAt: string): string[] {
  const today = dateKeyFromDate();
  const start = onboardedAt && onboardedAt <= today ? onboardedAt : today;
  const keys: string[] = [];
  const cursor = parseDateKey(today);
  const startDate = parseDateKey(start);

  while (cursor >= startDate) {
    keys.push(dateKeyFromDate(cursor));
    cursor.setDate(cursor.getDate() - 1);
  }
  return keys;
}
