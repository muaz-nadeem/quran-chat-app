import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-6">
      <Text className="text-text-secondary text-xs font-bold uppercase tracking-wider px-6 mb-3">
        {title}
      </Text>
      <View className="mx-6 bg-surface border border-surface-light rounded-2xl overflow-hidden">
        {children}
      </View>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  danger,
  showBorder = true,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  showBorder?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-4 py-4 active:opacity-70 ${showBorder ? "border-b border-surface-light" : ""
        }`}
    >
      <Text className="text-xl mr-3">{icon}</Text>
      <Text
        className={`flex-1 text-base font-medium ${danger ? "text-danger" : "text-text-primary"
          }`}
      >
        {label}
      </Text>
      {value && (
        <Text className="text-text-secondary text-sm">{value}</Text>
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const displayName = useAuthStore((s) => s.displayName);
  const setDisplayName = useAuthStore((s) => s.setDisplayName);
  const mode = useAuthStore((s) => s.mode);
  const email = useAuthStore((s) => s.email);
  const signOut = useAuthStore((s) => s.signOut);
  const conversations = useChatStore((s) => s.conversations);
  const clearAllConversations = useChatStore((s) => s.clearAllConversations);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(displayName);

  const handleSaveName = async () => {
    setDisplayName(editedName);
    await AsyncStorage.setItem("displayName", editedName);
    setIsEditingName(false);
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
      mode === "guest" ? "Exit Guest Mode" : "Sign Out",
      mode === "guest"
        ? "Your guest conversations will be lost. Continue?"
        : "You will need to sign in again to access your conversations.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: mode === "guest" ? "Exit" : "Sign Out",
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

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4 pb-6">
          <Text className="text-text-primary text-2xl font-bold">Settings</Text>
        </View>

        {/* Profile */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-emerald/15 items-center justify-center mb-4">
            <Text className="text-3xl">🌙</Text>
          </View>
          {isEditingName ? (
            <View className="flex-row items-center">
              <TextInput
                value={editedName}
                onChangeText={setEditedName}
                className="bg-surface text-text-primary text-lg rounded-xl px-4 py-2 mr-2 min-w-[200px] text-center border border-emerald"
                selectionColor="#10B981"
                autoFocus
              />
              <Pressable
                onPress={handleSaveName}
                className="bg-emerald rounded-xl px-4 py-2 active:opacity-70"
              >
                <Text className="text-white font-bold">Save</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setIsEditingName(true)}>
              <Text className="text-text-primary text-xl font-bold">
                {displayName || "Set your name"}
              </Text>
              <Text className="text-emerald text-center text-sm mt-1">
                Tap to edit
              </Text>
            </Pressable>
          )}
        </View>

        {/* General */}
        <SettingsSection title="General">
          <SettingsRow
            icon="👤"
            label="Display Name"
            value={displayName || "Not set"}
            onPress={() => setIsEditingName(true)}
          />
          <SettingsRow
            icon="💬"
            label="Total Conversations"
            value={String(conversations.length)}
          />
          <SettingsRow
            icon="⭐"
            label="Saved Conversations"
            value={String(conversations.filter((c) => c.isBookmarked).length)}
            showBorder={false}
          />
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Account">
          <SettingsRow
            icon={mode === "guest" ? "👻" : "✉️"}
            label={mode === "guest" ? "Guest Session" : "Email"}
            value={mode === "guest" ? "Not signed in" : email ?? ""}
          />
          {mode === "guest" && (
            <SettingsRow
              icon="✨"
              label="Create an Account"
              onPress={() => router.push("/(onboarding)/auth")}
            />
          )}
          <SettingsRow
            icon="🚪"
            label={mode === "guest" ? "Exit Guest Mode" : "Sign Out"}
            onPress={handleSignOut}
            danger
            showBorder={false}
          />
        </SettingsSection>

        {/* Data */}
        <SettingsSection title="Data">
          <SettingsRow
            icon="🗑️"
            label="Clear All Conversations"
            onPress={handleClearHistory}
            danger
            showBorder={false}
          />
        </SettingsSection>

        {/* Disclaimer */}
        <View className="mx-6 mb-8 bg-surface border border-surface-light rounded-2xl p-4">
          <Text className="text-gold text-xs font-bold uppercase tracking-wider mb-2">
            Disclaimer
          </Text>
          <Text className="text-text-secondary text-sm leading-5">
            Quran Chat uses AI to provide answers based on the Quran. While we
            strive for accuracy, AI responses should not replace consultation
            with qualified Islamic scholars for important matters of faith and
            practice.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
