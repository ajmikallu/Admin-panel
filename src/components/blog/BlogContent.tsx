import { memo, useMemo } from "react";
import { EditorRenderer } from "@/components/blog/EditorRenderer";
import type { OutputData } from "@editorjs/editorjs";
import { logger } from "@/lib/logger";

type Props = {
  content: string;
  postId: string;
};

export const BlogContent = memo(({ content, postId }: Props) => {
  const editorData = useMemo<OutputData | null>(() => {
    try {
      return JSON.parse(content);
    } catch (err) {
      logger.error({ err, postId }, "Editor content parse failed");
      return null;
    }
  }, [content, postId]);

  if (!editorData) {
    return (
      <div className="rounded bg-red-100 p-4 text-center text-red-600">
        Failed to load content
      </div>
    );
  }

  return (
    <div className="editor-content prose prose-lg max-w-none px-4">
      <EditorRenderer data={editorData} />
    </div>
  );
});
