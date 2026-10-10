import { Conversation, useChatStore } from "@/stores/useChatStore";
import { useRouter } from "expo-router";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import ScreenShell from "@/components/ui/ScreenShell";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";

export default function SavedScreen() {
  const router = useRouter();
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];
  const conversations = useChatStore((s) => s.conversations);
  const toggleBookmark = useChatStore((s) => s.toggleBookmark);

  const bookmarked = conversations.filter((c) => c.isBookmarked);

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      "Remove Bookmark",
      `Remove "${title}" from saved?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => toggleBookmark(id),
        },
      ]
    );
  };

  const renderItem = ({ item, index }: { item: Conversation; index: number }) => (
    <Animated.View entering={FadeInRight.duration(400).delay(index * 80)}>
      <Pressable
        onPress={() =>
          router.push({ pathname: "/chat/[id]", params: { id: item.id } })
        }
        onLongPress={() => handleDelete(item.id, item.title)}
        className="rounded-2xl p-4 mb-3 active:opacity-70"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.surfaceLight,
        }}
      >
        <View className="flex-row items-start">
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: colors.goldSoft }}
          >
            <Text className="text-xl">⭐</Text>
          </View>
          <View className="flex-1">
            <Text
              className="font-semibold text-base mb-1"
              style={{ color: colors.textPrimary }}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {item.messages.length} messages ·{" "}
              {new Date(item.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {item.messages.length > 0 && (
          <View
            className="mt-3 rounded-xl p-3"
            style={{
              backgroundColor: colors.surfaceTint,
              borderWidth: 1,
              borderColor: colors.surfaceLight,
            }}
          >
            <Text
              className="text-sm leading-5"
              style={{ color: colors.textSecondary }}
              numberOfLines={2}
            >
              {item.messages[item.messages.length - 1].content}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );

  return (
    <ScreenShell title="Saved" subtitle="Your bookmarked conversations">
      {bookmarked.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4 py-16">
          <Text className="text-5xl mb-4">⭐</Text>
          <Text
            className="text-xl font-bold text-center mb-2"
            style={{
              fontFamily: "LibreBaskerville_700Bold",
              color: colors.textOnGreen,
            }}
          >
            No saved conversations
          </Text>
          <Text
            className="text-center leading-6"
            style={{ color: colors.textOnGreenMuted }}
          >
            Bookmark your favorite chats to find them here. Tap the star icon in
            any conversation to save it.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookmarked}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenShell>
  );
}
