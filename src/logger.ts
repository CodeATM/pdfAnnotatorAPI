import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }), // Error logs
    new transports.File({ filename: 'logs/combined.log' }), // All logs
  ],
});

// Add Console Transport for All Environments
logger.add(
  new transports.Console({
    format: format.combine(
      format.colorize(),
      format.printf(({ level, message, timestamp, stack }) => {
        const logMessage = `${timestamp} [${level}]: ${message}`;
        return stack ? `${logMessage}\n${stack}` : logMessage;
      })
    ),
  })
);

export default logger;
