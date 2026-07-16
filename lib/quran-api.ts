import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://api.alquran.cloud/v1";

// Two-layer verse cache: fast in-memory map + persistent AsyncStorage.
// Quran text never changes, so cached entries are valid forever.
const memoryCache = new Map<string, VerseWithTranslation>();
const STORAGE_PREFIX = "verse_cache_";

async function getCachedVerse(
  key: string
): Promise<VerseWithTranslation | null> {
  if (memoryCache.has(key)) return memoryCache.get(key)!;
  try {
    const stored = await AsyncStorage.getItem(STORAGE_PREFIX + key);
    if (stored) {
      const parsed = JSON.parse(stored) as VerseWithTranslation;
      memoryCache.set(key, parsed);
      return parsed;
    }
  } catch {
    // storage miss
  }
  return null;
}

async function setCachedVerse(
  key: string,
  verse: VerseWithTranslation
): Promise<void> {
  memoryCache.set(key, verse);
  try {
    await AsyncStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(verse));
  } catch {
    // non-critical
  }
}

export interface QuranVerse {
  number: number;
  text: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
  };
  numberInSurah: number;
}

export interface VerseWithTranslation {
  arabic: string;
  translation: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  surahEnglishName: string;
}

export async function getRandomVerse(): Promise<VerseWithTranslation> {
  const surah = Math.floor(Math.random() * 114) + 1;
  const surahInfo = await fetch(`${BASE_URL}/surah/${surah}`).then((r) =>
    r.json()
  );
  const totalAyahs = surahInfo.data.numberOfAyahs;
  const ayah = Math.floor(Math.random() * totalAyahs) + 1;
  return getVerse(surah, ayah);
}

export async function getVerse(
  surah: number,
  ayah: number
): Promise<VerseWithTranslation> {
  const key = `${surah}:${ayah}`;
  const cached = await getCachedVerse(key);
  if (cached) return cached;

  const [arabicRes, translationRes] = await Promise.all([
    fetch(`${BASE_URL}/ayah/${surah}:${ayah}/ar.alafasy`).then((r) => r.json()),
    fetch(`${BASE_URL}/ayah/${surah}:${ayah}/en.sahih`).then((r) => r.json()),
  ]);

  const verse: VerseWithTranslation = {
    arabic: arabicRes.data.text,
    translation: translationRes.data.text,
    surahNumber: surah,
    ayahNumber: ayah,
    surahName: arabicRes.data.surah.name,
    surahEnglishName: arabicRes.data.surah.englishName,
  };

  await setCachedVerse(key, verse);
  return verse;
}

export async function searchQuran(
  query: string
): Promise<VerseWithTranslation[]> {
  const res = await fetch(
    `${BASE_URL}/search/${encodeURIComponent(query)}/all/en.sahih`
  ).then((r) => r.json());

  if (!res.data?.matches) return [];

  return res.data.matches.slice(0, 5).map(
    (match: {
      text: string;
      surah: { number: number; name: string; englishName: string };
      numberInSurah: number;
    }) => ({
      arabic: "",
      translation: match.text,
      surahNumber: match.surah.number,
      ayahNumber: match.numberInSurah,
      surahName: match.surah.name,
      surahEnglishName: match.surah.englishName,
    })
  );
}
