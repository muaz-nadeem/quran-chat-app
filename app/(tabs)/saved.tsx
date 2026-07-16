import { Conversation, useChatStore } from "@/stores/useChatStore";
import { useRouter } from "expo-router";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SavedScreen() {
  const router = useRouter();
  const conversations = useChatStore((s) => s.conversations);
  const toggleBookmark = useChatStore((s) => s.toggleBookmark);
  const deleteConversation = useChatStore((s) => s.deleteConversation);

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
    <Animated.View
      entering={FadeInRight.duration(400).delay(index * 80)}
    >
      <Pressable
        onPress={() =>
          router.push({ pathname: "/chat/[id]", params: { id: item.id } })
        }
        onLongPress={() => handleDelete(item.id, item.title)}
        className="bg-surface border border-surface-light rounded-2xl p-4 mx-6 mb-3 active:opacity-70"
      >
        <View className="flex-row items-start">
          <View className="w-12 h-12 rounded-full bg-gold/15 items-center justify-center mr-4">
            <Text className="text-xl">⭐</Text>
          </View>
          <View className="flex-1">
            <Text
              className="text-text-primary font-semibold text-base mb-1"
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text className="text-text-secondary text-sm">
              {item.messages.length} messages ·{" "}
              {new Date(item.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {item.messages.length > 0 && (
          <View className="mt-3 bg-background border border-surface-light rounded-xl p-3">
            <Text
              className="text-text-secondary text-sm leading-5"
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
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-6 pt-4 pb-4">
        <Text className="text-text-primary text-2xl font-bold">Saved</Text>
        <Text className="text-text-secondary text-sm mt-1">
          Your bookmarked conversations
        </Text>
      </View>

      {bookmarked.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">⭐</Text>
          <Text className="text-text-primary text-xl font-bold text-center mb-2">
            No saved conversations
          </Text>
          <Text className="text-text-secondary text-center leading-6">
            Bookmark your favorite chats to find them here. Tap the star icon in
            any conversation to save it.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookmarked}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
