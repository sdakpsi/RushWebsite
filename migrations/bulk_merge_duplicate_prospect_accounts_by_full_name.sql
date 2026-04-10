-- Bulk merge duplicate prospect accounts by exact full_name.
-- This script returns a result table:
-- - in dry run mode: rows show what would happen
-- - in apply mode: rows show what did happen
--
-- Non-destructive behavior:
-- - never deletes old user rows
-- - keeps the submitted-application account as the canonical target
-- - renames each old account to "(old) Their Name"
-- - leaves conflicting case studies on the old account instead of overwriting them
--
-- Usage:
-- 1. Set `preview_only := true` for a dry run, or `false` to apply.
-- 2. Run this in the Supabase SQL editor.

begin;

drop table if exists pg_temp.bulk_merge_results;

create temporary table bulk_merge_results (
  row_type text not null,
  action text not null,
  full_name text,
  source_user_id text,
  source_email text,
  target_user_id text,
  target_email text,
  target_submitted_application_id text,
  comments_affected integer not null default 0,
  interviews_affected integer not null default 0,
  case_studies_affected integer not null default 0,
  case_study_conflicts integer not null default 0,
  delibs_affected integer not null default 0,
  delib_conflicts integer not null default 0,
  avatars_affected integer not null default 0,
  photo_copies integer not null default 0,
  old_name_after text
);

do $$
declare
  preview_only boolean := true;
  merge_row record;
  moved_comments_count integer;
  moved_interviews_count integer;
  moved_case_studies_count integer;
  conflicting_case_studies_count integer;
  moved_delibs_count integer;
  conflicting_delibs_count integer;
  moved_avatar_count integer;
  copied_photo_url_count integer;
  old_name_after_value text;
begin
  for merge_row in
    with prospect_users as (
      select
        u.id,
        u.full_name,
        u.email
      from users u
      where u.is_active = false
        and u.is_pic = false
        and coalesce(trim(u.full_name), '') <> ''
        and u.full_name not like '(old) %'
    ),
    submitted_applications as (
      select
        a.user_id,
        a.id as application_id,
        a.submitted,
        row_number() over (
          partition by a.user_id
          order by a.submitted desc nulls last, a.created_at desc nulls last, a.id
        ) as rank_within_user
      from applications a
      where a.submitted is not null
    ),
    best_submitted_application as (
      select
        sa.user_id,
        sa.application_id,
        sa.submitted
      from submitted_applications sa
      where sa.rank_within_user = 1
    ),
    duplicate_name_groups as (
      select
        pu.full_name,
        count(*) as account_count,
        count(bsa.user_id) as submitted_account_count
      from prospect_users pu
      left join best_submitted_application bsa
        on bsa.user_id = pu.id
      group by pu.full_name
      having count(*) > 1
    ),
    target_candidates as (
      select
        dng.full_name,
        pu.id as target_user_id,
        pu.email as target_email,
        bsa.application_id as target_submitted_application_id,
        row_number() over (
          partition by dng.full_name
          order by bsa.submitted desc nulls last, pu.id
        ) as target_rank
      from duplicate_name_groups dng
      join prospect_users pu
        on pu.full_name = dng.full_name
      join best_submitted_application bsa
        on bsa.user_id = pu.id
      where dng.submitted_account_count = 1
    ),
    selected_targets as (
      select
        tc.full_name,
        tc.target_user_id,
        tc.target_email,
        tc.target_submitted_application_id
      from target_candidates tc
      where tc.target_rank = 1
    ),
    ready_pairs as (
      select
        dng.full_name,
        st.target_user_id,
        st.target_email,
        st.target_submitted_application_id,
        pu.id as source_user_id,
        pu.email as source_email
      from duplicate_name_groups dng
      join selected_targets st
        on st.full_name = dng.full_name
      join prospect_users pu
        on pu.full_name = dng.full_name
      where dng.submitted_account_count = 1
        and pu.id <> st.target_user_id
    )
    select *
    from ready_pairs
    order by full_name, source_user_id
  loop
    moved_comments_count := 0;
    moved_interviews_count := 0;
    moved_case_studies_count := 0;
    conflicting_case_studies_count := 0;
    moved_delibs_count := 0;
    conflicting_delibs_count := 0;
    moved_avatar_count := 0;
    copied_photo_url_count := 0;
    old_name_after_value := '(old) ' || merge_row.full_name;

    if preview_only then
      select count(*)
      into moved_comments_count
      from comments
      where prospect_id::text = merge_row.source_user_id::text;

      select count(*)
      into moved_interviews_count
      from interviews
      where prospect_id::text = merge_row.source_user_id::text;

      select count(*)
      into moved_case_studies_count
      from case_studies source_cs
      where source_cs.prospect::text = merge_row.source_user_id::text
        and not exists (
          select 1
          from case_studies target_cs
          where target_cs.prospect::text = merge_row.target_user_id::text
            and target_cs.active = source_cs.active
        );

      select count(*)
      into conflicting_case_studies_count
      from case_studies source_cs
      where source_cs.prospect::text = merge_row.source_user_id::text
        and exists (
          select 1
          from case_studies target_cs
          where target_cs.prospect::text = merge_row.target_user_id::text
            and target_cs.active = source_cs.active
        );

      if to_regclass('public.delibs') is not null then
        select count(*)
        into moved_delibs_count
        from delibs source_d
        where source_d.prospect_id::text = merge_row.source_user_id::text
          and not exists (
            select 1
            from delibs target_d
            where target_d.prospect_id::text = merge_row.target_user_id::text
          );

        select count(*)
        into conflicting_delibs_count
        from delibs source_d
        where source_d.prospect_id::text = merge_row.source_user_id::text
          and exists (
            select 1
            from delibs target_d
            where target_d.prospect_id::text = merge_row.target_user_id::text
          );
      end if;

      if to_regclass('public.user_avatar') is not null then
        select count(*)
        into moved_avatar_count
        from user_avatar source_avatar
        where source_avatar.user_id = merge_row.source_user_id
          and not exists (
            select 1
            from user_avatar target_avatar
            where target_avatar.user_id = merge_row.target_user_id
          );
      end if;

      select count(*)
      into copied_photo_url_count
      from users target_user
      join users source_user
        on source_user.id = merge_row.source_user_id
      where target_user.id = merge_row.target_user_id
        and target_user.photo_url is null
        and source_user.photo_url is not null;
    else
      update comments
      set prospect_id = merge_row.target_user_id::text,
          prospect_name = merge_row.full_name
      where prospect_id::text = merge_row.source_user_id::text;
      get diagnostics moved_comments_count = row_count;

      update interviews
      set prospect_id = merge_row.target_user_id
      where prospect_id::text = merge_row.source_user_id::text;
      get diagnostics moved_interviews_count = row_count;

      update case_studies source_cs
      set prospect = merge_row.target_user_id
      where source_cs.prospect::text = merge_row.source_user_id::text
        and not exists (
          select 1
          from case_studies target_cs
          where target_cs.prospect::text = merge_row.target_user_id::text
            and target_cs.active = source_cs.active
        );
      get diagnostics moved_case_studies_count = row_count;

      select count(*)
      into conflicting_case_studies_count
      from case_studies source_cs
      where source_cs.prospect::text = merge_row.source_user_id::text
        and exists (
          select 1
          from case_studies target_cs
          where target_cs.prospect::text = merge_row.target_user_id::text
            and target_cs.active = source_cs.active
        );

      if to_regclass('public.delibs') is not null then
        update delibs source_d
        set prospect_id = merge_row.target_user_id
        where source_d.prospect_id::text = merge_row.source_user_id::text
          and not exists (
            select 1
            from delibs target_d
            where target_d.prospect_id::text = merge_row.target_user_id::text
          );
        get diagnostics moved_delibs_count = row_count;

        select count(*)
        into conflicting_delibs_count
        from delibs source_d
        where source_d.prospect_id::text = merge_row.source_user_id::text
          and exists (
            select 1
            from delibs target_d
            where target_d.prospect_id::text = merge_row.target_user_id::text
          );
      end if;

      if to_regclass('public.user_avatar') is not null then
        update user_avatar source_avatar
        set user_id = merge_row.target_user_id
        where source_avatar.user_id = merge_row.source_user_id
          and not exists (
            select 1
            from user_avatar target_avatar
            where target_avatar.user_id = merge_row.target_user_id
          );
        get diagnostics moved_avatar_count = row_count;
      end if;

      update users target_user
      set photo_url = source_user.photo_url
      from users source_user
      where target_user.id = merge_row.target_user_id
        and source_user.id = merge_row.source_user_id
        and target_user.photo_url is null
        and source_user.photo_url is not null;
      get diagnostics copied_photo_url_count = row_count;

      update users
      set application = merge_row.target_submitted_application_id
      where id = merge_row.target_user_id;

      update users
      set application = null,
          full_name = case
            when full_name like '(old) %' then full_name
            else '(old) ' || full_name
          end
      where id = merge_row.source_user_id;
    end if;

    insert into bulk_merge_results (
      row_type,
      action,
      full_name,
      source_user_id,
      source_email,
      target_user_id,
      target_email,
      target_submitted_application_id,
      comments_affected,
      interviews_affected,
      case_studies_affected,
      case_study_conflicts,
      delibs_affected,
      delib_conflicts,
      avatars_affected,
      photo_copies,
      old_name_after
    ) values (
      'detail',
      case when preview_only then 'would_merge' else 'merged' end,
      merge_row.full_name,
      merge_row.source_user_id::text,
      merge_row.source_email,
      merge_row.target_user_id::text,
      merge_row.target_email,
      merge_row.target_submitted_application_id::text,
      moved_comments_count,
      moved_interviews_count,
      moved_case_studies_count,
      conflicting_case_studies_count,
      moved_delibs_count,
      conflicting_delibs_count,
      moved_avatar_count,
      copied_photo_url_count,
      old_name_after_value
    );
  end loop;
end
$$;

commit;

select
  merged_rows.row_type,
  merged_rows.action,
  merged_rows.full_name,
  merged_rows.source_user_id,
  merged_rows.source_email,
  merged_rows.target_user_id,
  merged_rows.target_email,
  merged_rows.target_submitted_application_id,
  merged_rows.comments_affected,
  merged_rows.interviews_affected,
  merged_rows.case_studies_affected,
  merged_rows.case_study_conflicts,
  merged_rows.delibs_affected,
  merged_rows.delib_conflicts,
  merged_rows.avatars_affected,
  merged_rows.photo_copies,
  merged_rows.old_name_after
from (
  select
    0 as sort_bucket,
    row_type,
    action,
    full_name,
    source_user_id,
    source_email,
    target_user_id,
    target_email,
    target_submitted_application_id,
    comments_affected,
    interviews_affected,
    case_studies_affected,
    case_study_conflicts,
    delibs_affected,
    delib_conflicts,
    avatars_affected,
    photo_copies,
    old_name_after
  from bulk_merge_results

  union all

  select
    1 as sort_bucket,
    'summary' as row_type,
    coalesce(max(action), 'would_merge') as action,
    'TOTALS' as full_name,
    null as source_user_id,
    null as source_email,
    null as target_user_id,
    null as target_email,
    null as target_submitted_application_id,
    coalesce(sum(comments_affected), 0) as comments_affected,
    coalesce(sum(interviews_affected), 0) as interviews_affected,
    coalesce(sum(case_studies_affected), 0) as case_studies_affected,
    coalesce(sum(case_study_conflicts), 0) as case_study_conflicts,
    coalesce(sum(delibs_affected), 0) as delibs_affected,
    coalesce(sum(delib_conflicts), 0) as delib_conflicts,
    coalesce(sum(avatars_affected), 0) as avatars_affected,
    coalesce(sum(photo_copies), 0) as photo_copies,
    null as old_name_after
  from bulk_merge_results
) as merged_rows
order by
  merged_rows.sort_bucket,
  merged_rows.full_name nulls last,
  merged_rows.source_user_id nulls last;
