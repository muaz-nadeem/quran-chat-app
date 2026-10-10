import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { useQuranAudioStore } from "@/lib/quran-audio";
import { getAyahAudioUrl, RECITERS } from "@/lib/quran-api";
import { THEME_COLORS, useThemeStore } from "@/stores/useThemeStore";
import { HeadphonesIcon } from "@/components/icons";

export default function AudioPlayerBar() {
  const mode = useThemeStore((s) => s.mode);
  const colors = THEME_COLORS[mode];
  const visible = useQuranAudioStore((s) => s.visible);
  const isPlaying = useQuranAudioStore((s) => s.isPlaying);
  const currentSurah = useQuranAudioStore((s) => s.currentSurah);
  const currentAyah = useQuranAudioStore((s) => s.currentAyah);
  const reciter = useQuranAudioStore((s) => s.reciter);
  const setPlaying = useQuranAudioStore((s) => s.setPlaying);
  const setReciter = useQuranAudioStore((s) => s.setReciter);
  const stop = useQuranAudioStore((s) => s.stop);
  const loadReciter = useQuranAudioStore((s) => s.loadReciter);
  const [showReciters, setShowReciters] = useState(false);
  const lastUrlRef = useRef<string | null>(null);
  const pendingPlayRef = useRef(false);

  const audioUrl =
    currentSurah && currentAyah
      ? getAyahAudioUrl(currentSurah, currentAyah, reciter)
      : null;

  // Stable player — swap tracks with replace() instead of recreating the hook.
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    loadReciter();
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "doNotMix",
    }).catch(() => {});
  }, [loadReciter]);

  // Load / switch ayah when URL changes
  useEffect(() => {
    if (!audioUrl) {
      lastUrlRef.current = null;
      pendingPlayRef.current = false;
      return;
    }
    if (lastUrlRef.current === audioUrl) return;
    lastUrlRef.current = audioUrl;
    pendingPlayRef.current = isPlaying;
    try {
      player.replace({ uri: audioUrl });
    } catch {
      // replace can throw if player was released
    }
  }, [audioUrl, player, isPlaying]);

  // Play once the new source is loaded (or immediately if already loaded)
  useEffect(() => {
    if (!audioUrl || !status.isLoaded) return;

    try {
      if (pendingPlayRef.current || isPlaying) {
        pendingPlayRef.current = false;
        if (status.didJustFinish) {
          player.seekTo(0);
        }
        if (!status.playing) {
          player.play();
        }
      } else if (!isPlaying && status.playing) {
        player.pause();
      }
    } catch {
      // ignore
    }
  }, [
    audioUrl,
    isPlaying,
    status.isLoaded,
    status.playing,
    status.didJustFinish,
    player,
  ]);

  // Sync UI when track ends
  useEffect(() => {
    if (status.didJustFinish && isPlaying) {
      setPlaying(false);
    }
  }, [status.didJustFinish, isPlaying, setPlaying]);

  // Stop native playback when bar is dismissed
  useEffect(() => {
    if (!visible) {
      pendingPlayRef.current = false;
      try {
        player.pause();
      } catch {
        // ignore
      }
    }
  }, [visible, player]);

  if (!visible || !currentSurah || !currentAyah) return null;

  const reciterName =
    RECITERS.find((r) => r.id === reciter)?.name ?? "Reciter";

  return (
    <>
      <View
        style={{
          position: "absolute",
          bottom: 100,
          left: 16,
          right: 16,
          backgroundColor: colors.emeraldDark,
          borderRadius: 20,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 6,
          zIndex: 100,
        }}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <HeadphonesIcon color="#FFFFFF" size={18} />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-sm">
            Surah {currentSurah}, Ayah {currentAyah}
          </Text>
          <Pressable onPress={() => setShowReciters(true)}>
            <Text className="text-white/70 text-xs mt-0.5">{reciterName}</Text>
          </Pressable>
          {status.isBuffering && (
            <Text className="text-white/50 text-[10px] mt-0.5">Loading…</Text>
          )}
        </View>
        <Pressable
          onPress={() => setPlaying(!isPlaying)}
          className="w-10 h-10 rounded-full items-center justify-center mr-2"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          <Text className="text-white text-lg">{isPlaying ? "⏸" : "▶"}</Text>
        </Pressable>
        <Pressable onPress={stop}>
          <Text className="text-white/80 text-xl px-1">×</Text>
        </Pressable>
      </View>

      <Modal visible={showReciters} transparent animationType="slide">
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setShowReciters(false)}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
            }}
          >
            <Text
              className="text-lg mb-4"
              style={{
                fontFamily: "LibreBaskerville_700Bold",
                color: colors.textPrimary,
              }}
            >
              Choose Reciter
            </Text>
            {RECITERS.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => {
                  setReciter(r.id);
                  setShowReciters(false);
                }}
                className="py-3 border-b"
                style={{ borderColor: colors.surfaceLight }}
              >
                <Text
                  style={{
                    color: reciter === r.id ? colors.emerald : colors.textPrimary,
                    fontWeight: reciter === r.id ? "700" : "400",
                  }}
                >
                  {r.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
