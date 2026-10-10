import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendChatMessage, ChatMessage } from "@/lib/chat-api";
import { useAuthStore } from "@/stores/useAuthStore";

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isStreaming: boolean;
  streamingContent: string;

  loadConversations: () => Promise<void>;
  createConversation: (firstMessage: string) => string;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  toggleBookmark: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  clearAllConversations: () => Promise<void>;
  getConversation: (id: string) => Conversation | undefined;
}

const STORAGE_KEY = "conversations";

// Only account users get persistent history. Guest conversations
// live in memory and are gone when the app restarts.
async function persistConversations(conversations: Conversation[]) {
  if (useAuthStore.getState().mode !== "account") return;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  isStreaming: false,
  streamingContent: "",

  loadConversations: async () => {
    try {
      if (useAuthStore.getState().mode !== "account") {
        // Purge any history left on disk by older app versions or
        // previous sessions — guests must always start clean.
        set({ conversations: [], currentConversationId: null });
        await AsyncStorage.removeItem(STORAGE_KEY);
        return;
      }
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ conversations: JSON.parse(stored) });
      }
    } catch {
      // silently fail
    }
  },

  createConversation: (firstMessage) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const title =
      firstMessage.length > 50
        ? firstMessage.slice(0, 50) + "..."
        : firstMessage;

    const conversation: Conversation = {
      id,
      title,
      messages: [],
      isBookmarked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [conversation, ...get().conversations];
    set({ conversations: updated, currentConversationId: id });
    persistConversations(updated);
    return id;
  },

  sendMessage: async (conversationId, content) => {
    const { conversations } = get();
    const convo = conversations.find((c) => c.id === conversationId);
    if (!convo) return;

    const userMessage: ChatMessage = { role: "user", content };
    const updatedMessages = [...convo.messages, userMessage];

    const updatedConversations = conversations.map((c) =>
      c.id === conversationId
        ? { ...c, messages: updatedMessages, updatedAt: new Date().toISOString() }
        : c
    );
    set({ conversations: updatedConversations, isStreaming: true, streamingContent: "" });

    try {
      const { goal, interests } = useAuthStore.getState();
      const fullResponse = await sendChatMessage(
        updatedMessages,
        (chunk) => {
          set({ streamingContent: chunk });
        },
        { goal, interests }
      );

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: fullResponse,
      };

      const finalConversations = get().conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...updatedMessages, assistantMessage],
              updatedAt: new Date().toISOString(),
            }
          : c
      );

      set({
        conversations: finalConversations,
        isStreaming: false,
        streamingContent: "",
      });
      persistConversations(finalConversations);
    } catch (error) {
      const msg =
        error instanceof Error && error.message.includes("limit")
          ? error.message
          : "I'm sorry, I couldn't process your request right now. Please try again.";
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: msg,
      };

      const errorConversations = get().conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...updatedMessages, errorMessage],
              updatedAt: new Date().toISOString(),
            }
          : c
      );

      set({
        conversations: errorConversations,
        isStreaming: false,
        streamingContent: "",
      });
      persistConversations(errorConversations);
    }
  },

  toggleBookmark: (conversationId) => {
    const updated = get().conversations.map((c) =>
      c.id === conversationId ? { ...c, isBookmarked: !c.isBookmarked } : c
    );
    set({ conversations: updated });
    persistConversations(updated);
  },

  deleteConversation: (conversationId) => {
    const updated = get().conversations.filter((c) => c.id !== conversationId);
    set({ conversations: updated });
    persistConversations(updated);
  },

  clearAllConversations: async () => {
    set({ conversations: [], currentConversationId: null });
    await AsyncStorage.removeItem(STORAGE_KEY);
  },

  getConversation: (id) => {
    return get().conversations.find((c) => c.id === id);
  },
}));
