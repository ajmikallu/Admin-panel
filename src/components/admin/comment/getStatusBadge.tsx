import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Approved
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
          <XCircle className="mr-1 h-3 w-3" />
          Rejected
        </span>
      );
    case "spam":
      return (
        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Spam
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Pending
        </span>
      );
  }
}

