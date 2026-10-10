import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";
import ScreenShell from "@/components/ui/ScreenShell";
import {
  areNotificationsSupported,
  disableAllReminders,
  enableAllReminders,
  getPrayerSoundMode,
  setPrayerSoundMode,
  type PrayerSoundMode,
} from "@/lib/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

function SettingsCard({
  title,
  subtitle,
  onPress,
  right,
  danger,
}: {
  title: string;
  subtitle: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}) {
  const content = (
    <View className="bg-surface rounded-2xl px-5 py-4 border border-surface-light mb-3">
      <View className="flex-row items-center">
        <View className="flex-1 pr-3">
          <Text
            className={`text-[16px] font-semibold mb-1 ${
              danger ? "text-danger" : "text-text-primary"
            }`}
          >
            {title}
          </Text>
          <Text className="text-[13px] text-text-secondary leading-5">
            {subtitle}
          </Text>
        </View>
        {right ?? (
          onPress ? (
            <Text className="text-muted text-xl font-light">›</Text>
          ) : null
        )}
      </View>
    </View>
  );

  if (onPress && !right) {
    return (
      <Pressable onPress={onPress} className="active:opacity-70">
        {content}
      </Pressable>
    );
  }

  return content;
}

export default function SettingsScreen() {
  const router = useRouter();
  const displayName = useAuthStore((s) => s.displayName);
  const setDisplayName = useAuthStore((s) => s.setDisplayName);
  const onboardedAt = useAuthStore((s) => s.onboardedAt);
  const setOnboardedAt = useAuthStore((s) => s.setOnboardedAt);
  const signOut = useAuthStore((s) => s.signOut);
  const conversations = useChatStore((s) => s.conversations);
  const clearAllConversations = useChatStore((s) => s.clearAllConversations);

  const themeMode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[themeMode];
  const setThemeMode = useThemeStore((s) => s.setMode);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(displayName);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [prayerSoundMode, setPrayerSoundModeState] =
    useState<PrayerSoundMode>("adhan");
  const [showStartDate, setShowStartDate] = useState(false);
  const [startDateDraft, setStartDateDraft] = useState(onboardedAt ?? "");

  const notificationsSupported = areNotificationsSupported();

  useEffect(() => {
    AsyncStorage.getItem("notifications_enabled").then((val) => {
      setNotificationsEnabled(val === "true");
    });
    getPrayerSoundMode().then(setPrayerSoundModeState);
  }, []);

  useEffect(() => {
    setStartDateDraft(onboardedAt ?? "");
  }, [onboardedAt]);

  const toggleNotifications = async (value: boolean) => {
    if (value) {
      if (!notificationsSupported) {
        Alert.alert(
          "Not available here",
          "Prayer and daily reminders need a development build. Expo Go (SDK 53+) no longer supports push/local notifications."
        );
        return;
      }
      // Flip UI immediately — scheduling runs in the background.
      setNotificationsEnabled(true);
      const ok = await enableAllReminders();
      if (!ok) {
        setNotificationsEnabled(false);
        Alert.alert(
          "Permission needed",
          "Allow notifications in your system settings to get prayer reminders."
        );
        return;
      }
      Alert.alert(
        "Reminders on",
        "Morning, midday & evening reading nudges plus prayer reminders at salah time."
      );
    } else {
      setNotificationsEnabled(false);
      void disableAllReminders();
    }
  };

  const handlePrayerSoundChange = async (mode: PrayerSoundMode) => {
    if (mode === prayerSoundMode) return;
    setPrayerSoundModeState(mode);
    await setPrayerSoundMode(mode);
  };

  const handleSaveName = async () => {
    setDisplayName(editedName);
    await AsyncStorage.setItem("displayName", editedName);
    setIsEditingName(false);
  };

  const handleSaveStartDate = async () => {
    const draft = startDateDraft.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft)) {
      Alert.alert("Invalid date", "Use format YYYY-MM-DD (e.g. 2026-07-17)");
      return;
    }
    await setOnboardedAt(draft);
    setShowStartDate(false);
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear All Conversations",
      "This will permanently delete all your conversations. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: clearAllConversations,
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      "Reset & Start Over",
      "This will clear all your data and take you back to the beginning. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await clearAllConversations();
            await signOut();
            router.replace("/(onboarding)");
          },
        },
      ]
    );
  };

  const formatStartDate = (key: string | null) => {
    if (!key) return "Not set";
    const [y, m, d] = key.split("-");
    return `${d}.${m}.${y?.slice(-2)}`;
  };

  return (
    <>
    <ScreenShell
      title="Profile"
      subtitle={displayName || "Your settings"}
      compactHero
    >
        {/* Profile card */}
        <View className="mb-2">
          <View
            className="rounded-2xl px-5 py-4 mb-3"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.surfaceLight,
            }}
          >
            {isEditingName ? (
              <View>
                <Text className="text-[16px] font-semibold text-text-primary mb-1">
                  Display name
                </Text>
                <Text className="text-[13px] text-text-secondary mb-3">
                  How we greet you in the app
                </Text>
                <View className="flex-row items-center">
                  <TextInput
                    value={editedName}
                    onChangeText={setEditedName}
                    className="flex-1 text-base rounded-xl px-4 py-2.5 mr-2 border"
                    style={{
                      backgroundColor: colors.surface,
                      color: colors.textPrimary,
                      borderColor: colors.surfaceLight,
                    }}
                    selectionColor={colors.emerald}
                    autoFocus
                  />
                  <Pressable
                    onPress={handleSaveName}
                    className="bg-deep-green rounded-xl px-5 py-2.5 active:opacity-70"
                  >
                    <Text className="text-white font-bold text-sm">Save</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setIsEditingName(true)}
                className="flex-row items-center active:opacity-70"
              >
                <View className="flex-1 pr-3">
                  <Text className="text-[16px] font-semibold text-text-primary mb-1">
                    {displayName || "Your name"}
                  </Text>
                  <Text className="text-[13px] text-text-secondary leading-5">
                    Tap to edit your display name
                  </Text>
                </View>
                <Text className="text-muted text-xl font-light">›</Text>
              </Pressable>
            )}
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/premium/index" as never)}
          className="mb-4 active:opacity-90 rounded-2xl p-5"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.gold,
            borderTopWidth: 3,
            borderTopColor: colors.gold,
          }}
        >
          <Text className="text-xs font-bold uppercase mb-1" style={{ color: colors.gold }}>
            Premium
          </Text>
          <Text
            className="text-lg mb-1"
            style={{
              fontFamily: "LibreBaskerville_700Bold",
              color: colors.textPrimary,
            }}
          >
            Unlock the full experience
          </Text>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            Unlimited AI, offline audio, hadith library & more
          </Text>
        </Pressable>

        <View>
          {Platform.OS !== "web" && (
            <>
              <SettingsCard
                title="Notifications"
                subtitle={
                  notificationsSupported
                    ? "Reading nudges use your default notification sound"
                    : "Needs a development build — not available in Expo Go"
                }
                right={
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={toggleNotifications}
                    trackColor={{ false: colors.surfaceLight, true: colors.emeraldDark }}
                    thumbColor={colors.white}
                  />
                }
              />

              {notificationsSupported && (
                <View className="bg-surface rounded-2xl px-5 py-4 border border-surface-light mb-3">
                  <Text className="text-[16px] font-semibold text-text-primary mb-1">
                    Prayer reminder sound
                  </Text>
                  <Text className="text-[13px] text-text-secondary leading-5 mb-4">
                    Adhan or your phone&apos;s default notification sound
                  </Text>
                  <View className="flex-row gap-2">
                    {(
                      [
                        { id: "adhan" as const, label: "Adhan" },
                        { id: "system" as const, label: "System default" },
                      ] as const
                    ).map((option) => {
                      const selected = prayerSoundMode === option.id;
                      return (
                        <Pressable
                          key={option.id}
                          onPress={() => handlePrayerSoundChange(option.id)}
                          disabled={!notificationsEnabled}
                          className={`flex-1 rounded-xl py-3 items-center border active:opacity-80 ${
                            selected
                              ? "bg-deep-green border-deep-green"
                              : "bg-cream border-surface-light"
                          } ${!notificationsEnabled ? "opacity-50" : ""}`}
                        >
                          <Text
                            className={`text-sm font-semibold ${
                              selected ? "text-white" : "text-text-primary"
                            }`}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </>
          )}

          <SettingsCard
            title="Theme"
            subtitle={
              themeMode === "dark" ? "Dark mode is on" : "Change theme"
            }
            right={
              <Switch
                value={themeMode === "dark"}
                onValueChange={(v) => setThemeMode(v ? "dark" : "light")}
                trackColor={{ false: colors.surfaceLight, true: colors.emeraldDark }}
                thumbColor={colors.white}
              />
            }
          />

          <SettingsCard
            title="Salah Times Settings"
            subtitle="Adjust location or set prayer times manually"
            onPress={() => router.push("/(tabs)/prayer")}
          />

          <SettingsCard
            title="Change Start Date"
            subtitle={`Salah tracker starts from ${formatStartDate(onboardedAt)}`}
            onPress={() => setShowStartDate(true)}
          />

          <SettingsCard
            title="Saved chats"
            subtitle={`${conversations.filter((c) => c.isBookmarked).length} bookmarked · ${conversations.length} total`}
            onPress={() => router.push("/(tabs)/saved")}
          />

          <SettingsCard
            title="Clear conversations"
            subtitle="Delete all AI chat history"
            onPress={handleClearHistory}
            danger
          />

          <SettingsCard
            title="Reset & start over"
            subtitle="Clear local data and return to onboarding"
            onPress={handleSignOut}
            danger
          />
        </View>

        <View className="mt-4 mb-6 rounded-2xl p-5" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceLight }}>
          <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] mb-2" style={{ color: colors.gold }}>
            Disclaimer
          </Text>
          <Text className="text-[13px] leading-5" style={{ color: colors.textSecondary }}>
            Quran Chat uses AI based on the Quran and Hadith. Responses should not
            replace guidance from qualified Islamic scholars for important matters
            of faith.
          </Text>
        </View>
    </ScreenShell>

      <Modal visible={showStartDate} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-surface rounded-t-[28px] px-6 pt-3 pb-10">
            <View className="items-center mb-4">
              <View className="w-10 h-1 rounded-full bg-surface-light" />
            </View>
            <Text
              className="text-xl text-text-primary mb-2"
              style={{ fontFamily: "LibreBaskerville_700Bold" }}
            >
              Change start date
            </Text>
            <Text className="text-text-secondary text-sm mb-5 leading-5">
              The salah tracker only shows days from this date onward. Use
              YYYY-MM-DD.
            </Text>
            <TextInput
              value={startDateDraft}
              onChangeText={setStartDateDraft}
              placeholder="2026-07-17"
              placeholderTextColor="#9CA39A"
              className="bg-surface border border-surface-light rounded-2xl px-4 py-3.5 text-text-primary text-base mb-5"
              autoCapitalize="none"
            />
            <Pressable
              onPress={handleSaveStartDate}
              className="rounded-2xl py-4 items-center bg-deep-green active:opacity-80 mb-3"
            >
              <Text className="text-white font-bold text-base">Save</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowStartDate(false)}
              className="rounded-2xl py-3.5 items-center active:opacity-70"
            >
              <Text className="text-text-secondary font-semibold">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
