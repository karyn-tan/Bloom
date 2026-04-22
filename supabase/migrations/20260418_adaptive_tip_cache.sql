-- Migration: adaptive_tip_cache table
-- Stores Gemini-generated adaptive care tips cached once per bouquet per day.

create table if not exists adaptive_tip_cache (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users on delete cascade,
  bouquet_id      uuid        not null references bouquets(id) on delete cascade,
  generated_date  date        not null default current_date,
  tip             text        not null,
  status          text        not null,
  unique(bouquet_id, generated_date)
);

alter table adaptive_tip_cache enable row level security;

create policy "Users can select their own adaptive tip cache"
  on adaptive_tip_cache for select
  using (auth.uid() = user_id);

create policy "Users can insert their own adaptive tip cache"
  on adaptive_tip_cache for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own adaptive tip cache"
  on adaptive_tip_cache for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
