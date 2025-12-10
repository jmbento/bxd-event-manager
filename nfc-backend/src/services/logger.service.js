/**
 * BXD Event Manager - Sistema de Logs Estruturados
 * Para escala enterprise com monitoramento completo
 */

const winston = require('winston');

// Formato customizado para logs estruturados
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Formato para console em desenvolvimento
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} ${level}: ${message} ${metaStr}`;
  })
);

// Criar logger principal
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { 
    service: 'bxd-nfc-backend',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console - sempre ativo
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? logFormat : devFormat
    })
  ]
});

// Em produção, adicionar transporte para arquivos
if (process.env.NODE_ENV === 'production') {
  // Logs de erro em arquivo separado
  logger.add(new winston.transports.File({ 
    filename: 'logs/error.log', 
    level: 'error',
    format: logFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5
  }));
  
  // Todos os logs
  logger.add(new winston.transports.File({ 
    filename: 'logs/combined.log',
    format: logFormat,
    maxsize: 10 * 1024 * 1024,
    maxFiles: 10
  }));
}

// =============================================================================
// HELPERS DE LOG ESPECÍFICOS
// =============================================================================

/**
 * Log de transação financeira (CRÍTICO)
 */
logger.transaction = (type, data) => {
  logger.info(`TRANSACTION:${type.toUpperCase()}`, {
    category: 'financial',
    transaction_type: type,
    ...data,
    logged_at: new Date().toISOString()
  });
};

/**
 * Log de autenticação
 */
logger.auth = (action, data) => {
  logger.info(`AUTH:${action.toUpperCase()}`, {
    category: 'security',
    auth_action: action,
    ...data
  });
};

/**
 * Log de acesso NFC
 */
logger.access = (action, data) => {
  logger.info(`ACCESS:${action.toUpperCase()}`, {
    category: 'access_control',
    access_action: action,
    ...data
  });
};

/**
 * Log de performance
 */
logger.perf = (operation, durationMs, data = {}) => {
  const level = durationMs > 2000 ? 'warn' : 'info';
  logger[level](`PERF:${operation}`, {
    category: 'performance',
    operation,
    duration_ms: durationMs,
    slow: durationMs > 1000,
    ...data
  });
};

/**
 * Log de erro com contexto
 */
logger.errorWithContext = (error, context = {}) => {
  logger.error(error.message, {
    category: 'error',
    error_name: error.name,
    error_code: error.code,
    stack: error.stack,
    ...context
  });
};

/**
 * Log de requisição HTTP (para Morgan replacement)
 */
logger.http = (req, res, duration) => {
  const logData = {
    category: 'http',
    method: req.method,
    url: req.originalUrl,
    status: res.statusCode,
    duration_ms: duration,
    ip: req.ip || req.connection?.remoteAddress,
    user_agent: req.get('User-Agent'),
    user_id: req.user?.id
  };
  
  if (res.statusCode >= 400) {
    logger.warn('HTTP:ERROR', logData);
  } else {
    logger.info('HTTP:REQUEST', logData);
  }
};

/**
 * Log de integração externa (Resend, Stripe, etc)
 */
logger.integration = (service, action, data) => {
  logger.info(`INTEGRATION:${service.toUpperCase()}:${action}`, {
    category: 'integration',
    service,
    action,
    ...data
  });
};

// =============================================================================
// MIDDLEWARE EXPRESS PARA LOGS
// =============================================================================

/**
 * Middleware de log de requisições
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Capturar quando a resposta terminar
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req, res, duration);
  });
  
  next();
};

/**
 * Middleware de log de erros
 */
const errorLogger = (err, req, res, next) => {
  logger.errorWithContext(err, {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    user_id: req.user?.id,
    ip: req.ip
  });
  
  next(err);
};

// =============================================================================
// EXPORTAR
// =============================================================================

module.exports = {
  logger,
  requestLogger,
  errorLogger
};
