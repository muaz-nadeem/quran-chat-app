import { Conversation, useChatStore } from "@/stores/useChatStore";
import { useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import ScreenShell from "@/components/ui/ScreenShell";
import Button from "@/components/ui/Button";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";
import { SUGGESTED_QUESTIONS } from "@/constants/suggested-questions";
import Svg, { Path } from "react-native-svg";

function ChatIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function ChatListScreen() {
  const router = useRouter();
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];
  const conversations = useChatStore((s) => s.conversations);
  const createConversation = useChatStore((s) => s.createConversation);

  const handleNewChat = (question?: string) => {
    const id = createConversation(question ?? "New conversation");
    router.push({
      pathname: "/chat/[id]",
      params: question ? { id, initialMessage: question } : { id },
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return date.toLocaleDateString("en-US", { weekday: "short" });
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/chat/[id]", params: { id: item.id } })
      }
      className="mb-3 active:opacity-70"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.surfaceLight,
        borderWidth: 1,
        borderRadius: 18,
      }}
    >
      <View className="flex-row items-center p-4">
        <View
          className="w-11 h-11 rounded-xl items-center justify-center mr-3.5"
          style={{ backgroundColor: colors.surfaceTint }}
        >
          <ChatIcon color={colors.emerald} size={20} />
        </View>
        <View className="flex-1 mr-2">
          <Text
            className="font-semibold text-[15px]"
            style={{ color: colors.textPrimary }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
            {item.messages.length}{" "}
            {item.messages.length === 1 ? "message" : "messages"} ·{" "}
            {formatDate(new Date(item.updatedAt).getTime())}
          </Text>
        </View>
        {item.isBookmarked && (
          <Text className="text-sm mr-1.5" style={{ color: colors.gold }}>
            ★
          </Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <ScreenShell
      title="Islamic Guide"
      subtitle="Quran & Hadith answers"
      compactHero
      scrollable={conversations.length === 0}
    >
      <Button label="Start New Conversation" onPress={() => handleNewChat()} />

      {conversations.length === 0 ? (
        <View className="items-center py-8">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-5"
            style={{ backgroundColor: colors.surfaceTint }}
          >
            <ChatIcon color={colors.emerald} size={36} />
          </View>
          <Text
            className="text-xl text-center mb-2"
            style={{
              fontFamily: "LibreBaskerville_700Bold",
              color: colors.textOnGreen,
            }}
          >
            Ask anything about Islam
          </Text>
          <Text
            className="text-center text-sm leading-5 mb-6"
            style={{ color: colors.textOnGreenMuted }}
          >
            Get comprehensive answers from the Quran and authentic Hadith.
          </Text>
          <View className="flex-row flex-wrap justify-center" style={{ gap: 8 }}>
            {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
              <Pressable
                key={q.id}
                onPress={() => handleNewChat(q.text)}
                className="rounded-full px-4 py-2"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.surfaceLight,
                }}
              >
                <Text className="text-xs" style={{ color: colors.emerald }}>
                  {q.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <>
          <Text
            className="text-xs font-semibold uppercase tracking-wider mb-3 mt-4"
            style={{ color: colors.textOnGreenMuted }}
          >
            Recent Conversations
          </Text>
          <FlatList
            data={conversations}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        </>
      )}
    </ScreenShell>
  );
}
