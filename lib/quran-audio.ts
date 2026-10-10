import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReciterId, RECITERS } from "@/lib/quran-api";

interface AudioState {
  isPlaying: boolean;
  currentSurah: number | null;
  currentAyah: number | null;
  reciter: ReciterId;
  visible: boolean;
  loadReciter: () => Promise<void>;
  setReciter: (reciter: ReciterId) => void;
  playAyah: (surah: number, ayah: number) => void;
  setPlaying: (playing: boolean) => void;
  stop: () => void;
}

export const useQuranAudioStore = create<AudioState>((set) => ({
  isPlaying: false,
  currentSurah: null,
  currentAyah: null,
  reciter: "ar.alafasy",
  visible: false,

  loadReciter: async () => {
    const stored = await AsyncStorage.getItem("quran_reciter");
    if (stored && RECITERS.some((r) => r.id === stored)) {
      set({ reciter: stored as ReciterId });
    }
  },

  setReciter: (reciter) => {
    set({ reciter });
    AsyncStorage.setItem("quran_reciter", reciter);
  },

  playAyah: (surah, ayah) => {
    set({
      currentSurah: surah,
      currentAyah: ayah,
      isPlaying: true,
      visible: true,
    });
  },

  setPlaying: (playing) => set({ isPlaying: playing }),

  stop: () => {
    set({
      isPlaying: false,
      currentSurah: null,
      currentAyah: null,
      visible: false,
    });
  },
}));
