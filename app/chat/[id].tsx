import ChatBubble from "@/components/ChatBubble";
import { SUGGESTED_QUESTIONS } from "@/constants/suggested-questions";
import { useChatStore } from "@/stores/useChatStore";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

function ArrowLeft({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M12 19L5 12L12 5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SendIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BookIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2V3ZM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7V3Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function ChatScreen() {
  const { id, initialMessage } = useLocalSearchParams<{
    id: string;
    initialMessage?: string;
  }>();
  const router = useRouter();
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const initialSent = useRef(false);

  const conversation = useChatStore((s) => s.getConversation(id));
  const sendMessage = useChatStore((s) => s.sendMessage);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamingContent = useChatStore((s) => s.streamingContent);
  const toggleBookmark = useChatStore((s) => s.toggleBookmark);

  useEffect(() => {
    if (initialMessage && !initialSent.current && conversation) {
      initialSent.current = true;
      sendMessage(id, initialMessage);
    }
  }, [initialMessage, conversation]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    sendMessage(id, text);
  };

  const messages = conversation?.messages ?? [];
  const showSuggestions = messages.length === 0 && !isStreaming;

  const allMessages = [
    ...messages.map((m, i) => ({ ...m, id: `msg-${i}` })),
    ...(isStreaming && streamingContent
      ? [
        {
          id: "streaming",
          role: "assistant" as const,
          content: streamingContent,
        },
      ]
      : []),
  ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 border-b"
        style={{
          borderColor: colors.emeraldSoft,
          backgroundColor: colors.background,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center rounded-full active:opacity-50"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.surfaceLight,
          }}
        >
          <ArrowLeft color={colors.textSecondary} size={18} />
        </Pressable>

        <View className="flex-1 mx-3">
          <Text
            className="font-bold text-[16px]"
            style={{ color: colors.textOnGreen }}
            numberOfLines={1}
          >
            {conversation?.title ?? "New Chat"}
          </Text>
        </View>

        <Pressable
          onPress={() => toggleBookmark(id)}
          className="w-9 h-9 items-center justify-center rounded-full active:opacity-50"
        >
          <Text
            className={`text-base ${
              conversation?.isBookmarked ? "text-gold" : "text-muted"
            }`}
          >
            {conversation?.isBookmarked ? "★" : "☆"}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        {/* Messages or suggestions */}
        {showSuggestions ? (
          <View className="flex-1 justify-center px-5">
            <View className="items-center mb-8">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: colors.surfaceTint }}
              >
                <BookIcon color={colors.emerald} size={28} />
              </View>
              <Text
                className="text-xl font-bold text-center mb-2"
                style={{
                  fontFamily: "LibreBaskerville_700Bold",
                  color: colors.textOnGreen,
                }}
              >
                Ask anything about the Quran
              </Text>
              <Text
                className="text-sm text-center leading-5"
                style={{ color: colors.textOnGreenMuted }}
              >
                Get answers with Quranic references and guidance
              </Text>
            </View>

            <View className="flex-row flex-wrap justify-center">
              {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
                <Pressable
                  key={q.id}
                  onPress={() => {
                    setInput(q.text);
                  }}
                  className="rounded-2xl px-4 py-3 m-1.5 active:opacity-70"
                  style={{
                    maxWidth: "47%",
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.surfaceLight,
                  }}
                >
                  <Text className="text-sm leading-5" style={{ color: colors.textPrimary }}>
                    {q.icon} {q.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={allMessages}
            renderItem={({ item }) => (
              <ChatBubble
                role={item.role}
                content={item.content}
                isStreaming={item.id === "streaming"}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingTop: 20,
              paddingBottom: 16,
            }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        {/* Streaming loading indicator */}
        {isStreaming && !streamingContent && (
          <View className="px-5 pb-3">
            <View
              className="flex-row items-center rounded-2xl px-4 py-3 self-start"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.surfaceLight,
              }}
            >
              <ActivityIndicator color={colors.emerald} size="small" />
              <Text
                className="text-sm ml-2.5 font-medium"
                style={{ color: colors.textSecondary }}
              >
                Thinking…
              </Text>
            </View>
          </View>
        )}

        {/* Input area */}
        <View
          className="px-4 pb-4 pt-2 border-t"
          style={{
            borderColor: colors.emeraldSoft,
            backgroundColor: colors.background,
          }}
        >
          <View
            className="flex-row items-end rounded-[20px] pl-4 pr-1.5 py-1.5"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.surfaceLight,
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask about the Quran..."
              placeholderTextColor={colors.muted}
              multiline
              maxLength={1000}
              className="flex-1 text-[15px] py-2 max-h-24"
              style={{ color: colors.textPrimary }}
              selectionColor={colors.emerald}
              editable={!isStreaming}
              onSubmitEditing={handleSend}
            />
            <Pressable
              onPress={handleSend}
              disabled={!input.trim() || isStreaming}
              className={`w-9 h-9 rounded-full items-center justify-center ml-2 mb-0.5 ${
                input.trim() && !isStreaming
                  ? "active:opacity-70"
                  : ""
              }`}
              style={{
                backgroundColor:
                  input.trim() && !isStreaming ? colors.emeraldDark : "transparent",
              }}
            >
              <SendIcon
                color={input.trim() && !isStreaming ? colors.white : colors.muted}
                size={16}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
