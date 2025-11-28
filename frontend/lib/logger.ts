// Simple logger utility for controlling log output
const isDevelopment = process.env.NODE_ENV === 'development';
const disableVerboseLogs = process.env.NEXT_PUBLIC_DISABLE_VERBOSE_LOGS === 'true';

export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (!disableVerboseLogs && isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  }
};


