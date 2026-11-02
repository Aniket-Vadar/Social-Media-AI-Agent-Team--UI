-- ==============================================================================
-- Socialix AI Agent Office — Supabase Database Schema
-- Run this in your Supabase SQL Editor to enable full multi-tenant persistence
-- ==============================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 2. User Profiles Table
-- ==============================================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Auto-sync profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', null)
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- 3. Campaigns Table
-- ==============================================================================
create table if not exists public.campaigns (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  name text not null,
  logo text not null default '🔥',
  color text not null default '#6D5EF5',
  status text not null default 'in_progress',
  office_theme text not null default 'wooden',
  posts_published integer default 0,
  total_posts integer default 0,
  progress_percent integer default 0,
  brand_voice text,
  target_audience text,
  approval_mode text default 'manual',
  timezone text default 'America/New_York',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.campaigns enable row level security;

create policy "Users can view own campaigns"
  on public.campaigns for select
  using (auth.uid() = user_id);

create policy "Users can insert own campaigns"
  on public.campaigns for insert
  with check (auth.uid() = user_id);

create policy "Users can update own campaigns"
  on public.campaigns for update
  using (auth.uid() = user_id);

create policy "Users can delete own campaigns"
  on public.campaigns for delete
  using (auth.uid() = user_id);

-- ==============================================================================
-- 4. Posts Table
-- ==============================================================================
create table if not exists public.posts (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  campaign_id text references public.campaigns(id) on delete cascade not null,
  title text not null,
  caption text not null,
  hashtags text[] default array[]::text[],
  media_url text not null,
  status text not null default 'draft',
  platform text not null default 'instagram',
  scheduled_at timestamp with time zone,
  scheduled_display text,
  published_at timestamp with time zone,
  created_by text not null default 'agent',
  blotato_synced boolean default false,
  blotato_post_id text,
  likes integer default 0,
  comments integer default 0,
  shares integer default 0,
  reach integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.posts enable row level security;

create policy "Users can manage own posts"
  on public.posts for all
  using (auth.uid() = user_id);

-- ==============================================================================
-- 5. Agent Plans Table
-- ==============================================================================
create table if not exists public.agent_plans (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  campaign_id text references public.campaigns(id) on delete cascade,
  title text not null,
  plan_number integer not null,
  status text not null default 'in_progress',
  progress text default '0/2 done',
  steps jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.agent_plans enable row level security;

create policy "Users can manage own agent plans"
  on public.agent_plans for all
  using (auth.uid() = user_id);

-- ==============================================================================
-- 6. Chat Messages Table
-- ==============================================================================
create table if not exists public.agent_chats (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  campaign_id text references public.campaigns(id) on delete cascade,
  sender text not null, -- 'master' | 'researcher' | 'creator' | 'scheduler' | 'analytics' | 'user'
  role text not null, -- 'user' | 'assistant' | 'system'
  content text not null,
  plan_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.agent_chats enable row level security;

create policy "Users can manage own agent chats"
  on public.agent_chats for all
  using (auth.uid() = user_id);

-- ==============================================================================
-- 7. User & Agent Activities Audit Trail Table
-- ==============================================================================
create table if not exists public.user_activities (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  campaign_id text references public.campaigns(id) on delete cascade,
  action_type text not null, -- 'post_created', 'plan_started', 'campaign_created', etc.
  title text not null,
  description text not null,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_activities enable row level security;

create policy "Users can view own activities"
  on public.user_activities for select
  using (auth.uid() = user_id);

create policy "Users can insert own activities"
  on public.user_activities for insert
  with check (auth.uid() = user_id);

-- ==============================================================================
-- 8. Enable Realtime Replication
-- ==============================================================================
alter publication supabase_realtime add table public.campaigns;
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.agent_plans;
alter publication supabase_realtime add table public.agent_chats;
alter publication supabase_realtime add table public.user_activities;
