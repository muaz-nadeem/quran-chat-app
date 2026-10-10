import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import VerseCard from "./VerseCard";
import HadithCard from "./HadithCard";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";

interface Props {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface ParsedSegment {
  type: "text" | "verse" | "hadith";
  content?: string;
  surah?: number;
  ayah?: number;
  collection?: string;
  hadithNumber?: number;
}

function parseContent(content: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  const regex = /\[QV:(\d+):(\d+)\]|\[HV:([a-z]+):(\d+)\]/gi;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }

    if (match[1] && match[2]) {
      segments.push({
        type: "verse",
        surah: parseInt(match[1], 10),
        ayah: parseInt(match[2], 10),
      });
    } else if (match[3] && match[4]) {
      segments.push({
        type: "hadith",
        collection: match[3].toLowerCase(),
        hadithNumber: parseInt(match[4], 10),
      });
    }

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

function BookSmall({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2V3ZM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7V3Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function ChatBubble({ role, content, isStreaming }: Props) {
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];
  const isUser = role === "user";

  if (isUser) {
    return (
      <View className="flex-row justify-end mb-3 px-4">
        <View
          className="rounded-[20px] rounded-br-md px-4 py-3 max-w-[82%]"
          style={{ backgroundColor: colors.emeraldDark }}
        >
          <Text className="text-white text-[15px] leading-6">{content}</Text>
        </View>
      </View>
    );
  }

  const segments = parseContent(content);

  return (
    <View className="flex-row justify-start mb-3 px-4">
      <View className="max-w-[88%]">
        <View className="flex-row items-center mb-1.5 ml-1">
          <View
            className="w-5 h-5 rounded-full items-center justify-center mr-1.5"
          style={{ backgroundColor: colors.surfaceTint }}
        >
          <BookSmall color={colors.emerald} size={11} />
          </View>
          <Text
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: colors.gold }}
          >
            Islamic Guide
          </Text>
        </View>

        <View
          className="rounded-[20px] rounded-tl-md px-4 py-3"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.surfaceLight,
            borderWidth: 1,
          }}
        >
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

            if (
              segment.type === "hadith" &&
              segment.collection &&
              segment.hadithNumber
            ) {
              return (
                <HadithCard
                  key={`hadith-${index}`}
                  collection={segment.collection}
                  number={segment.hadithNumber}
                />
              );
            }

            return (
              <Text
                key={`text-${index}`}
                className="text-[15px] leading-[26px]"
                style={{ color: colors.textPrimary }}
              >
                {segment.content}
              </Text>
            );
          })}

          {isStreaming && (
            <Text className="text-lg mt-0.5" style={{ color: colors.emerald }}>
              ▍
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
