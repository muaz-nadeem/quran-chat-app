export interface DayContent {
  day: number;
  title: string;
  verse: { surah: number; ayah: number; text: string };
  reflection: string;
  dua: string;
}

export interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  days: DayContent[];
}

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: "closer_to_allah",
    name: "Growing Closer to Allah",
    description: "A 7-day journey to strengthen your connection with Allah",
    days: [
      {
        day: 1,
        title: "You Are Not Alone",
        verse: { surah: 2, ayah: 186, text: "I am near. I respond to the call of the caller when he calls upon Me." },
        reflection: "Allah is always close. Reflect on a moment today when you felt His presence.",
        dua: "Ya Allah, help me feel Your closeness in every moment of my day.",
      },
      {
        day: 2,
        title: "Trust in His Plan",
        verse: { surah: 65, ayah: 3, text: "Whoever puts their trust in Allah, He will be enough for them." },
        reflection: "What is one thing you are worried about that you can entrust to Allah today?",
        dua: "Ya Allah, I place my trust in You. Guide me to what is best.",
      },
      {
        day: 3,
        title: "Gratitude Opens Doors",
        verse: { surah: 14, ayah: 7, text: "If you are grateful, I will surely increase you in favor." },
        reflection: "Name 3 blessings you often overlook. Thank Allah for each one.",
        dua: "Ya Allah, make me among the grateful and increase me in Your blessings.",
      },
      {
        day: 4,
        title: "Patience is Light",
        verse: { surah: 2, ayah: 153, text: "O you who believe, seek help through patience and prayer." },
        reflection: "What situation in your life requires patience right now? How can prayer help?",
        dua: "Ya Allah, grant me patience and make my struggles a source of reward.",
      },
      {
        day: 5,
        title: "The Power of Du'a",
        verse: { surah: 40, ayah: 60, text: "Call upon Me; I will respond to you." },
        reflection: "Allah invites you to ask. What have you been holding back from asking Him?",
        dua: "Ya Allah, I turn to You with all my needs. You are the best of those who answer.",
      },
      {
        day: 6,
        title: "Forgiveness Heals",
        verse: { surah: 39, ayah: 53, text: "Do not despair of the mercy of Allah. Indeed, Allah forgives all sins." },
        reflection: "Is there something you need to forgive yourself for? Allah's mercy covers it.",
        dua: "Ya Allah, forgive my sins and purify my heart. You are the Most Merciful.",
      },
      {
        day: 7,
        title: "A New Beginning",
        verse: { surah: 94, ayah: 6, text: "Indeed, with hardship comes ease." },
        reflection: "Look back at this week. How has your connection with Allah grown?",
        dua: "Ya Allah, keep me steadfast on this path and never let me stray.",
      },
    ],
  },
  {
    id: "understand_quran",
    name: "Understanding the Quran",
    description: "Discover the wisdom of the Quran in 7 days",
    days: [
      {
        day: 1,
        title: "The Opening",
        verse: { surah: 1, ayah: 1, text: "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
        reflection: "Al-Fatiha is the foundation. Reflect on what each line means to you personally.",
        dua: "Ya Allah, open my heart and mind to understand Your words.",
      },
      {
        day: 2,
        title: "Guidance for All",
        verse: { surah: 2, ayah: 2, text: "This is the Book about which there is no doubt, a guidance for those conscious of Allah." },
        reflection: "The Quran is a guide. What area of your life needs guidance right now?",
        dua: "Ya Allah, make the Quran a light that guides my every decision.",
      },
      {
        day: 3,
        title: "The Throne Verse",
        verse: { surah: 2, ayah: 255, text: "Allah - there is no deity except Him, the Ever-Living, the Self-Sustaining." },
        reflection: "Ayat al-Kursi describes Allah's greatness. Memorize it if you haven't.",
        dua: "Ya Allah, protect me with the power of Your greatest verse.",
      },
      {
        day: 4,
        title: "Stories of the Past",
        verse: { surah: 12, ayah: 111, text: "In their stories there is certainly a lesson for people of understanding." },
        reflection: "Which prophet's story resonates with your current situation?",
        dua: "Ya Allah, grant me the wisdom to learn from those who came before me.",
      },
      {
        day: 5,
        title: "The Heart Finds Peace",
        verse: { surah: 13, ayah: 28, text: "Verily, in the remembrance of Allah do hearts find rest." },
        reflection: "When did you last feel true peace? How was Allah part of that moment?",
        dua: "Ya Allah, let Your remembrance be the comfort of my heart.",
      },
      {
        day: 6,
        title: "Justice and Kindness",
        verse: { surah: 16, ayah: 90, text: "Indeed, Allah orders justice and good conduct and giving to relatives." },
        reflection: "How can you practice more justice and kindness in your daily interactions?",
        dua: "Ya Allah, make me a person of justice, kindness, and generosity.",
      },
      {
        day: 7,
        title: "The Final Reminder",
        verse: { surah: 103, ayah: 1, text: "By time, indeed mankind is in loss - except those who believe and do righteous deeds." },
        reflection: "Time is passing. What one righteous deed will you commit to daily?",
        dua: "Ya Allah, help me use my time wisely and be among the successful.",
      },
    ],
  },
  {
    id: "hard_times",
    name: "Finding Strength in Hardship",
    description: "Quranic comfort for difficult days",
    days: [
      {
        day: 1,
        title: "Allah Knows Your Pain",
        verse: { surah: 2, ayah: 286, text: "Allah does not burden a soul beyond that it can bear." },
        reflection: "Whatever you're carrying, know that Allah believes you can handle it.",
        dua: "Ya Allah, give me strength to carry what You have placed before me.",
      },
      {
        day: 2,
        title: "After Hardship, Ease",
        verse: { surah: 94, ayah: 5, text: "For indeed, with hardship will be ease." },
        reflection: "This difficulty is temporary. What ease might Allah be preparing for you?",
        dua: "Ya Allah, let me see the ease You have promised, and grant me patience until then.",
      },
      {
        day: 3,
        title: "You Are Heard",
        verse: { surah: 21, ayah: 87, text: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers." },
        reflection: "Prophet Yunus called from the darkest place. Allah heard him. He hears you too.",
        dua: "Ya Allah, rescue me from my difficulties as You rescued Yunus.",
      },
      {
        day: 4,
        title: "Tears Are Not Weakness",
        verse: { surah: 12, ayah: 86, text: "I only complain of my suffering and grief to Allah." },
        reflection: "Prophet Yaqub taught us: pour your heart out to Allah, not to people.",
        dua: "Ya Allah, I bring my pain to You. Only You can heal what others cannot see.",
      },
      {
        day: 5,
        title: "Allah's Plan is Best",
        verse: { surah: 2, ayah: 216, text: "Perhaps you hate a thing and it is good for you; and perhaps you love a thing and it is bad for you." },
        reflection: "Can you think of a past hardship that turned out to be a hidden blessing?",
        dua: "Ya Allah, help me trust Your wisdom even when I cannot see the way forward.",
      },
      {
        day: 6,
        title: "You Will Not Be Tested Forever",
        verse: { surah: 65, ayah: 7, text: "Allah will bring about, after hardship, ease." },
        reflection: "Every storm passes. What small step can you take today toward healing?",
        dua: "Ya Allah, replace my hardship with ease and my grief with joy.",
      },
      {
        day: 7,
        title: "Rise Stronger",
        verse: { surah: 3, ayah: 139, text: "Do not weaken and do not grieve, for you will be superior if you are believers." },
        reflection: "Your faith has carried you through 7 days. How has your perspective shifted?",
        dua: "Ya Allah, make me emerge from this trial stronger and closer to You.",
      },
    ],
  },
  {
    id: "better_habits",
    name: "Building Islamic Habits",
    description: "Practical daily habits rooted in the Quran",
    days: [
      {
        day: 1,
        title: "Start with Bismillah",
        verse: { surah: 11, ayah: 41, text: "In the name of Allah is its course and its anchorage." },
        reflection: "Today, say Bismillah before every action. Notice how it changes your mindset.",
        dua: "Ya Allah, let every action I take today begin and end with Your name.",
      },
      {
        day: 2,
        title: "Guard Your Salah",
        verse: { surah: 2, ayah: 238, text: "Maintain with care the prayers, and the middle prayer, and stand before Allah devoutly obedient." },
        reflection: "Which of the 5 prayers do you find hardest to maintain? Focus on it today.",
        dua: "Ya Allah, make prayer the coolness of my eyes and the anchor of my day.",
      },
      {
        day: 3,
        title: "Speak Good or Stay Silent",
        verse: { surah: 17, ayah: 53, text: "Tell My servants to say that which is best." },
        reflection: "Before speaking today, pause and ask: is this beneficial, kind, or necessary?",
        dua: "Ya Allah, guard my tongue from harm and fill my words with goodness.",
      },
      {
        day: 4,
        title: "Give, Even a Little",
        verse: { surah: 2, ayah: 261, text: "The example of those who spend their wealth in the way of Allah is like a seed that grows seven ears." },
        reflection: "Charity isn't only money. Give a smile, a kind word, or your time today.",
        dua: "Ya Allah, make me generous and multiply the reward of what I give.",
      },
      {
        day: 5,
        title: "Morning and Evening Adhkar",
        verse: { surah: 33, ayah: 41, text: "O you who believe, remember Allah with much remembrance." },
        reflection: "Set a reminder for morning and evening dhikr. Even 5 minutes transforms your day.",
        dua: "Ya Allah, make Your remembrance easy on my tongue and present in my heart.",
      },
      {
        day: 6,
        title: "Sleep Like the Prophet",
        verse: { surah: 3, ayah: 190, text: "Indeed, in the creation of the heavens and the earth... are signs for those of understanding." },
        reflection: "Tonight, recite Ayat al-Kursi and the last 3 surahs before sleeping.",
        dua: "Ya Allah, protect me as I sleep and wake me with gratitude.",
      },
      {
        day: 7,
        title: "Make It Last",
        verse: { surah: 73, ayah: 20, text: "Read what is easy from the Quran." },
        reflection: "You've built habits for 7 days. Pick the one that felt most natural and keep it forever.",
        dua: "Ya Allah, make these good deeds consistent, even if they are small.",
      },
    ],
  },
  {
    id: "new_to_islam",
    name: "Welcome to Islam",
    description: "A gentle introduction to the Quran for new Muslims",
    days: [
      {
        day: 1,
        title: "You Are Chosen",
        verse: { surah: 49, ayah: 7, text: "Allah has endeared to you the faith and has made it pleasing in your hearts." },
        reflection: "Your journey to Islam is a gift from Allah. Take a moment to appreciate it.",
        dua: "Ya Allah, thank You for guiding me. Strengthen my faith each day.",
      },
      {
        day: 2,
        title: "One God, One Message",
        verse: { surah: 112, ayah: 1, text: "Say: He is Allah, the One." },
        reflection: "Surah Al-Ikhlas captures the core of Islam in 4 verses. Read it and reflect.",
        dua: "Ya Allah, deepen my understanding of Your oneness.",
      },
      {
        day: 3,
        title: "Prayer Connects You",
        verse: { surah: 29, ayah: 45, text: "Indeed, prayer prohibits immorality and wrongdoing." },
        reflection: "Prayer is your direct line to Allah. Even if imperfect, start wherever you are.",
        dua: "Ya Allah, make prayer easy for me and let it purify my heart.",
      },
      {
        day: 4,
        title: "The Quran is Your Friend",
        verse: { surah: 54, ayah: 17, text: "We have certainly made the Quran easy for remembrance." },
        reflection: "Read even one verse today in translation. Understanding is more important than speed.",
        dua: "Ya Allah, open my heart to the Quran and make it my companion.",
      },
      {
        day: 5,
        title: "Community Matters",
        verse: { surah: 49, ayah: 10, text: "The believers are but brothers." },
        reflection: "Find one Muslim you can connect with today - online or in person.",
        dua: "Ya Allah, surround me with good companions who strengthen my faith.",
      },
      {
        day: 6,
        title: "Take It Step by Step",
        verse: { surah: 73, ayah: 20, text: "Read what is easy from the Quran." },
        reflection: "Islam wasn't revealed all at once. Be gentle with yourself as you learn.",
        dua: "Ya Allah, make this journey easy and don't let me become overwhelmed.",
      },
      {
        day: 7,
        title: "You Belong Here",
        verse: { surah: 39, ayah: 53, text: "Do not despair of the mercy of Allah." },
        reflection: "No matter your past, your slate is clean. You are exactly where Allah wants you to be.",
        dua: "Ya Allah, keep me firm on this path and let me die upon faith.",
      },
    ],
  },
];

export function getPlanForGoal(goalId: string | null): PlanTemplate {
  const mapping: Record<string, string> = {
    closer: "closer_to_allah",
    faith: "closer_to_allah",
    memorize: "understand_quran",
    prayer: "better_habits",
  };
  const planId = mapping[goalId ?? "closer"] ?? "closer_to_allah";
  return PLAN_TEMPLATES.find((p) => p.id === planId) ?? PLAN_TEMPLATES[0];
}
