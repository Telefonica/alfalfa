interface LogFn {
  <T extends object>(obj: T, msg?: string, ...args: any[]): void;
  (obj: unknown, msg?: string, ...args: any[]): void;
  (msg: string, ...args: any[]): void;
}

interface Logger {
  info: LogFn;
  error: LogFn;
  warn: LogFn;
  fatal: LogFn;
}

let lg: Logger = {
  info: console.info,
  warn: console.warn,
  error: console.error,
  fatal: console.error,
};

/**
 * Sets alfalfa logger
 *
 * @param logger logger
 */
export const setLogger = (logger: Logger) => {
  lg = logger;
};

/**
 * Gets current alfalfa logger
 *
 * @returns Logger
 */
export const getLogger = () => lg;
