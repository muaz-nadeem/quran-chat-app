import { ReactNode } from "react";
import { ScrollView, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeroHeader from "./HeroHeader";
import GreenBackground from "./GreenBackground";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";

interface ScreenShellProps {
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
  heroContent?: ReactNode;
  children: ReactNode;
  scrollable?: boolean;
  compactHero?: boolean;
  contentStyle?: ViewStyle;
}

export default function ScreenShell({
  title,
  subtitle,
  rightAction,
  heroContent,
  children,
  scrollable = true,
  compactHero = false,
  contentStyle,
}: ScreenShellProps) {
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];

  const body = (
    <View
      className={`flex-1 px-6 pt-2 ${scrollable ? "pb-2" : "pb-0"}`}
      style={contentStyle}
    >
      {children}
    </View>
  );

  return (
    <GreenBackground>
      <SafeAreaView className="flex-1" edges={["left", "right"]}>
        <HeroHeader
          title={title}
          subtitle={subtitle}
          rightAction={rightAction}
          compact={compactHero}
          blend
        >
          {heroContent}
        </HeroHeader>
        {scrollable ? (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 36 }}
          >
            {body}
          </ScrollView>
        ) : (
          <View className="flex-1">{body}</View>
        )}
      </SafeAreaView>
    </GreenBackground>
  );
}
