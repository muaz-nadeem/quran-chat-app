import PrayerTrackGrid from "@/components/PrayerTrackGrid";
import HeroHeader from "@/components/ui/HeroHeader";
import GreenBackground from "@/components/ui/GreenBackground";
import { CompassIcon, MapPinIcon } from "@/components/icons";
import {
  getNextPrayer,
  getPrayerTimes,
  timeToMinutes,
  type NextPrayer,
  type PrayerTimes,
} from "@/lib/prayer-api";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";
import { refreshNotifications } from "@/lib/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const DEFAULT_CITY = "Lahore";
const DEFAULT_COUNTRY = "Pakistan";

const PRAYER_ORDER: (keyof PrayerTimes)[] = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

type TabKey = "times" | "track";

function formatCountdown(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function to12Hour(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function PrayerIcon({
  name,
  color,
  size = 20,
}: {
  name: keyof PrayerTimes;
  color: string;
  size?: number;
}) {
  const icons: Record<keyof PrayerTimes, ReactElement> = {
    Fajr: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2v3M4.93 4.93l2.12 2.12M2 12h3M4.93 19.07l2.12-2.12M12 19v3"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <Path
          d="M17.66 17.66A8 8 0 0 0 12 4a8 8 0 0 0-5.66 13.66"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <Path d="M6 20h12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    ),
    Dhuhr: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 6.34l1.41-1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M17.66 17.66l1.41 1.41"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <Path
          d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
          stroke={color}
          strokeWidth={1.8}
        />
      </Svg>
    ),
    Asr: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 3v1M18.36 5.64l-.71.71M21 12h-1M18.36 18.36l-.71-.71M12 21v-1M5.64 18.36l.71-.71M3 12h1M5.64 5.64l.71.71"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <Path
          d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          stroke={color}
          strokeWidth={1.8}
        />
      </Svg>
    ),
    Maghrib: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M17 18a5 5 0 0 0-10 0"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <Path
          d="M12 9V2M4.22 10.22l1.42 1.42M1 18h2M19.78 10.22l-1.42 1.42M21 18h2"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <Path d="M3 21h18" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    ),
    Isha: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M16 6l.7 1.56L18.27 8l-1.57.7L16 10.27l-.7-1.57L13.73 8l1.57-.44L16 6Z"
          stroke={color}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
  };
  return icons[name];
}

function LocationIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke={color}
        strokeWidth={1.8}
      />
    </Svg>
  );
}

function EditIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ClockIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path d="M12 6v6l4 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

type ThemeColors = (typeof THEME_COLORS)["light"];

export default function PrayerScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const router = useRouter();
  const themeMode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[themeMode];

  const [activeTab, setActiveTab] = useState<TabKey>(
    tab === "track" ? "track" : "times"
  );
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [next, setNext] = useState<NextPrayer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState(DEFAULT_CITY);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [showManual, setShowManual] = useState(false);
  const [manualTimes, setManualTimes] = useState<PrayerTimes | null>(null);
  const [editCity, setEditCity] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (tab === "track") setActiveTab("track");
  }, [tab]);

  const refreshNext = useCallback((t: PrayerTimes) => {
    setNext(getNextPrayer(t));
  }, []);

  const loadSavedLocation = async () => {
    try {
      const saved = await AsyncStorage.getItem("prayer_location");
      if (saved) {
        const { city: c, country: co } = JSON.parse(saved);
        setCity(c);
        setCountry(co);
        return { city: c, country: co };
      }
    } catch {}
    return { city: DEFAULT_CITY, country: DEFAULT_COUNTRY };
  };

  const loadManualTimes = async () => {
    try {
      const saved = await AsyncStorage.getItem("prayer_manual_times");
      if (saved) {
        const parsed = JSON.parse(saved) as PrayerTimes;
        setManualTimes(parsed);
        return parsed;
      }
    } catch {}
    return null;
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const manual = await loadManualTimes();
        if (manual) {
          if (cancelled) return;
          setTimes(manual);
          refreshNext(manual);
          return;
        }

        const loc = await loadSavedLocation();
        const t = await getPrayerTimes(loc.city, loc.country);
        if (cancelled) return;
        setTimes(t);
        refreshNext(t);
      } catch {
        if (!cancelled) setError("Could not load prayer times");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshNext]);

  useEffect(() => {
    if (!times) return;

    intervalRef.current = setInterval(() => refreshNext(times), 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [times, refreshNext]);

  const handleSaveLocation = async () => {
    if (!editCity.trim() || !editCountry.trim()) return;
    const c = editCity.trim();
    const co = editCountry.trim();
    await AsyncStorage.setItem(
      "prayer_location",
      JSON.stringify({ city: c, country: co })
    );
    await AsyncStorage.removeItem("prayer_manual_times");
    setCity(c);
    setCountry(co);
    setManualTimes(null);
    setShowManual(false);
    try {
      const t = await getPrayerTimes(c, co);
      setTimes(t);
      refreshNext(t);
      setError(null);
      await refreshNotifications();
    } catch {
      setError("Could not load prayer times for this location");
    }
  };

  const handleSaveManualTimes = async (newTimes: PrayerTimes) => {
    await AsyncStorage.setItem("prayer_manual_times", JSON.stringify(newTimes));
    setManualTimes(newTimes);
    setTimes(newTimes);
    refreshNext(newTimes);
    setShowManual(false);
    await refreshNotifications();
  };

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <GreenBackground>
    <SafeAreaView
      className="flex-1"
      edges={["left", "right"]}
    >
      <ManualTimesModal
        visible={showManual}
        onClose={() => setShowManual(false)}
        city={city}
        country={country}
        editCity={editCity}
        editCountry={editCountry}
        setEditCity={setEditCity}
        setEditCountry={setEditCountry}
        currentTimes={times}
        colors={colors}
        onSaveLocation={handleSaveLocation}
        onSaveManualTimes={handleSaveManualTimes}
      />

      <HeroHeader
        title="Prayer"
        subtitle={next ? `${next.name} in ${formatCountdown(next.countdownMinutes)}` : "Salah times & tracking"}
        compact
        blend
      />

      <View className="flex-1">
      {/* segment control */}
      <View className="px-6 pt-5 pb-3">
        <View
          className="flex-row rounded-2xl p-1"
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
            borderColor: colors.gold,
          }}
        >
          {(
            [
              { key: "times" as TabKey, label: "Salah Times" },
              { key: "track" as TabKey, label: "Track" },
            ] as const
          ).map(({ key, label }) => {
            const selected = activeTab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setActiveTab(key)}
                className={`flex-1 py-3 rounded-xl items-center active:opacity-80 ${
                  selected ? "" : ""
                }`}
                style={{
                  backgroundColor: selected ? colors.gold : "transparent",
                }}
              >
                <Text
                  className="font-semibold text-sm"
                  style={{
                    color: selected ? colors.heroStart : colors.textOnGreenMuted,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {activeTab === "track" ? (
        <PrayerTrackGrid />
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pb-1">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <LocationIcon color={colors.gold} size={14} />
                  <Text
                    className="text-sm font-medium ml-1.5"
                    style={{ color: colors.gold }}
                  >
                    {manualTimes ? "Manual Times" : `${city}, ${country}`}
                  </Text>
                </View>
                <Text
                  className="text-sm mt-0.5"
                  style={{ color: colors.textOnGreenMuted }}
                >
                  {todayDate}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setEditCity(city);
                  setEditCountry(country);
                  setShowManual(true);
                }}
                className="w-10 h-10 rounded-full items-center justify-center active:opacity-70"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.surfaceLight,
                }}
              >
                <EditIcon color={colors.emerald} size={17} />
              </Pressable>
            </View>
          </View>

          {error && (
            <View
              className="mx-6 mt-4 rounded-2xl p-4"
              style={{ backgroundColor: `${colors.danger}18` }}
            >
              <Text
                className="text-center text-sm"
                style={{ color: colors.danger }}
              >
                {error}
              </Text>
            </View>
          )}

          {!times && !error && (
            <View className="items-center justify-center py-24">
              <ActivityIndicator size="large" color={colors.emerald} />
              <Text
                className="mt-3 text-sm"
                style={{ color: colors.textSecondary }}
              >
                Loading prayer times…
              </Text>
            </View>
          )}

          {times && next && (
            <View className="px-6 pt-5 pb-8">
              {/* Next prayer countdown card */}
              <View
                className="rounded-3xl p-6 mb-7 items-center overflow-hidden"
                style={{ backgroundColor: colors.emeraldDark }}
              >
                <View className="flex-row items-center mb-3">
                  <ClockIcon color="rgba(255,255,255,0.7)" size={16} />
                  <Text className="text-white/70 text-xs font-semibold uppercase tracking-[2px] ml-2">
                    Next Prayer
                  </Text>
                </View>

                <Text className="text-white text-[32px] font-bold">
                  {next.name}
                </Text>

                <View className="w-12 h-[1px] bg-white/20 my-3" />

                <Text
                  className="text-lg font-semibold"
                  style={{ color: colors.emeraldLight }}
                >
                  {to12Hour(next.time)}
                </Text>
                <View className="bg-white/10 rounded-full px-5 py-1.5 mt-3">
                  <Text className="text-white/90 text-sm font-medium">
                    {formatCountdown(next.countdownMinutes)} remaining
                  </Text>
                </View>
              </View>

              {/* Prayer list */}
              <View
                className="rounded-3xl overflow-hidden"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.surfaceLight,
                }}
              >
                {PRAYER_ORDER.map((key, index) => {
                  const isNext = key === next.name;
                  const isLast = index === PRAYER_ORDER.length - 1;

                  return (
                    <View key={key}>
                      <View
                        className="flex-row items-center px-5 py-4"
                        style={{
                          backgroundColor: isNext
                            ? `${colors.emerald}14`
                            : "transparent",
                        }}
                      >
                        {isNext && (
                          <View
                            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                            style={{ backgroundColor: colors.emeraldDark }}
                          />
                        )}

                        <View
                          className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                          style={{
                            backgroundColor: isNext
                              ? `${colors.emerald}26`
                              : colors.background,
                          }}
                        >
                          <PrayerIcon
                            name={key}
                            color={isNext ? colors.emerald : colors.muted}
                            size={20}
                          />
                        </View>

                        <Text
                          className="flex-1 text-[15px] font-semibold"
                          style={{
                            color: isNext ? colors.emerald : colors.textPrimary,
                          }}
                        >
                          {key}
                        </Text>

                        <Text
                          className="text-[15px] font-bold tabular-nums"
                          style={{
                            color: isNext ? colors.emerald : colors.textPrimary,
                          }}
                        >
                          {to12Hour(times[key])}
                        </Text>
                      </View>

                      {!isLast && (
                        <View
                          className="h-[1px] mx-5"
                          style={{ backgroundColor: colors.surfaceLight }}
                        />
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Prayer tools */}
              <Text
                className="text-lg mb-3"
                style={{
                  fontFamily: "LibreBaskerville_700Bold",
                  color: colors.gold,
                }}
              >
                Tools
              </Text>
              <View className="flex-row mb-4" style={{ gap: 10 }}>
                <Pressable
                  onPress={() => router.push("/qibla" as never)}
                  className="flex-1 active:opacity-80 rounded-2xl p-4"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.gold,
                  }}
                >
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mb-2"
                    style={{ backgroundColor: colors.surfaceTint }}
                  >
                    <CompassIcon color={colors.emerald} size={20} />
                  </View>
                  <Text className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
                    Qibla
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                    Find direction
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push("/mosques/index" as never)}
                  className="flex-1 active:opacity-80 rounded-2xl p-4"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.gold,
                  }}
                >
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mb-2"
                    style={{ backgroundColor: colors.surfaceTintGold }}
                  >
                    <MapPinIcon color={colors.gold} size={20} />
                  </View>
                  <Text className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
                    Mosques
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                    Nearby
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>
      )}
      </View>
    </SafeAreaView>
    </GreenBackground>
  );
}

function ManualTimesModal({
  visible,
  onClose,
  city,
  country,
  editCity,
  editCountry,
  setEditCity,
  setEditCountry,
  currentTimes,
  colors,
  onSaveLocation,
  onSaveManualTimes,
}: {
  visible: boolean;
  onClose: () => void;
  city: string;
  country: string;
  editCity: string;
  editCountry: string;
  setEditCity: (v: string) => void;
  setEditCountry: (v: string) => void;
  currentTimes: PrayerTimes | null;
  colors: ThemeColors;
  onSaveLocation: () => void;
  onSaveManualTimes: (t: PrayerTimes) => void;
}) {
  const [mode, setMode] = useState<"location" | "manual">("location");
  const [fajr, setFajr] = useState("");
  const [dhuhr, setDhuhr] = useState("");
  const [asr, setAsr] = useState("");
  const [maghrib, setMaghrib] = useState("");
  const [isha, setIsha] = useState("");

  useEffect(() => {
    if (visible && currentTimes) {
      setFajr(currentTimes.Fajr);
      setDhuhr(currentTimes.Dhuhr);
      setAsr(currentTimes.Asr);
      setMaghrib(currentTimes.Maghrib);
      setIsha(currentTimes.Isha);
    }
  }, [visible, currentTimes]);

  const handleSaveManual = () => {
    if (!fajr || !dhuhr || !asr || !maghrib || !isha) {
      Alert.alert(
        "Missing Times",
        "Please fill in all prayer times (HH:MM format)"
      );
      return;
    }
    const normalize = (t: string) => {
      const mins = timeToMinutes(t);
      if (!Number.isFinite(mins)) return t.trim();
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };
    onSaveManualTimes({
      Fajr: normalize(fajr),
      Dhuhr: normalize(dhuhr),
      Asr: normalize(asr),
      Maghrib: normalize(maghrib),
      Isha: normalize(isha),
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <View
          className="rounded-t-[28px] px-6 pt-3 pb-10"
          style={{ backgroundColor: colors.background }}
        >
          <View className="items-center mb-4">
            <View
              className="w-10 h-1 rounded-full"
              style={{ backgroundColor: colors.surfaceLight }}
            />
          </View>

          <View className="flex-row justify-between items-center mb-6">
            <Text
              className="text-xl font-bold"
              style={{ color: colors.textPrimary }}
            >
              Prayer Time Settings
            </Text>
            <Pressable
              onPress={onClose}
              className="w-8 h-8 rounded-full items-center justify-center active:opacity-70"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.surfaceLight,
              }}
            >
              <Text style={{ color: colors.textSecondary }} className="text-sm">
                ✕
              </Text>
            </Pressable>
          </View>

          <View
            className="flex-row rounded-2xl p-1 mb-6"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.surfaceLight,
            }}
          >
            <Pressable
              onPress={() => setMode("location")}
              className="flex-1 py-3 rounded-xl items-center"
              style={{
                backgroundColor:
                  mode === "location" ? colors.emeraldDark : "transparent",
              }}
            >
              <Text
                className="font-semibold text-sm"
                style={{
                  color: mode === "location" ? "#FFFFFF" : colors.textSecondary,
                }}
              >
                By Location
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("manual")}
              className="flex-1 py-3 rounded-xl items-center"
              style={{
                backgroundColor:
                  mode === "manual" ? colors.emeraldDark : "transparent",
              }}
            >
              <Text
                className="font-semibold text-sm"
                style={{
                  color: mode === "manual" ? "#FFFFFF" : colors.textSecondary,
                }}
              >
                Set Manually
              </Text>
            </Pressable>
          </View>

          {mode === "location" ? (
            <View>
              <Text
                className="text-xs font-medium uppercase tracking-wider mb-2 ml-1"
                style={{ color: colors.textSecondary }}
              >
                City
              </Text>
              <TextInput
                value={editCity}
                onChangeText={setEditCity}
                placeholder="e.g. Lahore"
                placeholderTextColor={colors.muted}
                className="rounded-2xl px-4 py-3.5 text-base mb-4"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.surfaceLight,
                  color: colors.textPrimary,
                }}
              />
              <Text
                className="text-xs font-medium uppercase tracking-wider mb-2 ml-1"
                style={{ color: colors.textSecondary }}
              >
                Country
              </Text>
              <TextInput
                value={editCountry}
                onChangeText={setEditCountry}
                placeholder="e.g. Pakistan"
                placeholderTextColor={colors.muted}
                className="rounded-2xl px-4 py-3.5 text-base mb-6"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.surfaceLight,
                  color: colors.textPrimary,
                }}
              />
              <Pressable
                onPress={onSaveLocation}
                className="rounded-2xl py-4 items-center active:opacity-80"
                style={{ backgroundColor: colors.emeraldDark }}
              >
                <Text className="text-white font-bold text-base">
                  Fetch Prayer Times
                </Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <Text
                className="text-xs font-medium uppercase tracking-wider mb-3 ml-1"
                style={{ color: colors.textSecondary }}
              >
                Enter times in 24h format (HH:MM)
              </Text>
              <View
                className="rounded-2xl overflow-hidden mb-5"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.surfaceLight,
                }}
              >
                {[
                  { label: "Fajr", value: fajr, set: setFajr },
                  { label: "Dhuhr", value: dhuhr, set: setDhuhr },
                  { label: "Asr", value: asr, set: setAsr },
                  { label: "Maghrib", value: maghrib, set: setMaghrib },
                  { label: "Isha", value: isha, set: setIsha },
                ].map((p, i, arr) => (
                  <View key={p.label}>
                    <View className="flex-row items-center px-4 py-3">
                      <Text
                        className="font-medium w-24 text-[15px]"
                        style={{ color: colors.textPrimary }}
                      >
                        {p.label}
                      </Text>
                      <TextInput
                        value={p.value}
                        onChangeText={p.set}
                        placeholder="HH:MM"
                        placeholderTextColor={colors.muted}
                        keyboardType="numbers-and-punctuation"
                        className="flex-1 rounded-xl px-4 py-2.5 text-base text-right"
                        style={{
                          backgroundColor: colors.background,
                          color: colors.textPrimary,
                        }}
                      />
                    </View>
                    {i < arr.length - 1 && (
                      <View
                        className="h-[1px] mx-4"
                        style={{ backgroundColor: colors.surfaceLight }}
                      />
                    )}
                  </View>
                ))}
              </View>
              <Pressable
                onPress={handleSaveManual}
                className="rounded-2xl py-4 items-center active:opacity-80"
                style={{ backgroundColor: colors.emeraldDark }}
              >
                <Text className="text-white font-bold text-base">
                  Save Manual Times
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
