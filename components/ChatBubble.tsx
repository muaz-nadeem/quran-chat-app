import { Text, View } from "react-native";
import VerseCard from "./VerseCard";

interface Props {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface ParsedSegment {
  type: "text" | "verse";
  content?: string;
  surah?: number;
  ayah?: number;
}

function parseContent(content: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  const regex = /\[QV:(\d+):(\d+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }

    segments.push({
      type: "verse",
      surah: parseInt(match[1], 10),
      ayah: parseInt(match[2], 10),
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({
      type: "text",
      content: content.slice(lastIndex),
    });
  }

  return segments;
}

export default function ChatBubble({ role, content, isStreaming }: Props) {
  const isUser = role === "user";

  if (isUser) {
    return (
      <View className="flex-row justify-end mb-4 px-4">
        <View className="bg-emerald rounded-2xl rounded-br-sm px-4 py-3 max-w-[85%]">
          <Text className="text-white text-base leading-6">{content}</Text>
        </View>
      </View>
    );
  }

  const segments = parseContent(content);

  return (
    <View className="flex-row justify-start mb-4 px-4">
      <View className="max-w-[90%]">
        <View className="flex-row items-center mb-2">
          <View className="w-7 h-7 rounded-full bg-emerald/20 items-center justify-center mr-2">
            <Text className="text-xs">📖</Text>
          </View>
          <Text className="text-emerald text-xs font-bold uppercase tracking-wider">
            Quran Chat
          </Text>
        </View>

        <View className="bg-surface border border-surface-light rounded-2xl rounded-tl-sm px-4 py-3">
          {segments.map((segment, index) => {
            if (segment.type === "verse" && segment.surah && segment.ayah) {
              return (
                <VerseCard
                  key={`verse-${index}`}
                  surah={segment.surah}
                  ayah={segment.ayah}
                />
              );
            }

            return (
              <Text
                key={`text-${index}`}
                className="text-text-primary text-base leading-7"
              >
                {segment.content}
              </Text>
            );
          })}

          {isStreaming && (
            <Text className="text-emerald text-lg mt-1">▍</Text>
          )}
        </View>
      </View>
    </View>
  );
}
