import { supabase } from "./supabase";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface UserContext {
  goal?: string | null;
  interests?: string[];
}

export async function sendChatMessage(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  userContext?: UserContext
): Promise<string> {
  const session = await supabase.auth.getSession();
  const token =
    session.data.session?.access_token ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    "";

  const chatApiUrl = process.env.EXPO_PUBLIC_CHAT_API_URL ?? "";

  const response = await fetch(
    `${chatApiUrl}/api/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages, userContext }),
    }
  );

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("You've reached the limit of 20 questions per hour. Please try again later.");
    }
    throw new Error(`Chat API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let fullResponse = "";
  // SSE lines can be split across network chunks, so buffer until a
  // complete newline-terminated line is available before parsing.
  let buffer = "";

  const processLine = (line: string) => {
    if (!line.startsWith("data: ")) return;
    const data = line.slice(6).trim();
    if (!data || data === "[DONE]") return;
    try {
      const parsed = JSON.parse(data);
      const content = parsed.choices?.[0]?.delta?.content ?? "";
      if (content) {
        fullResponse += content;
        onChunk(fullResponse);
      }
    } catch {
      // Incomplete or non-JSON protocol data — never show it as chat text.
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      processLine(line);
    }
  }

  processLine(buffer);

  return fullResponse;
}
