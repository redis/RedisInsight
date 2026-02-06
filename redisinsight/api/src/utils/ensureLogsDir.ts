import * as fs from 'fs';

/**
 * Ensures the logs directory exists before the logger is initialized.
 * This prevents ENOENT errors on first run when the .redis-insight folder doesn't exist yet.
 * Uses recursive: true to create parent directories if needed.
 *
 * If directory creation fails for any reason (permissions, invalid path, etc.),
 * the error is caught and logged to console. The application will continue
 * without file logging rather than crashing on startup.
 *
 * @param logsPath - The path to the logs directory
 * @param filesLoggingEnabled - Whether file logging is enabled
 * @returns true if directory exists or was created, false if creation failed
 */
export const ensureLogsDir = (
  logsPath: string,
  filesLoggingEnabled: boolean,
): boolean => {
  if (!filesLoggingEnabled) {
    return true;
  }

  try {
    if (!fs.existsSync(logsPath)) {
      fs.mkdirSync(logsPath, { recursive: true });
    }
    return true;
  } catch (error) {
    // Log to console since file logging is not available yet
    // eslint-disable-next-line no-console
    console.error(
      `Failed to create logs directory at "${logsPath}". File logging will be disabled.`,
      error,
    );
    return false;
  }
};
