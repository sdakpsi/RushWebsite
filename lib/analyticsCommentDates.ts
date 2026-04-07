export interface CommentTrackingDate {
  dateKey: string;
  label: string;
  rangeStart: string;
  rangeEnd: string;
}

export const COMMENT_TRACKING_DATES: CommentTrackingDate[] = [
  {
    dateKey: "2026-04-06",
    label: "Mon 4/6",
    rangeStart: "2026-04-06T00:00:00-07:00",
    rangeEnd: "2026-04-07T00:00:00-07:00",
  },
  {
    dateKey: "2026-04-07",
    label: "Tue 4/7",
    rangeStart: "2026-04-07T00:00:00-07:00",
    rangeEnd: "2026-04-08T00:00:00-07:00",
  },
  {
    dateKey: "2026-04-08",
    label: "Wed 4/8",
    rangeStart: "2026-04-08T00:00:00-07:00",
    rangeEnd: "2026-04-09T00:00:00-07:00",
  },
  {
    dateKey: "2026-04-09",
    label: "Thu 4/9",
    rangeStart: "2026-04-09T00:00:00-07:00",
    rangeEnd: "2026-04-10T00:00:00-07:00",
  },
];

export function createEmptyCommentCountsByDate(): Record<string, number> {
  return COMMENT_TRACKING_DATES.reduce<Record<string, number>>(
    (counts, { dateKey }) => {
      counts[dateKey] = 0;
      return counts;
    },
    {}
  );
}
