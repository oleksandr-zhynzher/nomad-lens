type LogLevel = 'error' | 'info' | 'warn';

type LogContext = Readonly<Record<string, unknown>>;

function serializeError(error: Error): LogContext {
  return {
    message: error.message,
    name: error.name,
    stack: error.stack,
  };
}

function serializeValue(value: unknown): unknown {
  if (value instanceof Error) {
    return serializeError(value);
  }
  return value;
}

function write(level: LogLevel, message: string, context: LogContext = {}): void {
  const payload = {
    ...context,
    level,
    message,
    timestamp: new Date().toISOString(),
  };
  const line = JSON.stringify(payload, (_key, value: unknown) => serializeValue(value));

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.log(line);
}

export const logger = {
  error: (message: string, context?: LogContext): void => write('error', message, context),
  info: (message: string, context?: LogContext): void => write('info', message, context),
  warn: (message: string, context?: LogContext): void => write('warn', message, context),
};
