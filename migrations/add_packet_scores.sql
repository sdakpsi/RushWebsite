create table if not exists packet_scores (
  id uuid default gen_random_uuid() primary key,
  prospect_id uuid not null references users(id) on delete cascade,
  scorer_id uuid not null references users(id) on delete cascade,
  score_type text not null check (score_type in ('application', 'resume')),
  score integer not null check (score between 1 and 8),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (prospect_id, scorer_id, score_type)
);

create index if not exists idx_packet_scores_prospect_id
  on packet_scores (prospect_id);

create index if not exists idx_packet_scores_scorer_id
  on packet_scores (scorer_id);
