create table if not exists packet_flags (
  prospect_id uuid primary key references users(id) on delete cascade,
  flags text not null default '',
  updated_by uuid references users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table packet_flags enable row level security;

drop policy if exists "Actives and PICs can view packet flags" on packet_flags;
create policy "Actives and PICs can view packet flags"
on packet_flags
for select
using (
  exists (
    select 1
    from users
    where users.id = auth.uid()
      and (users.is_active = true or users.is_pic = true)
  )
);

drop policy if exists "PICs can insert packet flags" on packet_flags;
create policy "PICs can insert packet flags"
on packet_flags
for insert
with check (
  exists (
    select 1
    from users
    where users.id = auth.uid()
      and users.is_pic = true
  )
);

drop policy if exists "PICs can update packet flags" on packet_flags;
create policy "PICs can update packet flags"
on packet_flags
for update
using (
  exists (
    select 1
    from users
    where users.id = auth.uid()
      and users.is_pic = true
  )
)
with check (
  exists (
    select 1
    from users
    where users.id = auth.uid()
      and users.is_pic = true
  )
);
