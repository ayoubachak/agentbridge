/**
 * Enhanced debugging utilities for AgentBridge React
 */

// Define a namespace to avoid conflicts
export const AgentBridgeDebug = {
  namespace: '@agentbridge/react'
};

// Logging levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

// Global configuration for debugging
interface DebugConfig {
  /** Whether debugging is enabled */
  enabled: boolean;
  /** Minimum log level to show */
  level: LogLevel;
  /** Whether to enable verbose mode with more details */
  verbose: boolean;
  /** Add log prefix */
  prefix: string;
  /** Add timestamps to logs */
  timestamps: boolean;
  /** Custom log handler if you want to redirect logs */
  logHandler?: (level: LogLevel, ...args: any[]) => void;
}

// Default configuration
const DEFAULT_CONFIG: DebugConfig = {
  enabled: process.env.NODE_ENV !== 'production',
  level: 'info',
  verbose: false,
  prefix: '[AgentBridge]',
  timestamps: true
};

// Current configuration
let debugConfig: DebugConfig = { ...DEFAULT_CONFIG };

/**
 * Configure debug utilities with custom options
 * @param newConfig Custom configuration options
 */
export function configureDebug(newConfig: Partial<DebugConfig>): void {
  debugConfig = { ...debugConfig, ...newConfig };
}

/**
 * Set debug configuration options
 * @param newConfig Configuration options to set
 */
export function setDebugConfig(newConfig: Partial<DebugConfig>): void {
  configureDebug(newConfig);
}

/**
 * Get current debug configuration
 * @returns Current debug configuration
 */
export function getDebugConfig(): DebugConfig {
  return { ...debugConfig };
}

/**
 * Enable or disable debugging
 * @param enabled Whether debugging should be enabled
 */
export function enableDebug(enabled: boolean): void {
  debugConfig.enabled = enabled;
}

/**
 * Set the minimum log level
 * @param level Minimum log level to show
 */
export function setDebugLevel(level: LogLevel): void {
  debugConfig.level = level;
}

/**
 * Format a log message with prefix and timestamp
 * @param level Log level
 * @returns Formatted prefix
 */
function formatLogMessage(level: LogLevel): string {
  let result = debugConfig.prefix;
  
  // Add log level
  if (debugConfig.verbose) {
    result += ` [${level.toUpperCase()}]`;
  }
  
  // Add timestamp
  if (debugConfig.timestamps) {
    const now = new Date();
    result += ` [${now.toISOString()}]`;
  }
  
  return result;
}

/**
 * Log a message at a specific level
 * @param level Log level
 * @param args Arguments to log
 */
export function log(level: LogLevel, ...args: any[]): void {
  // Skip if disabled or below minimum level
  if (!debugConfig.enabled || level === 'none') {
    return;
  }
  
  const logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    none: 4
  };
  
  // Skip if below minimum level
  if (logLevels[level] < logLevels[debugConfig.level]) {
    return;
  }
  
  // Format message
  const prefix = formatLogMessage(level);
  
  // Use custom log handler if provided
  if (debugConfig.logHandler) {
    debugConfig.logHandler(level, prefix, ...args);
    return;
  }
  
  // Use appropriate console method
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
 * Try to execute a function and catch any errors
 * @param fn Function to execute
 * @param errorMessage Optional error message
 * @returns Result of the function or undefined if an error occurred
 */
export function tryCatch<T>(fn: () => T, errorMessage?: string): T | undefined {
  try {
    return fn();
  } catch (err) {
    const message = errorMessage || 'Error in tryCatch:';
    error(message, err);
    return undefined;
  }
}

/**
 * Try to execute an async function and catch any errors
 * @param fn Async function to execute
 * @param errorMessage Optional error message
 * @returns Promise of the result or undefined if an error occurred
 */
export async function tryCatchAsync<T>(fn: () => Promise<T>, errorMessage?: string): Promise<T | undefined> {
  try {
    return await fn();
  } catch (err) {
    const message = errorMessage || 'Error in tryCatchAsync:';
    error(message, err);
    return undefined;
  }
}

/**
 * Create a timer for measuring performance
 * @param label Label for the timer
 * @returns Timer functions
 */
export function createTimer(label: string) {
  const startTime = Date.now();
  let lastLapTime = startTime;
  
  return {
    /**
     * Get the total elapsed time since the timer started
     * @returns Elapsed time in milliseconds
     */
    elapsed: () => Date.now() - startTime,
    
    /**
     * Log the elapsed time with a message
     * @param message Message to log with the elapsed time
     * @returns Elapsed time in milliseconds
     */
    log: (message: string = '') => {
      const elapsed = Date.now() - startTime;
      debug(`${label}${message ? `: ${message}` : ''} (${elapsed}ms)`);
      return elapsed;
    },
    
    /**
     * Track a lap time
     * @param lapLabel Label for the lap
     * @returns Lap time in milliseconds
     */
    lap: (lapLabel: string) => {
      const now = Date.now();
      const lapTime = now - lastLapTime;
      lastLapTime = now;
      debug(`${label} - ${lapLabel} (${lapTime}ms)`);
      return lapTime;
    }
  };
}

/**
 * Format an error for logging
 * @param error Error to format
 * @returns Formatted error message
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`;
  }
  
  return String(error);
}

/**
 * Execute a function within a log group
 * @param groupName Group name
 * @param fn Function to execute
 * @returns Result of the function
 */
export function logGroup<T>(groupName: string, fn: () => T): T {
  if (debugConfig.enabled && console.group) {
    console.group(groupName);
    try {
      return fn();
    } finally {
      console.groupEnd();
    }
  }
  
  return fn();
}

/**
 * Create metadata for debugging
 * @returns Debug metadata
 */
export function createDebugMetadata() {
  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    // Try to detect React version without causing errors
    react: typeof window !== 'undefined' && 
           window.React ? 
           window.React.version : 'unknown'
  };
}

/**
 * Check if the environment is development
 * @returns True if in development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/**
 * Check if the environment is production
 * @returns True if in production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Add React version to debug namespace if available
if (typeof window !== 'undefined' && window.React && window.React.version) {
  // @ts-ignore - We know this property doesn't exist yet
  AgentBridgeDebug.reactVersion = window.React.version;
} 