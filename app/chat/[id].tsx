import ChatBubble from "@/components/ChatBubble";
import { SUGGESTED_QUESTIONS } from "@/constants/suggested-questions";
import { useChatStore } from "@/stores/useChatStore";
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

export default function ChatScreen() {
  const { id, initialMessage } = useLocalSearchParams<{
    id: string;
    initialMessage?: string;
  }>();
  const router = useRouter();
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
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-surface-light">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full active:opacity-50"
        >
          <ArrowLeft color="#1B211D" size={22} />
        </Pressable>

        <View className="flex-1 ml-2">
          <Text
            className="text-text-primary font-bold text-base"
            numberOfLines={1}
          >
            {conversation?.title ?? "New Chat"}
          </Text>
        </View>

        <Pressable
          onPress={() => toggleBookmark(id)}
          className="w-10 h-10 items-center justify-center rounded-full active:opacity-50"
        >
          <Text className="text-lg">
            {conversation?.isBookmarked ? "★" : "☆"}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        {showSuggestions ? (
          <View className="flex-1 justify-center px-4">
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-full bg-emerald/15 items-center justify-center mb-4">
                <Text className="text-4xl">📖</Text>
              </View>
              <Text className="text-text-primary text-xl font-bold text-center mb-2">
                Ask anything about the Quran
              </Text>
              <Text className="text-text-secondary text-center leading-6">
                I'll provide answers with Quranic references
              </Text>
            </View>

            <View className="flex-row flex-wrap justify-center">
              {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
                <Pressable
                  key={q.id}
                  onPress={() => {
                    setInput(q.text);
                  }}
                  className="bg-surface border border-surface-light rounded-2xl px-4 py-3 m-1.5 active:opacity-70"
                  style={{ maxWidth: "47%" }}
                >
                  <Text className="text-text-primary text-sm leading-5">
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
              paddingTop: 16,
              paddingBottom: 16,
            }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        {/* Loading indicator */}
        {isStreaming && !streamingContent && (
          <View className="px-4 pb-2">
            <View className="flex-row items-center">
              <View className="w-7 h-7 rounded-full bg-emerald/20 items-center justify-center mr-2">
                <Text className="text-xs">📖</Text>
              </View>
              <ActivityIndicator color="#10B981" size="small" />
              <Text className="text-text-secondary text-sm ml-2">
                Thinking...
              </Text>
            </View>
          </View>
        )}

        {/* Input */}
        <View className="px-4 pb-4 pt-2 border-t border-surface-light">
          <View className="flex-row items-end bg-surface border border-surface-light rounded-2xl px-4 py-2">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask about the Quran..."
              placeholderTextColor="#98A29A"
              multiline
              maxLength={1000}
              className="flex-1 text-text-primary text-base py-2 max-h-24"
              selectionColor="#10B981"
              editable={!isStreaming}
              onSubmitEditing={handleSend}
            />
            <Pressable
              onPress={handleSend}
              disabled={!input.trim() || isStreaming}
              className={`w-10 h-10 rounded-full items-center justify-center ml-2 ${input.trim() && !isStreaming
                  ? "bg-emerald active:opacity-70"
                  : "bg-surface-light"
                }`}
            >
              <SendIcon
                color={input.trim() && !isStreaming ? "#FFFFFF" : "#98A29A"}
                size={18}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
