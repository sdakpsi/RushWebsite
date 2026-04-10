alter table users
add column if not exists preview_dropped boolean not null default false;
