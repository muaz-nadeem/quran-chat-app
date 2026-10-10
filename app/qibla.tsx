import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import HeroHeader from "@/components/ui/HeroHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  calculateQiblaBearing,
  formatDistance,
  getDistanceToKaaba,
} from "@/lib/qibla";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";
import Svg, { Circle, Line, Polygon } from "react-native-svg";

export default function QiblaScreen() {
  const router = useRouter();
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];
  const [heading, setHeading] = useState(0);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compassReady, setCompassReady] = useState(false);

  const rotation = useSharedValue(0);

  const loadLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission is required to find Qibla direction.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const bearing = calculateQiblaBearing(
        loc.coords.latitude,
        loc.coords.longitude
      );
      setQiblaBearing(bearing);
      setDistance(getDistanceToKaaba(loc.coords.latitude, loc.coords.longitude));
    } catch {
      setError("Could not determine your location.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  // Use Location.watchHeadingAsync — calibrated device compass (true/magnetic north),
  // far more reliable than raw Magnetometer atan2 without tilt compensation.
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    const start = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted" || cancelled) return;

        subscription = await Location.watchHeadingAsync((data) => {
          // Prefer true north when available; fall back to magnetic.
          const h =
            data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
          if (Number.isFinite(h)) {
            setHeading(((h % 360) + 360) % 360);
            setCompassReady(true);
          }
        });
      } catch {
        if (!cancelled) {
          setError(
            (prev) =>
              prev ??
              "Compass unavailable on this device. Try again outdoors, away from metal."
          );
        }
      }
    };

    start();
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (qiblaBearing === null) return;
    // Needle points toward Qibla relative to current device heading.
    const needleRotation = (qiblaBearing - heading + 360) % 360;
    rotation.value = withSpring(needleRotation, { damping: 18, stiffness: 120 });
  }, [heading, qiblaBearing, rotation]);

  const needleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const aligned =
    qiblaBearing !== null &&
    Math.min(
      Math.abs(qiblaBearing - heading),
      360 - Math.abs(qiblaBearing - heading)
    ) < 8;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <HeroHeader
        title="Qibla Compass"
        subtitle="Direction to the Kaaba"
        compact
        rightAction={
          <Pressable onPress={() => router.back()}>
            <Text className="text-white/80 text-sm font-semibold">Back</Text>
          </Pressable>
        }
      />

      <View className="flex-1 items-center justify-center px-6 -mt-4">
        {loading ? (
          <ActivityIndicator size="large" color={colors.emerald} />
        ) : error ? (
          <View className="items-center">
            <Text
              className="text-center text-sm mb-4"
              style={{ color: colors.danger }}
            >
              {error}
            </Text>
            <Pressable
              onPress={loadLocation}
              className="rounded-full px-6 py-3"
              style={{ backgroundColor: colors.emeraldDark }}
            >
              <Text className="text-white font-bold text-sm">Try Again</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View
              className="w-72 h-72 rounded-full items-center justify-center mb-8"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 2,
                borderColor: aligned ? colors.gold : colors.surfaceLight,
              }}
            >
              <Svg width={260} height={260} viewBox="0 0 260 260">
                <Circle
                  cx="130"
                  cy="130"
                  r="120"
                  stroke={colors.surfaceLight}
                  strokeWidth="2"
                  fill="none"
                />
                <Line
                  x1="130"
                  y1="20"
                  x2="130"
                  y2="50"
                  stroke={colors.emerald}
                  strokeWidth="3"
                />
              </Svg>
              <Text
                className="absolute text-xs font-bold"
                style={{ top: 24, color: colors.emerald }}
              >
                N
              </Text>

              <Animated.View
                style={[
                  {
                    position: "absolute",
                    width: 260,
                    height: 260,
                    alignItems: "center",
                    justifyContent: "flex-start",
                    paddingTop: 30,
                  },
                  needleStyle,
                ]}
              >
                <Svg width={40} height={120} viewBox="0 0 40 120">
                  <Polygon
                    points="20,0 30,100 20,90 10,100"
                    fill={aligned ? colors.emerald : colors.gold}
                  />
                </Svg>
              </Animated.View>

              <View
                className="absolute w-4 h-4 rounded-full"
                style={{ backgroundColor: colors.emeraldDark }}
              />
            </View>

            {aligned ? (
              <Text
                className="text-2xl mb-2"
                style={{
                  fontFamily: "LibreBaskerville_700Bold",
                  color: colors.gold,
                }}
              >
                Facing Qibla
              </Text>
            ) : qiblaBearing !== null ? (
              <Text
                className="text-2xl mb-2"
                style={{
                  fontFamily: "LibreBaskerville_700Bold",
                  color: colors.textOnGreen,
                }}
              >
                {Math.round(qiblaBearing)}° from North
              </Text>
            ) : null}

            {compassReady && (
              <Text className="text-xs mb-1" style={{ color: colors.textOnGreenMuted }}>
                Device heading {Math.round(heading)}°
              </Text>
            )}

            {distance !== null && (
              <Text className="text-sm" style={{ color: colors.textOnGreenMuted }}>
                {formatDistance(distance)} to Makkah
              </Text>
            )}
            <Text
              className="text-xs text-center mt-6 px-8 leading-5"
              style={{ color: colors.textOnGreenMuted }}
            >
              Hold your phone flat and rotate until the needle points up (and
              turns green). Calibrate by moving your phone in a figure-8 if needed.
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
