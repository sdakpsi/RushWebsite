alter table packet_scores enable row level security;

drop policy if exists "Actives and PICs can view packet scores" on packet_scores;
create policy "Actives and PICs can view packet scores"
on packet_scores
for select
using (
  exists (
    select 1
    from users
    where users.id = auth.uid()
      and (users.is_active = true or users.is_pic = true)
  )
);

drop policy if exists "PICs can insert their own packet scores" on packet_scores;
create policy "PICs can insert their own packet scores"
on packet_scores
for insert
with check (
  scorer_id = auth.uid()
  and exists (
    select 1
    from users
    where users.id = auth.uid()
      and users.is_pic = true
  )
);

drop policy if exists "PICs can update their own packet scores" on packet_scores;
create policy "PICs can update their own packet scores"
on packet_scores
for update
using (
  scorer_id = auth.uid()
  and exists (
    select 1
    from users
    where users.id = auth.uid()
      and users.is_pic = true
  )
)
with check (
  scorer_id = auth.uid()
  and exists (
    select 1
    from users
    where users.id = auth.uid()
      and users.is_pic = true
  )
);
