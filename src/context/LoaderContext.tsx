import React, { createContext, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";

// Types
export interface LoaderContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  withLoader: <T>(asyncFn: () => Promise<T>, message?: string) => Promise<T>;
}

interface LoaderProviderProps {
  children: ReactNode;
}

// Context
export const LoaderContext = createContext<LoaderContextType | undefined>(
  undefined,
);

// Provider Component
export const LoaderProvider: React.FC<LoaderProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const loadCountRef = useRef(0);

  const showLoader = useCallback((message = "Loading...") => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage("Loading...");
  }, []);

  // Wrapper function for async operations with counter-based tracking
  const withLoader = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      message = "Loading...",
    ): Promise<T> => {
      // Increment counter and show loader only on transition from 0 to 1
      loadCountRef.current += 1;
      if (loadCountRef.current === 1) {
        showLoader(message);
      }

      try {
        const result = await asyncFn();
        return result;
      } finally {
        // Decrement counter and hide loader only when counter reaches 0
        loadCountRef.current -= 1;
        if (loadCountRef.current === 0) {
          hideLoader();
        }
      }
    },
    [showLoader, hideLoader],
  );

  return (
    <LoaderContext.Provider
      value={{
        isLoading,
        loadingMessage,
        showLoader,
        hideLoader,
        withLoader,
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
};

// Custom Hook
