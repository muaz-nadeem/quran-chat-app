import SuggestedQuestions from "@/components/SuggestedQuestions";
import VerseOfTheDay from "@/components/VerseOfTheDay";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const displayName = useAuthStore((s) => s.displayName);
  const conversations = useChatStore((s) => s.conversations);
  const createConversation = useChatStore((s) => s.createConversation);

  const recentChats = conversations.slice(0, 5);

  const handleNewChat = (question?: string) => {
    const id = createConversation(question ?? "New conversation");
    if (question) {
      router.push({ pathname: "/chat/[id]", params: { id, initialMessage: question } });
    } else {
      router.push({ pathname: "/chat/[id]", params: { id } });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-text-secondary text-base">
            {getGreeting()},
          </Text>
          <Text className="text-text-primary text-3xl font-bold">
            {displayName || "Friend"} 🌙
          </Text>
        </View>

        {/* Verse of the Day */}
        <VerseOfTheDay />

        {/* New Chat Button */}
        <Pressable
          onPress={() => handleNewChat()}
          className="mx-6 mb-6 bg-emerald rounded-2xl py-4 flex-row items-center justify-center active:opacity-80"
        >
          <Text className="text-2xl mr-3">💬</Text>
          <Text className="text-white text-lg font-bold">
            Start New Chat
          </Text>
        </Pressable>

        {/* Suggested Questions */}
        <SuggestedQuestions onSelectQuestion={(q) => handleNewChat(q)} />

        {/* Recent Conversations */}
        {recentChats.length > 0 && (
          <View className="px-6">
            <Text className="text-text-primary font-bold text-lg mb-4">
              Recent Conversations
            </Text>
            {recentChats.map((chat) => (
              <Pressable
                key={chat.id}
                onPress={() =>
                  router.push({ pathname: "/chat/[id]", params: { id: chat.id } })
                }
                className="bg-surface border border-surface-light rounded-2xl p-4 mb-3 flex-row items-center active:opacity-70"
              >
                <View className="w-10 h-10 rounded-full bg-emerald/15 items-center justify-center mr-4">
                  <Text className="text-emerald text-base">💬</Text>
                </View>
                <View className="flex-1">
                  <Text
                    className="text-text-primary font-semibold text-base"
                    numberOfLines={1}
                  >
                    {chat.title}
                  </Text>
                  <Text className="text-text-secondary text-sm mt-1">
                    {chat.messages.length} messages ·{" "}
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
