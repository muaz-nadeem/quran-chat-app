export interface HadithCollection {
  id: string;
  name: string;
  arabicName: string;
  count: number;
}

export interface Hadith {
  number: number;
  arabic: string;
  english: string;
  narrator: string;
  collection: string;
}

const BASE_URL = "https://api.hadith.gading.dev";

export const HADITH_COLLECTIONS: HadithCollection[] = [
  { id: "bukhari", name: "Sahih Bukhari", arabicName: "صحيح البخاري", count: 7563 },
  { id: "muslim", name: "Sahih Muslim", arabicName: "صحيح مسلم", count: 7563 },
  { id: "abudawud", name: "Abu Dawud", arabicName: "سنن أبي داود", count: 5274 },
  { id: "tirmidhi", name: "Tirmidhi", arabicName: "سنن الترمذي", count: 3956 },
  { id: "nasai", name: "An-Nasa'i", arabicName: "سنن النسائي", count: 5761 },
  { id: "ibnmajah", name: "Ibn Majah", arabicName: "سنن ابن ماجه", count: 4341 },
];

const FALLBACK_HADITH: Record<string, Hadith[]> = {
  bukhari: [
    {
      number: 1,
      collection: "bukhari",
      narrator: "Umar ibn al-Khattab",
      arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
      english:
        "Actions are judged by intentions, and every person will be rewarded according to what they intended.",
    },
    {
      number: 2,
      collection: "bukhari",
      narrator: "Aisha",
      arabic: "مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ",
      english:
        "Whoever innovates something in this matter of ours that is not part of it, it will be rejected.",
    },
  ],
  muslim: [
    {
      number: 1,
      collection: "muslim",
      narrator: "Abu Hurairah",
      arabic: "الْإِيمَانُ بِضْعٌ وَسَبْعُونَ شُعْبَةً",
      english:
        "Faith has seventy-odd branches. The highest is saying 'There is no god but Allah' and the lowest is removing harm from the road.",
    },
  ],
};

export async function getHadithCollection(
  collectionId: string,
  page = 1,
  limit = 10
): Promise<Hadith[]> {
  const start = (page - 1) * limit + 1;
  const end = start + limit - 1;

  try {
    const res = await fetch(
      `${BASE_URL}/books/${collectionId}?range=${start}-${end}`
    );
    if (!res.ok) throw new Error("API error");
    const json = await res.json();
    const data = json.data?.hadiths ?? json.data ?? [];
    if (!Array.isArray(data) || data.length === 0) throw new Error("Empty");

    return data.map((h: Record<string, unknown>, i: number) => ({
      number: (h.number as number) ?? start + i,
      collection: collectionId,
      narrator: (h.name as string) ?? "Unknown",
      arabic: (h.arab as string) ?? (h.arabic as string) ?? "",
      english: (h.id as string) ?? (h.english as string) ?? (h.text as string) ?? "",
    }));
  } catch {
    return FALLBACK_HADITH[collectionId] ?? FALLBACK_HADITH.bukhari;
  }
}

export function getCollectionById(id: string): HadithCollection | undefined {
  return HADITH_COLLECTIONS.find((c) => c.id === id);
}
