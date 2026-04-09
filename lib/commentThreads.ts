import { type Comment, type CommentThread, type ProspectCommentThreadGroup } from "@/lib/types";

function getCreatedAtTime(createdAt: string) {
  return new Date(createdAt).getTime();
}

function compareNewestFirst(a: Comment, b: Comment) {
  const createdAtDiff = getCreatedAtTime(b.created_at) - getCreatedAtTime(a.created_at);

  if (createdAtDiff !== 0) {
    return createdAtDiff;
  }

  return b.id.localeCompare(a.id);
}

function compareOldestFirst(a: Comment, b: Comment) {
  return compareNewestFirst(b, a);
}

export function createCommentThreadKey(activeId: string, prospectId: string) {
  return `${activeId}::${prospectId}`;
}

export function groupCommentsIntoThreads(comments: Comment[]): CommentThread[] {
  const threadsByKey = new Map<string, Comment[]>();

  comments.forEach((comment) => {
    const threadKey = createCommentThreadKey(comment.active_id, comment.prospect_id);
    const existingComments = threadsByKey.get(threadKey) ?? [];
    existingComments.push(comment);
    threadsByKey.set(threadKey, existingComments);
  });

  const threads: CommentThread[] = [];

  Array.from(threadsByKey.entries()).forEach(([threadKey, threadComments]) => {
      const newestFirstComments = [...threadComments].sort(compareNewestFirst);
      const latestComment = newestFirstComments[0];

      if (!latestComment) {
        return;
      }

      threads.push({
        threadKey,
        prospect_id: latestComment.prospect_id,
        prospect_name: latestComment.prospect_name,
        prospect_photo_url: latestComment.prospect_photo_url ?? null,
        active_id: latestComment.active_id,
        active_name: latestComment.active_name,
        latest_comment: latestComment,
        history: [...threadComments].sort(compareOldestFirst),
      });
    });

  return threads.sort((a, b) => compareNewestFirst(a.latest_comment, b.latest_comment));
}

export function getLatestCommentsByThread(comments: Comment[]) {
  return groupCommentsIntoThreads(comments).map((thread) => thread.latest_comment);
}

export function groupCommentThreadsByProspect(
  threads: CommentThread[]
): ProspectCommentThreadGroup[] {
  const groupsByProspect = new Map<string, CommentThread[]>();

  threads.forEach((thread) => {
    const existingThreads = groupsByProspect.get(thread.prospect_id) ?? [];
    existingThreads.push(thread);
    groupsByProspect.set(thread.prospect_id, existingThreads);
  });

  const groups: ProspectCommentThreadGroup[] = [];

  Array.from(groupsByProspect.entries()).forEach(([prospectId, prospectThreads]) => {
      const sortedThreads = [...prospectThreads].sort((a, b) =>
        compareNewestFirst(a.latest_comment, b.latest_comment)
      );
      const latestThread = sortedThreads[0];

      if (!latestThread) {
        return;
      }

      groups.push({
        prospect_id: prospectId,
        prospect_name: latestThread.prospect_name,
        prospect_photo_url: latestThread.prospect_photo_url ?? null,
        latest_comment_at: latestThread.latest_comment.created_at,
        threads: sortedThreads,
      });
    });

  return groups.sort(
    (a, b) =>
      getCreatedAtTime(b.latest_comment_at) - getCreatedAtTime(a.latest_comment_at)
  );
}
