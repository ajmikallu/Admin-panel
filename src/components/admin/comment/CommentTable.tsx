import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { User, Calendar, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { CommentType, CommentStatus } from "@/types/comment.types";
import { getStatusBadge } from "./getStatusBadge";

type CommentTableProps = {
  comments: CommentType[];
  onModerate: (commentId: string, status: CommentStatus) => void;
  moderatingId: string | null;
  disabled?: boolean;
};

export function CommentTable({
  comments,
  onModerate,
  moderatingId,
  disabled = false,
}: CommentTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              Post
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              User
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              Comment
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              Created
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {comments.map((comment) => (
            <tr
              key={comment.id}
              className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td className="px-4 py-4">
                <div className="max-w-xs">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {comment.posts?.title || "Unknown Post"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <User className="mr-2 h-4 w-4" />
                  <span>
                    {comment.profile?.full_name ||
                      comment.profile?.email ||
                      "Anonymous"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="max-w-md">
                  <p className="line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                </div>
              </td>
              <td className="px-4 py-4">{getStatusBadge(comment.status)}</td>
              <td className="px-4 py-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date(comment.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-end gap-2">
                  {comment.status !== "approved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => onModerate(comment.id, "approved")}
                      disabled={moderatingId === comment.id || disabled}
                    >
                      {moderatingId === comment.id ? (
                        <>
                          <Spinner className="mr-1.5 h-3.5 w-3.5" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          Approve
                        </>
                      )}
                    </Button>
                  )}
                  {comment.status !== "rejected" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={() => onModerate(comment.id, "rejected")}
                      disabled={moderatingId === comment.id || disabled}
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      Reject
                    </Button>
                  )}
                  {comment.status !== "spam" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
                      onClick={() => onModerate(comment.id, "spam")}
                      disabled={moderatingId === comment.id || disabled}
                    >
                      <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                      Spam
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

