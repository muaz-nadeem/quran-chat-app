import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  PRAYER_REASONS,
  PRAYER_STATUSES,
  formatTrackDate,
  type PrayerName,
  type PrayerStatus,
} from "@/constants/prayer-tracking";
import { usePrayerLogStore } from "@/stores/usePrayerLogStore";

interface Props {
  visible: boolean;
  dateKey: string;
  prayer: PrayerName;
  onClose: () => void;
}

export default function MarkPrayerModal({
  visible,
  dateKey,
  prayer,
  onClose,
}: Props) {
  const getEntry = usePrayerLogStore((s) => s.getEntry);
  const setPrayerEntry = usePrayerLogStore((s) => s.setPrayerEntry);

  const [status, setStatus] = useState<PrayerStatus | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!visible) return;
    const existing = getEntry(dateKey, prayer);
    setStatus(existing?.status ?? null);
    setReasons(existing?.reasons ?? []);
    setNotes(existing?.notes ?? "");
  }, [visible, dateKey, prayer]);

  const { label, weekday } = formatTrackDate(dateKey);

  const toggleReason = (r: string) => {
    setReasons((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const handleSave = () => {
    if (!status) return;
    setPrayerEntry(dateKey, prayer, { status, reasons, notes: notes.trim() });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-surface rounded-t-[28px] px-5 pt-3 pb-10 max-h-[92%]">
          <View className="items-center mb-4">
            <View className="w-10 h-1 rounded-full bg-surface-light" />
          </View>

          <View className="flex-row items-start justify-between mb-5">
            <Text
              className="flex-1 text-[22px] leading-8 pr-3 text-text-primary"
              style={{ fontFamily: "LibreBaskerville_700Bold" }}
            >
              How did you pray {prayer} on {label}?
            </Text>
            <Pressable
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-surface-light items-center justify-center"
            >
              <Text className="text-text-secondary">✕</Text>
            </Pressable>
          </View>

          <Text className="text-xs mb-4 text-text-secondary">{weekday}</Text>

          <View className="flex-row mb-6" style={{ gap: 8 }}>
            {PRAYER_STATUSES.map((s) => {
              const selected = status === s.id;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setStatus(s.id)}
                  className="flex-1 rounded-2xl py-4 items-center active:opacity-90"
                  style={{
                    backgroundColor: s.color,
                    opacity: selected || !status ? 1 : 0.55,
                    borderWidth: selected ? 2 : 0,
                    borderColor: "#FFFFFF",
                  }}
                >
                  <Text className="text-lg mb-1">{s.icon}</Text>
                  <Text className="text-white text-[11px] font-bold text-center">
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 280 }}>
            <Text className="text-base font-bold mb-3 text-text-primary">
              Reasons:
            </Text>
            <View className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
              {PRAYER_REASONS.map((r) => {
                const selected = reasons.includes(r);
                return (
                  <Pressable
                    key={r}
                    onPress={() => toggleReason(r)}
                    className={`rounded-full px-3.5 py-2 border ${
                      selected
                        ? "bg-deep-green border-deep-green"
                        : "bg-surface border-surface-light"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        selected ? "text-white" : "text-text-secondary"
                      }`}
                    >
                      {r}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes"
              placeholderTextColor="#9CA39A"
              multiline
              className="rounded-2xl px-4 py-3.5 text-[15px] mb-5 min-h-[88px] bg-surface border border-surface-light text-text-primary"
              style={{ textAlignVertical: "top" }}
            />
          </ScrollView>

          <Pressable
            onPress={handleSave}
            disabled={!status}
            className={`rounded-2xl py-4 items-center active:opacity-80 mt-2 ${
              status ? "bg-deep-green" : "bg-surface-light"
            }`}
          >
            <Text
              className={`font-bold text-base ${
                status ? "text-white" : "text-muted"
              }`}
            >
              Save
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
