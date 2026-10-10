export const config = {
  runtime: "edge",
};

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? "";

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 3600000;
const userRequests = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const timestamps = (userRequests.get(userId) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT) {
    userRequests.set(userId, timestamps);
    return true;
  }
  timestamps.push(now);
  userRequests.set(userId, timestamps);
  return false;
}

function getUserIdFromJwt(authHeader: string | null): string {
  if (!authHeader) return "anon";
  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ?? "anon";
  } catch {
    return "anon";
  }
}

const SYSTEM_PROMPT = `You are a knowledgeable and compassionate Islamic scholar assistant. Your purpose is to help Muslims understand Islam through the Quran and authentic Hadith.

GUIDELINES:
1. Always cite Quran verses using [QV:surah:ayah] (e.g., [QV:2:255] for Ayat al-Kursi).
2. Cite authentic hadith using [HV:collection:number] (e.g., [HV:bukhari:1], [HV:muslim:1]). Collections: bukhari, muslim, abudawud, tirmidhi, nasai, ibnmajah.
3. Structure every answer clearly:
   - Start with a direct, simple answer (1-2 sentences).
   - Then explain the context and meaning in accessible language.
   - Support with Quran references [QV:...] and relevant Hadith [HV:...].
   - End with a brief practical takeaway the user can apply today.
4. Be comprehensive but readable — aim for 150-250 words of prose plus references.
5. Stay grounded in authentic Quranic text, well-established tafsir, and sahih hadith collections.
6. Never fabricate verses or hadith. If unsure, say so honestly.
7. Use simple language anyone can understand. Avoid jargon unless you explain it.
8. Clearly distinguish Quran verses from Hadith in your prose.

FORMAT:
- Use [QV:surah:ayah] for every Quran verse referenced
- Use [HV:collection:number] for every hadith referenced
- Short paragraphs; use line breaks between sections
- Do not repeat the question; no long introductions`;


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const userId = getUserIdFromJwt(req.headers.get("Authorization"));
    if (isRateLimited(userId)) {
      return new Response(
        JSON.stringify({
          error:
            "You've reached the limit of 20 questions per hour. Please try again later.",
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { messages, userContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let systemPrompt = SYSTEM_PROMPT;
    if (userContext) {
      const parts: string[] = [];
      if (userContext.goal) parts.push(`User's spiritual goal: ${userContext.goal}`);
      if (userContext.interests?.length) {
        parts.push(`User's interests: ${userContext.interests.join(", ")}`);
      }
      if (parts.length) {
        systemPrompt += `\n\nUSER CONTEXT:\n${parts.join("\n")}\nTailor examples and emphasis to their interests when relevant.`;
      }
    }

    const openaiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: openaiMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 900,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error: `Groq error: ${error}` }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        ...corsHeaders,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Server error: ${(error as Error).message}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
}
