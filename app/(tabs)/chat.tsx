import { Conversation, useChatStore } from "@/stores/useChatStore";
import { useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatListScreen() {
  const router = useRouter();
  const conversations = useChatStore((s) => s.conversations);
  const createConversation = useChatStore((s) => s.createConversation);

  const handleNewChat = () => {
    const id = createConversation("New conversation");
    router.push({ pathname: "/chat/[id]", params: { id } });
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/chat/[id]", params: { id: item.id } })
      }
      className="bg-surface border border-surface-light rounded-2xl p-4 mx-6 mb-3 flex-row items-center active:opacity-70"
    >
      <View className="w-12 h-12 rounded-full bg-emerald/15 items-center justify-center mr-4">
        <Text className="text-xl">💬</Text>
      </View>
      <View className="flex-1">
        <Text
          className="text-text-primary font-semibold text-base"
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text className="text-text-secondary text-sm mt-1">
          {item.messages.length} messages ·{" "}
          {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      </View>
      {item.isBookmarked && <Text className="text-gold text-base">★</Text>}
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 pb-4 flex-row items-center justify-between">
        <Text className="text-text-primary text-2xl font-bold">Chats</Text>
        <Pressable
          onPress={handleNewChat}
          className="bg-emerald w-10 h-10 rounded-full items-center justify-center active:opacity-70"
        >
          <Text className="text-white text-2xl" style={{ marginTop: -2 }}>
            +
          </Text>
        </Pressable>
      </View>

      {conversations.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">🤲</Text>
          <Text className="text-text-primary text-xl font-bold text-center mb-2">
            No conversations yet
          </Text>
          <Text className="text-text-secondary text-center leading-6">
            Start your first conversation and ask anything about the Quran
          </Text>
          <Pressable
            onPress={handleNewChat}
            className="mt-6 bg-emerald rounded-2xl px-8 py-4 active:opacity-80"
          >
            <Text className="text-white font-bold text-base">
              Start Chatting
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
