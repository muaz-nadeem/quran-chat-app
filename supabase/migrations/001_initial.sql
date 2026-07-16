-- Profiles table (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  interests text[],
  created_at timestamptz default now()
);

-- Conversations table
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text,
  is_bookmarked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages table
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  verse_references jsonb,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_conversations_user_id on conversations(user_id);
create index if not exists idx_conversations_updated_at on conversations(updated_at desc);
create index if not exists idx_messages_conversation_id on messages(conversation_id);
create index if not exists idx_messages_created_at on messages(created_at);

-- Row Level Security
alter table profiles enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Conversations policies
create policy "Users can view own conversations"
  on conversations for select using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on conversations for insert with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on conversations for update using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on conversations for delete using (auth.uid() = user_id);

-- Messages policies
create policy "Users can view messages in own conversations"
  on messages for select using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
        and conversations.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in own conversations"
  on messages for insert with check (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
        and conversations.user_id = auth.uid()
    )
  );

-- Auto-create profile on user signup
-- search_path must be pinned: the auth service calls this trigger with a
-- different search_path, so unqualified table names fail to resolve.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, '');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
