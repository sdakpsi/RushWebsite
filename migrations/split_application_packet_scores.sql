alter table packet_scores
drop constraint if exists packet_scores_score_type_check;

alter table packet_scores
add constraint packet_scores_score_type_check
check (
  score_type in (
    'application',
    'application_professionalism',
    'application_brotherhood',
    'resume'
  )
);

alter table packet_scores
drop constraint if exists packet_scores_score_check;

alter table packet_scores
add constraint packet_scores_score_check
check (
  (
    score_type in ('application', 'resume')
    and score between 1 and 8
  )
  or (
    score_type in ('application_professionalism', 'application_brotherhood')
    and score between 1 and 5
  )
);
