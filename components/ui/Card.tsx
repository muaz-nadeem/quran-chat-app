import { ReactNode } from "react";
import { View, Pressable, ViewStyle } from "react-native";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  className?: string;
  noMargin?: boolean;
}

export default function Card({
  children,
  onPress,
  style,
  className = "",
  noMargin = false,
}: CardProps) {
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceLight,
    borderWidth: 1,
    borderTopWidth: 2,
    borderTopColor: colors.gold,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: noMargin ? 0 : undefined,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    ...style,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`active:opacity-85 ${noMargin ? "" : "mx-0"} ${className}`}
        style={cardStyle}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={className} style={cardStyle}>
      {children}
    </View>
  );
}
