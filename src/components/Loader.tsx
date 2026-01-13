import React from "react";
import { useLoader } from "@/hooks/useLoader";
import { Spinner } from "./ui/spinner";
export const Loader: React.FC = () => {
  const { isLoading, loadingMessage } = useLoader();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-2xl dark:bg-gray-800">
        <Spinner className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {loadingMessage}
        </p>
      </div>
    </div>
  );
};
