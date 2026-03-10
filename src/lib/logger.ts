import log from 'loglevel';

const isDevelopment = true;

log.setLevel(isDevelopment ? 'debug' : 'warn');

const originalFactory = log.methodFactory;
log.methodFactory = (methodName, logLevel, loggerName) => {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  return (...args: unknown[]) => {
    rawMethod(`[${methodName.toUpperCase()}]`, ...args);
  };
};

log.setLevel(log.getLevel());

const logger = log;

export default logger;
