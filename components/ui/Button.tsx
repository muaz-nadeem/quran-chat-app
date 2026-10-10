import { ReactNode } from "react";
import { Pressable, Text, ViewStyle } from "react-native";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";

type ButtonVariant = "primary" | "secondary" | "ghost" | "gold";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
  small?: boolean;
}

export default function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  icon,
  style,
  small = false,
}: ButtonProps) {
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];

  const variantStyles = {
    primary: {
      bg: colors.emeraldDark,
      text: colors.white,
      border: colors.emeraldDark,
    },
    secondary: {
      bg: colors.surfaceTint,
      text: colors.gold,
      border: colors.surfaceLight,
    },
    ghost: {
      bg: "transparent",
      text: colors.gold,
      border: colors.surfaceLight,
    },
    gold: {
      bg: colors.goldSoft,
      text: colors.gold,
      border: colors.goldSoft,
    },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="active:opacity-85"
      style={[
        {
          backgroundColor: disabled ? colors.surfaceLight : variantStyles.bg,
          borderColor: variantStyles.border,
          borderWidth: variant === "ghost" ? 1 : 0,
          borderRadius: 999,
          paddingVertical: small ? 10 : 16,
          paddingHorizontal: small ? 16 : 24,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {icon ? <>{icon}</> : null}
      <Text
        style={{
          color: disabled ? colors.muted : variantStyles.text,
          fontWeight: "700",
          fontSize: small ? 12 : 13,
          textTransform: "uppercase",
          letterSpacing: 1.2,
          marginLeft: icon ? 8 : 0,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
