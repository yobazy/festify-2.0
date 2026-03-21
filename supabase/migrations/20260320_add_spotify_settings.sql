create table if not exists public.user_spotify_tokens (
  user_id uuid primary key references auth.users (id) on delete cascade,
  spotify_user_id text not null,
  spotify_display_name text,
  spotify_avatar_url text,
  access_token text not null,
  refresh_token text not null,
  token_type text not null default 'Bearer',
  scope text not null default '',
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_spotify_tokens enable row level security;

create table if not exists public.user_saved_playlists (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  playlist_id text not null,
  name text not null,
  description text,
  image_url text,
  spotify_url text not null,
  owner_name text,
  track_total integer not null default 0,
  artist_name text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, playlist_id)
);

alter table public.user_saved_playlists enable row level security;

create policy "Users can read their saved playlists"
on public.user_saved_playlists
for select
using (auth.uid() = user_id);

create policy "Users can insert their saved playlists"
on public.user_saved_playlists
for insert
with check (auth.uid() = user_id);

create policy "Users can update their saved playlists"
on public.user_saved_playlists
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their saved playlists"
on public.user_saved_playlists
for delete
using (auth.uid() = user_id);
