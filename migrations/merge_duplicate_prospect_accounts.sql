-- Merge a duplicate prospect account into the account with the submitted application.
-- This script is intentionally non-destructive:
-- - it never deletes the old user row
-- - it renames the old user to "(old) Their Name"
-- - it preserves the submitted account as the canonical application owner
-- - it only moves case studies when doing so would not create a duplicate
--
-- Usage:
-- 1. Set `source_user_id` to the old / duplicate account you want to retire.
-- 2. Set `target_user_id` to the account with the submitted application.
-- 3. Run once with `preview_only := true` and review the notices.
-- 4. Change `preview_only := false` and run again to apply the merge.

begin;

do $$
declare
  preview_only boolean := true;

  -- Duplicate account to retire
  source_user_id uuid := '00000000-0000-0000-0000-000000000000';

  -- Canonical account to keep. This should be the account with the submitted application.
  target_user_id uuid := '11111111-1111-1111-1111-111111111111';

  source_name text;
  target_name text;

  target_submitted_application_id uuid;
  source_submitted_application_id uuid;

  source_comments_count integer := 0;
  source_interviews_count integer := 0;
  movable_case_studies_count integer := 0;
  conflicting_case_studies_count integer := 0;
  movable_delibs_count integer := 0;
  conflicting_delibs_count integer := 0;

  moved_comments_count integer := 0;
  moved_interviews_count integer := 0;
  moved_case_studies_count integer := 0;
  moved_delibs_count integer := 0;
  moved_avatar_count integer := 0;
  copied_photo_url_count integer := 0;
begin
  if source_user_id = target_user_id then
    raise exception 'source_user_id and target_user_id must be different';
  end if;

  select full_name
  into source_name
  from users
  where id = source_user_id;

  if source_name is null then
    raise exception 'Source user % was not found in users', source_user_id;
  end if;

  select full_name
  into target_name
  from users
  where id = target_user_id;

  if target_name is null then
    raise exception 'Target user % was not found in users', target_user_id;
  end if;

  select id
  into target_submitted_application_id
  from applications
  where user_id = target_user_id
    and submitted is not null
  order by submitted desc nulls last, created_at desc nulls last
  limit 1;

  if target_submitted_application_id is null then
    raise exception 'Target user % does not have a submitted application. Pick the submitted account as target.', target_user_id;
  end if;

  select id
  into source_submitted_application_id
  from applications
  where user_id = source_user_id
    and submitted is not null
  order by submitted desc nulls last, created_at desc nulls last
  limit 1;

  if source_submitted_application_id is not null then
    raise exception 'Source user % also has a submitted application (%). Stop and choose the correct canonical account first.', source_user_id, source_submitted_application_id;
  end if;

  select count(*)
  into source_comments_count
  from comments
  where prospect_id::text = source_user_id::text;

  select count(*)
  into source_interviews_count
  from interviews
  where prospect_id::text = source_user_id::text;

  select count(*)
  into movable_case_studies_count
  from case_studies cs
  where cs.prospect::text = source_user_id::text
    and not exists (
      select 1
      from case_studies target_cs
      where target_cs.prospect::text = target_user_id::text
        and target_cs.active = cs.active
    );

  select count(*)
  into conflicting_case_studies_count
  from case_studies cs
  where cs.prospect::text = source_user_id::text
    and exists (
      select 1
      from case_studies target_cs
      where target_cs.prospect::text = target_user_id::text
        and target_cs.active = cs.active
    );

  if to_regclass('public.delibs') is not null then
    select count(*)
    into movable_delibs_count
    from delibs d
    where d.prospect_id::text = source_user_id::text
      and not exists (
        select 1
        from delibs target_d
        where target_d.prospect_id::text = target_user_id::text
      );

    select count(*)
    into conflicting_delibs_count
    from delibs d
    where d.prospect_id::text = source_user_id::text
      and exists (
        select 1
        from delibs target_d
        where target_d.prospect_id::text = target_user_id::text
      );
  end if;

  raise notice 'Duplicate merge preview';
  raise notice '  source_user_id: % (%)', source_user_id, source_name;
  raise notice '  target_user_id: % (%)', target_user_id, target_name;
  raise notice '  target submitted application: %', target_submitted_application_id;
  raise notice '  comments to move: %', source_comments_count;
  raise notice '  interviews to move: %', source_interviews_count;
  raise notice '  case studies to move safely: %', movable_case_studies_count;
  raise notice '  case study conflicts left on old account: %', conflicting_case_studies_count;
  raise notice '  delibs to move safely: %', movable_delibs_count;
  raise notice '  delib conflicts left on old account: %', conflicting_delibs_count;

  if preview_only then
    raise notice 'Preview only is enabled. No rows were changed.';
    return;
  end if;

  update comments
  set prospect_id = target_user_id::text,
      prospect_name = target_name
  where prospect_id::text = source_user_id::text;
  get diagnostics moved_comments_count = row_count;

  update interviews
  set prospect_id = target_user_id
  where prospect_id::text = source_user_id::text;
  get diagnostics moved_interviews_count = row_count;

  update case_studies cs
  set prospect = target_user_id
  where cs.prospect::text = source_user_id::text
    and not exists (
      select 1
      from case_studies target_cs
      where target_cs.prospect::text = target_user_id::text
        and target_cs.active = cs.active
    );
  get diagnostics moved_case_studies_count = row_count;

  if to_regclass('public.delibs') is not null then
    update delibs d
    set prospect_id = target_user_id
    where d.prospect_id::text = source_user_id::text
      and not exists (
        select 1
        from delibs target_d
        where target_d.prospect_id::text = target_user_id::text
      );
    get diagnostics moved_delibs_count = row_count;
  end if;

  if to_regclass('public.user_avatar') is not null then
    update user_avatar source_avatar
    set user_id = target_user_id
    where source_avatar.user_id = source_user_id
      and not exists (
        select 1
        from user_avatar target_avatar
        where target_avatar.user_id = target_user_id
      );
    get diagnostics moved_avatar_count = row_count;
  end if;

  update users target_user
  set photo_url = source_user.photo_url
  from users source_user
  where target_user.id = target_user_id
    and source_user.id = source_user_id
    and target_user.photo_url is null
    and source_user.photo_url is not null;
  get diagnostics copied_photo_url_count = row_count;

  update users
  set application = target_submitted_application_id
  where id = target_user_id;

  update users
  set application = null,
      full_name = case
        when full_name like '(old) %' then full_name
        else '(old) ' || full_name
      end
  where id = source_user_id;

  raise notice 'Merge complete';
  raise notice '  comments moved: %', moved_comments_count;
  raise notice '  interviews moved: %', moved_interviews_count;
  raise notice '  case studies moved: %', moved_case_studies_count;
  raise notice '  case study conflicts kept on old account: %', conflicting_case_studies_count;
  raise notice '  delibs moved: %', moved_delibs_count;
  raise notice '  delib conflicts kept on old account: %', conflicting_delibs_count;
  raise notice '  user_avatar rows moved: %', moved_avatar_count;
  raise notice '  users.photo_url copied to target: %', copied_photo_url_count;
  raise notice '  old account renamed to: (old) %', source_name;
end
$$;

commit;
