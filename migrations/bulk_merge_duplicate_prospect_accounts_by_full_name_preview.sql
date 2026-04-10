-- Bulk duplicate-account dry run by exact full_name.
-- This script is read-only and always returns a result table showing what
-- would happen for every ready-to-merge duplicate prospect account pair.

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
),
detail_rows as (
  select
    'detail'::text as row_type,
    'would_merge'::text as action,
    rp.full_name,
    rp.source_user_id::text as source_user_id,
    rp.source_email,
    rp.target_user_id::text as target_user_id,
    rp.target_email,
    rp.target_submitted_application_id::text as target_submitted_application_id,
    coalesce(comment_counts.comments_affected, 0) as comments_affected,
    coalesce(interview_counts.interviews_affected, 0) as interviews_affected,
    coalesce(case_counts.case_studies_affected, 0) as case_studies_affected,
    coalesce(case_counts.case_study_conflicts, 0) as case_study_conflicts,
    coalesce(delib_counts.delibs_affected, 0) as delibs_affected,
    coalesce(delib_counts.delib_conflicts, 0) as delib_conflicts,
    coalesce(avatar_counts.avatars_affected, 0) as avatars_affected,
    coalesce(photo_counts.photo_copies, 0) as photo_copies,
    '(old) ' || rp.full_name as old_name_after
  from ready_pairs rp
  left join lateral (
    select count(*) as comments_affected
    from comments c
    where c.prospect_id::text = rp.source_user_id::text
  ) comment_counts on true
  left join lateral (
    select count(*) as interviews_affected
    from interviews i
    where i.prospect_id::text = rp.source_user_id::text
  ) interview_counts on true
  left join lateral (
    select
      (
        select count(*)
        from case_studies source_cs
        where source_cs.prospect::text = rp.source_user_id::text
          and not exists (
            select 1
            from case_studies target_cs
            where target_cs.prospect::text = rp.target_user_id::text
              and target_cs.active = source_cs.active
          )
      ) as case_studies_affected,
      (
        select count(*)
        from case_studies source_cs
        where source_cs.prospect::text = rp.source_user_id::text
          and exists (
            select 1
            from case_studies target_cs
            where target_cs.prospect::text = rp.target_user_id::text
              and target_cs.active = source_cs.active
          )
      ) as case_study_conflicts
  ) case_counts on true
  left join lateral (
    select
      (
        select count(*)
        from delibs source_d
        where to_regclass('public.delibs') is not null
          and source_d.prospect_id::text = rp.source_user_id::text
          and not exists (
            select 1
            from delibs target_d
            where target_d.prospect_id::text = rp.target_user_id::text
          )
      ) as delibs_affected,
      (
        select count(*)
        from delibs source_d
        where to_regclass('public.delibs') is not null
          and source_d.prospect_id::text = rp.source_user_id::text
          and exists (
            select 1
            from delibs target_d
            where target_d.prospect_id::text = rp.target_user_id::text
          )
      ) as delib_conflicts
  ) delib_counts on true
  left join lateral (
    select count(*) as avatars_affected
    from user_avatar source_avatar
    where to_regclass('public.user_avatar') is not null
      and source_avatar.user_id = rp.source_user_id
      and not exists (
        select 1
        from user_avatar target_avatar
        where target_avatar.user_id = rp.target_user_id
      )
  ) avatar_counts on true
  left join lateral (
    select count(*) as photo_copies
    from users target_user
    join users source_user
      on source_user.id = rp.source_user_id
    where target_user.id = rp.target_user_id
      and target_user.photo_url is null
      and source_user.photo_url is not null
  ) photo_counts on true
)
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
  from detail_rows

  union all

  select
    1 as sort_bucket,
    'summary' as row_type,
    'would_merge' as action,
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
  from detail_rows
) as merged_rows
order by
  merged_rows.sort_bucket,
  merged_rows.full_name nulls last,
  merged_rows.source_user_id nulls last;
