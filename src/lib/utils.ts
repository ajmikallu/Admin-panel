import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PostView } from "@/types/blog.types";
import type { OutputData } from "@editorjs/editorjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parsePostContent(post: PostView): OutputData {
  return JSON.parse(post.content) as OutputData;
}

export function formatCommentDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
