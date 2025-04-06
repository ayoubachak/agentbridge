/**
 * Debug utilities for AgentBridge React framework
 */

// Logging levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Global configuration for debugging
interface DebugConfig {
  /** Whether debugging is enabled */
  enabled: boolean;
  /** Minimum log level to show */
  level: LogLevel;
  /** Whether to enable verbose mode */
  verbose: boolean;
  /** Custom log handler */
  logHandler?: (level: LogLevel, ...args: any[]) => void;
}

// Default configuration
const defaultConfig: DebugConfig = {
  enabled: process.env.NODE_ENV !== 'production',
  level: 'warn',
  verbose: false
};

// Current configuration
let config: DebugConfig = { ...defaultConfig };

/**
 * Set debug configuration
 * @param newConfig New configuration options
 */
export function configureDebug(newConfig: Partial<DebugConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Get current debug configuration
 */
export function getDebugConfig(): DebugConfig {
  return { ...config };
}

/**
 * Enable or disable debugging
 * @param enabled Whether debugging should be enabled
 */
export function enableDebug(enabled: boolean): void {
  config.enabled = enabled;
}

/**
 * Log a message at the specified level
 * @param level Log level
 * @param args Arguments to log
 */
export function log(level: LogLevel, ...args: any[]): void {
  // Don't log if debugging is disabled
  if (!config.enabled) return;
  
  // Check if the level is sufficient to log
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
  const configLevelIndex = levels.indexOf(config.level);
  const currentLevelIndex = levels.indexOf(level);
  
  if (currentLevelIndex < configLevelIndex) return;
  
  // Use custom log handler if provided
  if (config.logHandler) {
    config.logHandler(level, ...args);
    return;
  }
  
  // Format the output
  const timestamp = new Date().toISOString();
  const prefix = `[AgentBridge React ${level.toUpperCase()}] ${timestamp}`;
  
  // Log using the appropriate console method
  switch (level) {
    case 'debug':
      console.debug(prefix, ...args);
      break;
    case 'info':
      console.info(prefix, ...args);
      break;
    case 'warn':
      console.warn(prefix, ...args);
      break;
    case 'error':
      console.error(prefix, ...args);
      break;
  }
}

/**
 * Log a debug message
 * @param args Arguments to log
 */
export function debug(...args: any[]): void {
  log('debug', ...args);
}

/**
 * Log an info message
 * @param args Arguments to log
 */
export function info(...args: any[]): void {
  log('info', ...args);
}

/**
 * Log a warning message
 * @param args Arguments to log
 */
export function warn(...args: any[]): void {
  log('warn', ...args);
}

/**
 * Log an error message
 * @param args Arguments to log
 */
export function error(...args: any[]): void {
  log('error', ...args);
}

/**
 * Wrapper for try-catch blocks with automatic error logging
 * @param fn Function to execute
 * @param errorMessage Optional custom error message
 * @returns The result of the function or undefined if it threw an error
 */
export function tryCatch<T>(fn: () => T, errorMessage?: string): T | undefined {
  try {
    return fn();
  } catch (err) {
    const message = errorMessage || 'Error in AgentBridge React';
    error(message, err);
    return undefined;
  }
}

/**
 * Wrapper for async try-catch blocks with automatic error logging
 * @param fn Async function to execute
 * @param errorMessage Optional custom error message
 * @returns A promise that resolves to the result of the function or undefined if it threw an error
 */
export async function tryCatchAsync<T>(fn: () => Promise<T>, errorMessage?: string): Promise<T | undefined> {
  try {
    return await fn();
  } catch (err) {
    const message = errorMessage || 'Error in AgentBridge React';
    error(message, err);
    return undefined;
  }
}

/**
 * Create a simple performance timer for debugging
 * @param label Label for the timer
 * @returns An object with start, end, and cancel methods
 */
export function createTimer(label: string) {
  const startTime = performance.now();
  let finished = false;
  
  return {
    start: () => {
      if (config.verbose) {
        debug(`${label} started`);
      }
      return startTime;
    },
    end: () => {
      if (finished) return;
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (config.verbose) {
        debug(`${label} completed in ${duration.toFixed(2)}ms`);
      }
      
      finished = true;
      return duration;
    },
    cancel: () => {
      if (finished) return;
      
      if (config.verbose) {
        debug(`${label} cancelled`);
      }
      
      finished = true;
    }
  };
}

/**
 * Format an error into a readable string
 * @param error The error to format
 * @returns A string representation of the error
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`;
  }
  
  return String(error);
} 