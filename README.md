# Quran Chat

An AI-powered conversational app for Muslims — ask anything about the Quran and get answers with authentic references.

## Tech Stack

- **Expo SDK 57** + Expo Router (file-based navigation)
- **NativeWind** (Tailwind CSS for React Native)
- **Supabase** (Auth, Postgres, Edge Functions)
- **OpenAI GPT-4o-mini** via Supabase Edge Function
- **Al Quran Cloud API** for verse data

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- A Supabase project
- An OpenAI API key

### Setup

1. Clone and install:

```bash
npm install
```

2. Configure environment variables in `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Set up Supabase:
   - Run the migration in `supabase/migrations/001_initial.sql`
   - Deploy the edge function: `supabase functions deploy ai-chat`
   - Set the OpenAI key: `supabase secrets set OPENAI_API_KEY=sk-...`

4. Start the development server:

```bash
npx expo start
```

## Features

- AI-powered Quran Q&A with streaming responses
- Inline Quran verse cards (Arabic + English translation)
- Daily Verse of the Day
- Suggested questions for discovery
- Conversation history with bookmarking
- Beautiful dark Islamic-themed UI
