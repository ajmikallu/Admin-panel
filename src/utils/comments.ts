// utils/comments.ts
import type { Comment } from "@/types/blog.types";

export function buildCommentTree(comments: Comment[]): Comment[] {
  const map = new Map<string, Comment>();

  comments.forEach((c) => {
    map.set(c.id, { ...c, replies: [] });
  });

  const roots: Comment[] = [];

  map.forEach((comment) => {
    if (comment.parent_id) {
      const parent = map.get(comment.parent_id);
      parent?.replies?.push(comment);
    } else {
      roots.push(comment);
    }
  });

  return roots;
}
