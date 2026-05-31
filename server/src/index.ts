import { app } from './app';
import { config } from './config';
import { logger } from './logger';

const server = app.listen(config.port, () => {
  logger.info('server_started', {
    environment: config.nodeEnv,
    port: config.port,
  });
});

server.on('error', (error: Error) => {
  logger.error('server_error', { error });
  process.exit(1);
});

function shutdown(signal: NodeJS.Signals): void {
  logger.info('shutdown_started', { signal });

  const forceExitTimer = setTimeout(() => {
    logger.error('shutdown_forced', { signal });
    process.exit(1);
  }, 10_000);
  forceExitTimer.unref();

  server.close((error?: Error) => {
    clearTimeout(forceExitTimer);

    if (error) {
      logger.error('shutdown_error', { error, signal });
      process.exit(1);
    }

    logger.info('shutdown_complete', { signal });
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', (error) => {
  logger.error('uncaught_exception', { error });
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error('unhandled_rejection', { reason });
  process.exit(1);
});
