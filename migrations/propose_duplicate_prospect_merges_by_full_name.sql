-- Read-only proposal query for duplicate prospect account merges.
-- This does not modify any data.
--
-- It proposes merges for duplicate prospect accounts that share the same
-- full_name, and prefers the account with the submitted application as the
-- canonical target when exactly one such account exists.
--
-- Status meanings:
-- - ready_to_merge: exactly one account in the duplicate-name group has a submitted application
-- - skip_no_submitted_account: duplicate-name group exists, but none of the accounts has a submitted application
-- - skip_multiple_submitted_accounts: more than one account in the group has a submitted application
--
-- Review the output, then use the actual merge script for the rows you approve.

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
    dng.account_count,
    dng.submitted_account_count,
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
),
selected_targets as (
  select
    tc.full_name,
    tc.account_count,
    tc.submitted_account_count,
    tc.target_user_id,
    tc.target_email,
    tc.target_submitted_application_id
  from target_candidates tc
  where tc.target_rank = 1
),
proposal_rows as (
  select
    dng.full_name,
    dng.account_count,
    dng.submitted_account_count,
    st.target_user_id,
    st.target_email,
    st.target_submitted_application_id,
    pu.id as source_user_id,
    pu.email as source_email,
    source_bsa.application_id as source_submitted_application_id
  from duplicate_name_groups dng
  left join selected_targets st
    on st.full_name = dng.full_name
  join prospect_users pu
    on pu.full_name = dng.full_name
  left join best_submitted_application source_bsa
    on source_bsa.user_id = pu.id
  where st.target_user_id is null
     or pu.id <> st.target_user_id
)
select
  case
    when pr.submitted_account_count = 1 then 'ready_to_merge'
    when pr.submitted_account_count = 0 then 'skip_no_submitted_account'
    else 'skip_multiple_submitted_accounts'
  end as status,
  pr.full_name,
  pr.account_count,
  pr.submitted_account_count,
  pr.target_user_id,
  pr.target_email,
  pr.target_submitted_application_id,
  pr.source_user_id,
  pr.source_email,
  pr.source_submitted_application_id,
  coalesce(comment_counts.comments_to_move, 0) as comments_to_move,
  coalesce(interview_counts.interviews_to_move, 0) as interviews_to_move,
  coalesce(case_counts.case_studies_to_move, 0) as case_studies_to_move,
  coalesce(case_counts.case_study_conflicts, 0) as case_study_conflicts
from proposal_rows pr
left join lateral (
  select count(*) as comments_to_move
  from comments c
  where c.prospect_id::text = pr.source_user_id::text
) comment_counts on true
left join lateral (
  select count(*) as interviews_to_move
  from interviews i
  where i.prospect_id::text = pr.source_user_id::text
) interview_counts on true
left join lateral (
  select
    count(*) filter (
      where not exists (
        select 1
        from case_studies target_cs
        where target_cs.prospect::text = pr.target_user_id::text
          and target_cs.active = source_cs.active
      )
    ) as case_studies_to_move,
    count(*) filter (
      where exists (
        select 1
        from case_studies target_cs
        where target_cs.prospect::text = pr.target_user_id::text
          and target_cs.active = source_cs.active
      )
    ) as case_study_conflicts
  from case_studies source_cs
  where source_cs.prospect::text = pr.source_user_id::text
) case_counts on true
order by
  case
    when pr.submitted_account_count = 1 then 0
    when pr.submitted_account_count = 0 then 1
    else 2
  end,
  pr.full_name,
  pr.source_user_id;
