import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
} from "lucide-react";
import type { CommentType, CommentStatus } from "@/types/comment.types";
import { getStatusBadge } from "./getStatusBadge";

type CommentCardProps = {
  comment: CommentType;
  onModerate: (commentId: string, status: CommentStatus) => void;
  moderatingId: string | null;
  disabled?: boolean;
};

export function CommentCard({
  comment,
  onModerate,
  moderatingId,
  disabled = false,
}: CommentCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
      <div className="p-4">
        {/* Status and Post Title Row */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Post:
              </span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {comment.posts?.title || "Unknown Post"}
            </h3>
          </div>
          <div className="shrink-0">{getStatusBadge(comment.status)}</div>
        </div>

        {/* Comment Content */}
        <div className="mb-3 rounded-md bg-gray-50 p-3 dark:bg-gray-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {comment.content}
          </p>
        </div>

        {/* User and Meta Info */}
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <User className="mr-1.5 h-3.5 w-3.5" />
            <span>
              {comment.profile?.full_name ||
                comment.profile?.email ||
                "Anonymous"}
            </span>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-1.5 h-3.5 w-3.5" />
            <span>
              {new Date(comment.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {comment.status !== "approved" && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial"
              onClick={() => onModerate(comment.id, "approved")}
              disabled={moderatingId === comment.id || disabled}
            >
              {moderatingId === comment.id ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </>
              )}
            </Button>
          )}
          {comment.status !== "rejected" && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 sm:flex-initial dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={() => onModerate(comment.id, "rejected")}
              disabled={moderatingId === comment.id || disabled}
            >
              {moderatingId === comment.id ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
          )}
          {comment.status !== "spam" && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800 sm:flex-initial dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
              onClick={() => onModerate(comment.id, "spam")}
              disabled={moderatingId === comment.id || disabled}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Spam
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
