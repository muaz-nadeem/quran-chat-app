import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  PRAYER_NAMES,
  dateKeyFromDate,
  formatTrackDate,
  trackDateKeys,
  statusColor,
  type PrayerName,
} from "@/constants/prayer-tracking";
import { usePrayerLogStore } from "@/stores/usePrayerLogStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";
import MarkPrayerModal from "@/components/MarkPrayerModal";
import Svg, { Path } from "react-native-svg";

function PencilIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function PrayerTrackGrid() {
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];
  const logs = usePrayerLogStore((s) => s.logs);
  const loadLogs = usePrayerLogStore((s) => s.loadLogs);
  const onboardedAt = useAuthStore((s) => s.onboardedAt);

  const [modal, setModal] = useState<{
    dateKey: string;
    prayer: PrayerName;
  } | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const startKey = onboardedAt || dateKeyFromDate();
  const dates = useMemo(() => trackDateKeys(startKey), [startKey]);

  const todayKey = dateKeyFromDate();
  const todayCount = PRAYER_NAMES.filter((p) => logs[todayKey]?.[p]).length;

  return (
    <View className="flex-1">
      <View className="px-5 mb-4 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text
            className="text-2xl"
            style={{
              fontFamily: "LibreBaskerville_700Bold",
              color: colors.textOnGreen,
            }}
          >
            Track prayers
          </Text>
          <Text className="text-sm mt-1" style={{ color: colors.textOnGreenMuted }}>
            Tap a cell to mark how you prayed
          </Text>
        </View>
        <View
          className="rounded-full px-3 py-1.5 flex-row items-center"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.gold,
          }}
        >
          <Text className="font-bold" style={{ color: colors.emerald }}>
            {todayCount}/5
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-5 mb-4"
        contentContainerStyle={{ gap: 10, paddingRight: 24 }}
      >
        {[
          { c: "#2D6A4F", l: "Jamaah" },
          { c: "#B08D57", l: "On time" },
          { c: "#A05A3C", l: "Late" },
          { c: "#C45C5C", l: "Missed" },
        ].map((x) => (
          <View key={x.l} className="flex-row items-center">
            <View
              className="w-3.5 h-3.5 rounded-md mr-1.5"
              style={{ backgroundColor: x.c }}
            />
            <Text className="text-xs" style={{ color: colors.textOnGreenMuted }}>
              {x.l}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View
        className="mx-4 mb-2 rounded-2xl overflow-hidden flex-1"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.surfaceLight,
        }}
      >
        <View
          className="flex-row items-center px-3 py-3 border-b"
          style={{
            backgroundColor: colors.surfaceTint,
            borderColor: colors.surfaceLight,
          }}
        >
          <View style={{ width: 108 }} />
          {PRAYER_NAMES.map((p) => (
            <View key={p} className="flex-1 items-center">
              <Text
                className="text-[10px] font-bold uppercase"
                style={{ color: colors.textSecondary }}
                numberOfLines={1}
              >
                {p.slice(0, 3)}
              </Text>
            </View>
          ))}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {dates.map((dateKey) => {
            const { label, weekday } = formatTrackDate(dateKey);
            const isToday = dateKey === todayKey;
            return (
              <View
                key={dateKey}
                className="flex-row items-center px-3 py-3 border-b"
                style={{ borderColor: colors.surfaceLight }}
              >
                <Pressable
                  onPress={() => setModal({ dateKey, prayer: "Fajr" })}
                  className="flex-row items-center pr-1"
                  style={{ width: 108 }}
                >
                  <View className="mr-1.5 opacity-60">
                    <PencilIcon color="#6B7368" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-[12px] font-semibold"
                      style={{
                        color: isToday ? colors.gold : colors.textPrimary,
                      }}
                      numberOfLines={1}
                    >
                      {label}
                    </Text>
                    <Text
                      className="text-[10px]"
                      style={{ color: colors.textSecondary }}
                      numberOfLines={1}
                    >
                      {weekday}
                    </Text>
                  </View>
                </Pressable>

                {PRAYER_NAMES.map((prayer) => {
                  const entry = logs[dateKey]?.[prayer];
                  return (
                    <Pressable
                      key={prayer}
                      onPress={() => setModal({ dateKey, prayer })}
                      className="flex-1 items-center py-1 active:opacity-70"
                    >
                      <View
                        className={`w-8 h-8 rounded-lg items-center justify-center border ${
                          entry ? "border-transparent" : "border-surface-light bg-cream"
                        }`}
                        style={
                          entry
                            ? { backgroundColor: statusColor(entry.status) }
                            : undefined
                        }
                      >
                        {entry ? (
                          <Text className="text-white text-[10px] font-bold">
                            {entry.status === "jamaah"
                              ? "J"
                              : entry.status === "ontime"
                                ? "✓"
                                : entry.status === "late"
                                  ? "L"
                                  : "✕"}
                          </Text>
                        ) : (
                          <Text className="text-muted text-xs">+</Text>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {modal && (
        <MarkPrayerModal
          visible
          dateKey={modal.dateKey}
          prayer={modal.prayer}
          onClose={() => setModal(null)}
        />
      )}
    </View>
  );
}
