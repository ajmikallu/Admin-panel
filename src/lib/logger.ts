/**
 * Logger utility that bypasses React DevTools console interception
 *
 * React DevTools overrides console methods, which can cause logs after await
 * to disappear during component unmount/remount cycles (especially with StrictMode).
 *
 * This utility stores references to the native console methods before React DevTools
 * can intercept them, ensuring logs always appear in the browser console.
 *
 * Features:
 * - Shows file name and line number for each log
 * - Bypasses React DevTools interception
 * - Works reliably after await operations
 * - PII-safe: Use anonymizeId() to hash user identifiers before logging
 *
 * ⚠️ PRIVACY WARNING: Never log PII (Personally Identifiable Information) directly.
 * Use anonymizeId() to hash user IDs, emails, or other identifiers before logging.
 * In production, consider implementing automatic PII filtering/masking.
 */

// Store native console methods before any interception
const nativeConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  debug: console.debug.bind(console),
  table: console.table.bind(console),
  group: console.group.bind(console),
  groupEnd: console.groupEnd.bind(console),
  time: console.time.bind(console),
  timeEnd: console.timeEnd.bind(console),
};

// Alternative: Use window.console directly (most reliable)
const getNativeConsole = () => {
  // Try to get console from window (bypasses React DevTools)
  if (typeof window !== "undefined" && window.console) {
    return window.console;
  }
  return console;
};

/**
 * Anonymize a user ID or other identifier for safe logging
 * Creates a consistent hash that cannot be reversed to the original ID
 *
 * @param id - The identifier to anonymize (user ID, email, etc.)
 * @returns A short anonymized hash (e.g., "a3f2b1" for "abc-123-def")
 *
 * @example
 * ```ts
 * const userId = userData?.user?.id;
 * const anonymizedId = anonymizeId(userId);
 * logger.info("🟢 User:", anonymizedId); // Safe to log
 * ```
 */
export function anonymizeId(id: string | null | undefined): string {
  if (!id) return "anonymous";

  // Simple hash function: creates a consistent anonymized ID
  // This is a non-cryptographic hash suitable for logging purposes
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to positive hex string and take first 8 characters
  const hexHash = Math.abs(hash).toString(16).padStart(8, "0").substring(0, 8);
  return `user_${hexHash}`;
}

/**
 * Extract filename from full path, handling various formats
 */
const extractFileName = (filePath: string): string | null => {
  if (!filePath) return null;

  // Remove query params (e.g., "Dashboard.tsx?t=123" -> "Dashboard.tsx")
  const withoutQuery = filePath.split("?")[0];

  // Extract filename from path (handle both / and \ separators)
  const fileName =
    withoutQuery.split("/").pop() ||
    withoutQuery.split("\\").pop() ||
    withoutQuery;

  // Must be a source file (ts, tsx, js, jsx)
  if (!/\.(tsx?|jsx?)$/.test(fileName)) {
    return null;
  }

  return fileName;
};

/**
 * Format log message with file location prefix
 * @param args - Original log arguments
 * @param skipFrames - Number of stack frames to skip (default: 1 for formatLogMessage itself)
 */
const formatLogMessage = (args: unknown[], skipFrames = 1): unknown[] => {
  const callerInfo = getCallerInfoWithSkip(skipFrames);
  const prefix = `[${callerInfo}]`;

  // If first arg is a string, prepend prefix to it
  if (args.length > 0 && typeof args[0] === "string") {
    return [`${prefix} ${args[0]}`, ...args.slice(1)];
  }

  // Otherwise, add prefix as first arg
  return [prefix, ...args];
};

/**
 * Extract caller info with configurable stack frame skip
 */
const getCallerInfoWithSkip = (skipFrames = 0): string => {
  try {
    const stack = new Error().stack;
    if (!stack) return "unknown";

    const lines = stack.split("\n");

    // Skip these internal logger functions
    const skipPatterns = [
      "logger.ts",
      "logger.js",
      "formatLogMessage",
      "getCallerInfo",
      "Error",
      "at Object.",
    ];

    // Start from index 2 + skipFrames to skip Error, getCallerInfo, and formatLogMessage
    const startIndex = 2 + skipFrames;

    // Look through stack trace lines
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip if line contains any skip patterns
      if (skipPatterns.some((pattern) => line.includes(pattern))) {
        continue;
      }

      // Skip node_modules, webpack, vite internals
      if (
        line.includes("node_modules") ||
        line.includes("webpack") ||
        line.includes("vite") ||
        line.includes("chunk-")
      ) {
        continue;
      }

      // Pattern 1: "at functionName (file.tsx:line:col)" - most common format
      let match = line.match(/at\s+[^(]+\s+\(([^)]+):(\d+):(\d+)\)/);
      if (match) {
        const filePath = match[1];
        const lineNum = match[2];
        const fileName = extractFileName(filePath);
        if (fileName) return `${fileName}:${lineNum}`;
      }

      // Pattern 2: "at file.tsx:line:col" (no function name)
      match = line.match(/at\s+([^:]+):(\d+):(\d+)/);
      if (match) {
        const filePath = match[1];
        const lineNum = match[2];
        const fileName = extractFileName(filePath);
        if (fileName) return `${fileName}:${lineNum}`;
      }

      // Pattern 3: "at http://localhost:5173/src/file.tsx:line:col" (full URL)
      match = line.match(/at\s+[^\s]+\/([^/:]+\.(tsx?|jsx?)):(\d+):(\d+)/);
      if (match) {
        const fileName = match[1];
        const lineNum = match[3];
        return `${fileName}:${lineNum}`;
      }
    }

    return "unknown";
  } catch (e) {
    return "unknown";
  }
};

/**
 * Reliable logger that always works, even after await
 * Automatically includes file name and line number in logs
 *
 * ⚠️ PII SAFETY: This logger does NOT automatically filter PII.
 * Always use anonymizeId() for user identifiers before logging.
 * In production, consider implementing automatic PII filtering/masking.
 *
 * @example
 * ```ts
 * import { logger, anonymizeId } from "@/lib/logger";
 *
 * // ✅ Safe: Use anonymized IDs
 * const userId = userData?.user?.id;
 * const anonymizedId = anonymizeId(userId);
 * logger.info("🟢 User:", anonymizedId);
 * // Output: [likes.api.ts:63] 🟢 User: user_a3f2b1c4
 *
 * // ❌ UNSAFE: Never log raw PII
 * // logger.info("🟢 User:", userId); // DON'T DO THIS
 * ```
 */
export const logger = {
  log: (...args: unknown[]) => {
    // Skip 2 frames: this function and formatLogMessage
    const formattedArgs = formatLogMessage(args, 2);
    nativeConsole.log(...formattedArgs);
    // Also try window.console as fallback
    try {
      getNativeConsole().log(...formattedArgs);
    } catch (e) {
      // Ignore errors
    }
  },

  info: (...args: unknown[]) => {
    // Skip 2 frames: this function and formatLogMessage
    const formattedArgs = formatLogMessage(args, 2);
    nativeConsole.info(...formattedArgs);
    try {
      getNativeConsole().info(...formattedArgs);
    } catch (e) {
      // Ignore errors
    }
  },

  warn: (...args: unknown[]) => {
    // Skip 2 frames: this function and formatLogMessage
    const formattedArgs = formatLogMessage(args, 2);
    nativeConsole.warn(...formattedArgs);
    try {
      getNativeConsole().warn(...formattedArgs);
    } catch (e) {
      // Ignore errors
    }
  },

  error: (...args: unknown[]) => {
    // Skip 2 frames: this function and formatLogMessage
    const formattedArgs = formatLogMessage(args, 2);
    nativeConsole.error(...formattedArgs);
    try {
      getNativeConsole().error(...formattedArgs);
    } catch (e) {
      // Ignore errors
    }
  },

  debug: (...args: unknown[]) => {
    // Skip 2 frames: this function and formatLogMessage
    const formattedArgs = formatLogMessage(args, 2);
    nativeConsole.debug(...formattedArgs);
    try {
      getNativeConsole().debug(...formattedArgs);
    } catch (e) {
      // Ignore errors
    }
  },

  table: (data: unknown) => {
    nativeConsole.table(data);
    try {
      getNativeConsole().table(data);
    } catch (e) {
      // Ignore errors
    }
  },

  group: (label?: string) => {
    nativeConsole.group(label);
    try {
      getNativeConsole().group(label);
    } catch (e) {
      // Ignore errors
    }
  },

  groupEnd: () => {
    nativeConsole.groupEnd();
    try {
      getNativeConsole().groupEnd();
    } catch (e) {
      // Ignore errors
    }
  },

  time: (label?: string) => {
    nativeConsole.time(label);
    try {
      getNativeConsole().time(label);
    } catch (e) {
      // Ignore errors
    }
  },

  timeEnd: (label?: string) => {
    nativeConsole.timeEnd(label);
    try {
      getNativeConsole().timeEnd(label);
    } catch (e) {
      // Ignore errors
    }
  },
};

/**
 * Ultra-reliable logger using direct window.console access
 * Use this for critical debugging after await operations
 * Also includes file location info
 */
export const safeLog = {
  log: (...args: unknown[]) => {
    if (typeof window !== "undefined" && window.console) {
      const formattedArgs = formatLogMessage(args, 2);
      window.console.log(...formattedArgs);
    }
  },
  info: (...args: unknown[]) => {
    if (typeof window !== "undefined" && window.console) {
      const formattedArgs = formatLogMessage(args, 2);
      window.console.info(...formattedArgs);
    }
  },
  warn: (...args: unknown[]) => {
    if (typeof window !== "undefined" && window.console) {
      const formattedArgs = formatLogMessage(args, 2);
      window.console.warn(...formattedArgs);
    }
  },
  error: (...args: unknown[]) => {
    if (typeof window !== "undefined" && window.console) {
      const formattedArgs = formatLogMessage(args, 2);
      window.console.error(...formattedArgs);
    }
  },
};

// Export default logger
export default logger;
