export interface CommentTrackingEvent {
  eventKey: string;
  label: string;
  rangeStart: string | null;
  rangeEnd: string | null;
}

export const COMMENT_TRACKING_EVENTS: CommentTrackingEvent[] = [
  {
    eventKey: "info",
    label: "Info",
    rangeStart: null,
    rangeEnd: "2026-04-07T18:00:00-07:00",
  },
  {
    eventKey: "resume",
    label: "Resume",
    rangeStart: "2026-04-07T18:00:00-07:00",
    rangeEnd: "2026-04-08T17:00:00-07:00",
  },
  {
    eventKey: "case",
    label: "Case",
    rangeStart: "2026-04-08T17:00:00-07:00",
    rangeEnd: "2026-04-10T17:00:00-07:00",
  },
  {
    eventKey: "social",
    label: "Social",
    rangeStart: "2026-04-10T17:00:00-07:00",
    rangeEnd: "2026-04-11T09:00:00-07:00",
  },
  {
    eventKey: "interview",
    label: "Interview",
    rangeStart: "2026-04-11T09:00:00-07:00",
    rangeEnd: null,
  },
];

export function createEmptyCommentCountsByEvent(): Record<string, number> {
  return COMMENT_TRACKING_EVENTS.reduce<Record<string, number>>(
    (counts, { eventKey }) => {
      counts[eventKey] = 0;
      return counts;
    },
    {}
  );
}

export function getCommentTrackingEventForTimestamp(
  value: string | Date
): CommentTrackingEvent | undefined {
  const timestamp = new Date(value).getTime();

  return COMMENT_TRACKING_EVENTS.find(({ rangeStart, rangeEnd }) => {
    const start = rangeStart ? new Date(rangeStart).getTime() : Number.NEGATIVE_INFINITY;
    const end = rangeEnd ? new Date(rangeEnd).getTime() : Number.POSITIVE_INFINITY;
    return timestamp >= start && timestamp < end;
  });
}

export function getVisibleCommentTrackingEvents(now: string | Date = new Date()) {
  const currentTime = new Date(now).getTime();

  return COMMENT_TRACKING_EVENTS.filter(({ rangeStart }) => {
    if (!rangeStart) return true;
    return new Date(rangeStart).getTime() <= currentTime;
  });
}
