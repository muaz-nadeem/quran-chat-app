import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Deprecated: chat API now runs on Vercel (api/chat.ts). Keep until Vercel is deployed.

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") ?? "";

// --- Per-user rate limiting (in-memory, resets on cold start) ---
const RATE_LIMIT = 20;          // max requests
const RATE_WINDOW_MS = 3600000; // per 1 hour
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

const SYSTEM_PROMPT = `You are a knowledgeable and compassionate Islamic scholar assistant. Your purpose is to help Muslims understand the Quran better.

GUIDELINES:
1. Always cite specific Quran verses using the format [QV:surah:ayah] (e.g., [QV:2:255] for Ayat al-Kursi). Never skip references.
2. BE BRIEF. Give the crux of the answer in simple words, not an essay. Aim for 2-4 short sentences of explanation plus 1-3 verse references. Hard limit: ~120 words of prose.
3. Answer the question directly in the first sentence, then support it with the verse reference(s).
4. Stay grounded in authentic Quranic text and well-established tafsir (exegesis).
5. Never make up or fabricate verses. If unsure, say so honestly.
6. Use simple, accessible language that anyone can understand.
7. If a question is outside the scope of the Quran, gently redirect in one sentence to what the Quran says about related topics.
8. Only mention hadith if essential, and only from well-authenticated collections (Bukhari, Muslim), clearly distinguished from Quranic verses.

FORMAT:
- Use [QV:surah:ayah] markers for every Quran verse you reference
- Short paragraphs, no headings, no bullet lists unless the user asks for a list
- Do not repeat the question back; do not add long introductions or conclusions
- A single short encouraging phrase at the end is fine, but keep it to a few words`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const userId = getUserIdFromJwt(req.headers.get("Authorization"));
    if (isRateLimited(userId)) {
      return new Response(
        JSON.stringify({ error: "You've reached the limit of 20 questions per hour. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const openaiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error: `Groq error: ${error}` }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Server error: ${(error as Error).message}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
