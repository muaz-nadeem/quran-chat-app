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

// --- Quran Reader types & functions ---

export interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface AyahData {
  number: number;
  numberInSurah: number;
  arabic: string;
  translation: string;
  page?: number;
}

const SURAH_LIST_KEY = "quran_surah_list";
const SURAH_DATA_PREFIX = "quran_surah_data_";

export async function getSurahList(): Promise<SurahInfo[]> {
  try {
    const cached = await AsyncStorage.getItem(SURAH_LIST_KEY);
    if (cached) return JSON.parse(cached) as SurahInfo[];
  } catch {
    // cache miss
  }

  const res = await fetch(`${BASE_URL}/surah`).then((r) => r.json());
  const list: SurahInfo[] = res.data.map(
    (s: {
      number: number;
      name: string;
      englishName: string;
      englishNameTranslation: string;
      numberOfAyahs: number;
      revelationType: string;
    }) => ({
      number: s.number,
      name: s.name,
      englishName: s.englishName,
      englishNameTranslation: s.englishNameTranslation,
      numberOfAyahs: s.numberOfAyahs,
      revelationType: s.revelationType,
    })
  );

  try {
    await AsyncStorage.setItem(SURAH_LIST_KEY, JSON.stringify(list));
  } catch {
    // non-critical
  }

  return list;
}

export type TranslationLang = "en" | "ur";

const TRANSLATION_EDITIONS: Record<TranslationLang, string> = {
  en: "en.sahih",
  ur: "ur.jalandhry",
};

export async function getSurah(
  number: number,
  lang: TranslationLang = "en"
): Promise<AyahData[]> {
  const cacheKey = `${SURAH_DATA_PREFIX}${number}_${lang}`;
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached) as AyahData[];
  } catch {
    // cache miss
  }

  const edition = TRANSLATION_EDITIONS[lang];
  const res = await fetch(
    `${BASE_URL}/surah/${number}/editions/ar.alafasy,${edition}`
  ).then((r) => r.json());

  if (!res?.data?.[0]?.ayahs || !res?.data?.[1]?.ayahs) {
    throw new Error(`Failed to load surah ${number}`);
  }

  const arabicAyahs = res.data[0].ayahs;
  const translationAyahs = res.data[1].ayahs;

  const ayahs: AyahData[] = arabicAyahs.map(
    (
      a: {
        number: number;
        numberInSurah: number;
        text: string;
        page?: number;
      },
      i: number
    ) => ({
      number: a.number,
      numberInSurah: a.numberInSurah,
      arabic: a.text,
      translation: translationAyahs[i].text,
      page: a.page,
    })
  );

  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify(ayahs));
  } catch {
    // non-critical
  }

  return ayahs;
}

export const TOTAL_QURAN_PAGES = 604;

export interface PageAyah {
  number: number;
  numberInSurah: number;
  arabic: string;
  translation: string;
  surahNumber: number;
  surahName: string;
  page: number;
}

export async function getPage(
  pageNumber: number,
  lang: TranslationLang = "en"
): Promise<PageAyah[]> {
  const page = Math.min(Math.max(1, pageNumber), TOTAL_QURAN_PAGES);
  const cacheKey = `quran_page_${page}_${lang}`;
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached) as PageAyah[];
  } catch {}

  const edition = TRANSLATION_EDITIONS[lang];
  const [arabicRes, translationRes] = await Promise.all([
    fetch(`${BASE_URL}/page/${page}/quran-uthmani`).then((r) => r.json()),
    fetch(`${BASE_URL}/page/${page}/${edition}`).then((r) => r.json()),
  ]);

  const arabicAyahs = arabicRes.data.ayahs;
  const translationAyahs = translationRes.data.ayahs;

  const ayahs: PageAyah[] = arabicAyahs.map(
    (
      a: {
        number: number;
        numberInSurah: number;
        text: string;
        page: number;
        surah: { number: number; englishName: string };
      },
      i: number
    ) => ({
      number: a.number,
      numberInSurah: a.numberInSurah,
      arabic: a.text,
      translation: translationAyahs[i]?.text ?? "",
      surahNumber: a.surah.number,
      surahName: a.surah.englishName,
      page: a.page,
    })
  );

  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify(ayahs));
  } catch {}

  return ayahs;
}

export interface JuzInfo {
  number: number;
  name: string;
  startSurah: number;
  startAyah: number;
  startVerse: string;
}

export interface JuzAyahData {
  number: number;
  numberInSurah: number;
  arabic: string;
  translation: string;
  surahNumber: number;
  surahName: string;
}

export async function getJuz(
  juzNumber: number,
  lang: TranslationLang = "en"
): Promise<JuzAyahData[]> {
  const cacheKey = `quran_juz_${juzNumber}_${lang}`;
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached) as JuzAyahData[];
  } catch {}

  const edition = TRANSLATION_EDITIONS[lang];
  const [arabicRes, translationRes] = await Promise.all([
    fetch(`${BASE_URL}/juz/${juzNumber}/ar.alafasy`).then((r) => r.json()),
    fetch(`${BASE_URL}/juz/${juzNumber}/${edition}`).then((r) => r.json()),
  ]);

  const arabicAyahs = arabicRes.data.ayahs;
  const translationAyahs = translationRes.data.ayahs;

  const ayahs: JuzAyahData[] = arabicAyahs.map(
    (a: { number: number; numberInSurah: number; text: string; surah: { number: number; englishName: string } }, i: number) => ({
      number: a.number,
      numberInSurah: a.numberInSurah,
      arabic: a.text,
      translation: translationAyahs[i]?.text ?? "",
      surahNumber: a.surah.number,
      surahName: a.surah.englishName,
    })
  );

  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify(ayahs));
  } catch {}

  return ayahs;
}

export const JUZ_DATA: JuzInfo[] = [
  { number: 1, name: "Alif Laam Meem", startSurah: 1, startAyah: 1, startVerse: "الٓمٓ" },
  { number: 2, name: "Sayaqool", startSurah: 2, startAyah: 142, startVerse: "سَيَقُولُ" },
  { number: 3, name: "Tilkal Rusul", startSurah: 2, startAyah: 253, startVerse: "تِلْكَ ٱلرُّسُلُ" },
  { number: 4, name: "Lan Tanaloo", startSurah: 3, startAyah: 93, startVerse: "لَن تَنَالُوا۟" },
  { number: 5, name: "Wal Muhsanaat", startSurah: 4, startAyah: 24, startVerse: "وَٱلْمُحْصَنَـٰتُ" },
  { number: 6, name: "La Yuhibbullah", startSurah: 4, startAyah: 148, startVerse: "لَا يُحِبُّ ٱللَّهُ" },
  { number: 7, name: "Wa Iza Sami'oo", startSurah: 5, startAyah: 83, startVerse: "وَإِذَا سَمِعُوا۟" },
  { number: 8, name: "Wa Law Annana", startSurah: 6, startAyah: 111, startVerse: "وَلَوْ أَنَّنَا" },
  { number: 9, name: "Qalal Mala'u", startSurah: 7, startAyah: 88, startVerse: "قَالَ ٱلْمَلَأُ" },
  { number: 10, name: "Wa A'lamoo", startSurah: 8, startAyah: 41, startVerse: "وَٱعْلَمُوٓا۟" },
  { number: 11, name: "Ya'taziroon", startSurah: 9, startAyah: 93, startVerse: "يَعْتَذِرُونَ" },
  { number: 12, name: "Wa Mamin Daabbah", startSurah: 11, startAyah: 6, startVerse: "وَمَا مِن دَآبَّةٍ" },
  { number: 13, name: "Wa Ma Ubarri'u", startSurah: 12, startAyah: 53, startVerse: "وَمَآ أُبَرِّئُ" },
  { number: 14, name: "Rubama", startSurah: 15, startAyah: 1, startVerse: "الٓر" },
  { number: 15, name: "Subhanallazi", startSurah: 17, startAyah: 1, startVerse: "سُبْحَـٰنَ ٱلَّذِىٓ" },
  { number: 16, name: "Qal Alam", startSurah: 18, startAyah: 75, startVerse: "قَالَ أَلَمْ" },
  { number: 17, name: "Iqtaraba", startSurah: 21, startAyah: 1, startVerse: "ٱقْتَرَبَ" },
  { number: 18, name: "Qad Aflaha", startSurah: 23, startAyah: 1, startVerse: "قَدْ أَفْلَحَ" },
  { number: 19, name: "Wa Qalallazina", startSurah: 25, startAyah: 21, startVerse: "وَقَالَ ٱلَّذِينَ" },
  { number: 20, name: "A'man Khalaq", startSurah: 27, startAyah: 56, startVerse: "أَمَّنْ خَلَقَ" },
  { number: 21, name: "Utlu Ma Oohi", startSurah: 29, startAyah: 46, startVerse: "ٱتْلُ مَآ أُوحِىَ" },
  { number: 22, name: "Wa Manyaqnut", startSurah: 33, startAyah: 31, startVerse: "وَمَن يَقْنُتْ" },
  { number: 23, name: "Wa Mali", startSurah: 36, startAyah: 28, startVerse: "وَمَا لِىَ" },
  { number: 24, name: "Faman Azlamu", startSurah: 39, startAyah: 32, startVerse: "فَمَنْ أَظْلَمُ" },
  { number: 25, name: "Ilaihi Yuraddu", startSurah: 41, startAyah: 47, startVerse: "إِلَيْهِ يُرَدُّ" },
  { number: 26, name: "Ha Meem", startSurah: 46, startAyah: 1, startVerse: "حمٓ" },
  { number: 27, name: "Qala Fama Khatbukum", startSurah: 51, startAyah: 31, startVerse: "قَالَ فَمَا خَطْبُكُمْ" },
  { number: 28, name: "Qad Sami Allahu", startSurah: 58, startAyah: 1, startVerse: "قَدْ سَمِعَ ٱللَّهُ" },
  { number: 29, name: "Tabarakallazi", startSurah: 67, startAyah: 1, startVerse: "تَبَـٰرَكَ ٱلَّذِى" },
  { number: 30, name: "Amma Yatasa'aloon", startSurah: 78, startAyah: 1, startVerse: "عَمَّ يَتَسَآءَلُونَ" },
];

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

const SURAH_AYAH_OFFSETS = [
  0, 7, 293, 493, 669, 789, 954, 1160, 1235, 1364, 1473, 1596, 1707, 1750,
  1802, 1901, 2029, 2140, 2250, 2348, 2483, 2595, 2673, 2791, 2855, 2929,
  3002, 3079, 3158, 3252, 3344, 3409, 3469, 3503, 3533, 3559, 3586, 3606,
  3660, 3705, 3788, 3970, 4058, 4133, 4218, 4272, 4324, 4414, 4473, 4510,
  4545, 4583, 4612, 4630, 4675, 4735, 4754, 4763, 4770, 4775, 4784, 4792,
  4800, 4810, 4818, 4826, 4834, 4842, 4850, 4858, 4866, 4874, 4882, 4890,
  4898, 4906, 4914, 4922, 4930, 4938, 4946, 4954, 4962, 4970, 4978, 4986,
  4994, 5002, 5010, 5018, 5026, 5034, 5042, 5050, 5058, 5066, 5074, 5082,
  5090, 5098, 5106, 5114, 5122, 5130, 5138, 5146, 5154, 5162, 5170, 5178,
  5186, 5194, 5202, 5210, 5218, 5226, 5234,
];

export function getGlobalAyahNumber(surah: number, ayah: number): number {
  return SURAH_AYAH_OFFSETS[surah - 1] + ayah;
}

export const RECITERS = [
  { id: "ar.alafasy", name: "Mishary Alafasy" },
  { id: "ar.abdulbasitmurattal", name: "Abdul Basit" },
  { id: "ar.husary", name: "Mahmoud Khalil Al-Husary" },
] as const;

export type ReciterId = (typeof RECITERS)[number]["id"];

export function getAyahAudioUrl(
  surah: number,
  ayah: number,
  reciter: ReciterId = "ar.alafasy"
): string {
  return `https://cdn.islamic.network/quran/audio/128/${reciter}/${getGlobalAyahNumber(surah, ayah)}.mp3`;
}
