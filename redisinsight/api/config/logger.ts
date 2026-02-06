import { transports, format } from 'winston';
import 'winston-daily-rotate-file';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModuleOptions,
} from 'nest-winston';
import { join } from 'path';
import config from 'src/utils/config';
import { prepareLogsData, prettyFileFormat } from 'src/utils/logsFormatter';
import { ensureLogsDir } from 'src/utils/ensureLogsDir';

const PATH_CONFIG = config.get('dir_path');
const LOGGER_CONFIG = config.get('logger');

// Ensure logs directory exists before creating file transports
// This prevents ENOENT errors on first run when .redis-insight folder doesn't exist yet
// If creation fails, file logging will be disabled to prevent app crash
const canUseFileLogging = ensureLogsDir(PATH_CONFIG.logs, LOGGER_CONFIG.files);

const transportsConfig = [];

if (LOGGER_CONFIG.stdout) {
  transportsConfig.push(
    new transports.Console({
      format: format.combine(
        prepareLogsData({
          omitSensitiveData: LOGGER_CONFIG.omitSensitiveData,
        }),
        format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike('Redis Insight', {
          colors: true,
          prettyPrint: true,
          processId: true,
          appName: true,
        }),
      ),
    }),
  );
}

if (LOGGER_CONFIG.files && canUseFileLogging) {
  transportsConfig.push(
    new transports.DailyRotateFile({
      dirname: join(PATH_CONFIG.logs),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      filename: 'redisinsight-errors-%DATE%.log',
      level: 'error',
      format: format.combine(
        prepareLogsData({
          omitSensitiveData: LOGGER_CONFIG.omitSensitiveData,
        }),
        prettyFileFormat,
      ),
    }),
  );
  transportsConfig.push(
    new transports.DailyRotateFile({
      dirname: join(PATH_CONFIG.logs),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      filename: 'redisinsight-%DATE%.log',
      format: format.combine(
        prepareLogsData({
          omitSensitiveData: LOGGER_CONFIG.omitSensitiveData,
        }),
        prettyFileFormat,
      ),
    }),
  );
}

const logger: WinstonModuleOptions = {
  format: format.errors({ stack: true }),
  transports: transportsConfig,
  level: LOGGER_CONFIG.logLevel,
};

export default logger;
