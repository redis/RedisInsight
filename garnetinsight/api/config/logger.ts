import { transports, format } from 'winston';
import 'winston-daily-rotate-file';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModuleOptions,
} from 'nest-winston';
import { join } from 'path';
import config from 'src/utils/config';
import { prepareLogsData, prettyFileFormat } from 'src/utils/logsFormatter';

const PATH_CONFIG = config.get('dir_path');
const LOGGER_CONFIG = config.get('logger');

const transportsConfig = [];

if (LOGGER_CONFIG.stdout) {
  transportsConfig.push(
    new transports.Console({
      format: format.combine(
        prepareLogsData({
          omitSensitiveData: LOGGER_CONFIG.omitSensitiveData,
        }),
        format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike('Garnet Insight', {
          colors: true,
          prettyPrint: true,
          processId: true,
          appName: true,
        }),
      ),
    }),
  );
}

if (LOGGER_CONFIG.files) {
  transportsConfig.push(
    new transports.DailyRotateFile({
      dirname: join(PATH_CONFIG.logs),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      filename: 'garnetinsight-errors-%DATE%.log',
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
      filename: 'garnetinsight-%DATE%.log',
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
