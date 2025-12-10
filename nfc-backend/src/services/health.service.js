/**
 * BXD Event Manager - Health Check Detalhado
 * Monitoramento completo para escala enterprise
 */

const { supabase } = require('../config/supabase');

// Configurações de thresholds
const THRESHOLDS = {
  database_latency_ms: 500,    // Alerta se > 500ms
  memory_usage_percent: 85,    // Alerta se > 85%
  uptime_min_seconds: 60       // Considera "recém iniciado" se < 60s
};

/**
 * Verifica conexão com o banco de dados
 */
async function checkDatabase() {
  const start = Date.now();
  
  try {
    if (!supabase) {
      return {
        status: 'degraded',
        message: 'Supabase não configurado - usando modo local',
        latency_ms: 0
      };
    }
    
    // Query simples para testar conexão
    const { data, error } = await supabase
      .from('campaigns')
      .select('id')
      .limit(1);
    
    const latency = Date.now() - start;
    
    if (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        latency_ms: latency
      };
    }
    
    return {
      status: latency > THRESHOLDS.database_latency_ms ? 'degraded' : 'healthy',
      message: latency > THRESHOLDS.database_latency_ms ? 'Latência alta' : 'OK',
      latency_ms: latency
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error.message,
      latency_ms: Date.now() - start
    };
  }
}

/**
 * Verifica uso de memória
 */
function checkMemory() {
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
  const usagePercent = Math.round((used.heapUsed / used.heapTotal) * 100);
  
  return {
    status: usagePercent > THRESHOLDS.memory_usage_percent ? 'degraded' : 'healthy',
    heap_used_mb: heapUsedMB,
    heap_total_mb: heapTotalMB,
    usage_percent: usagePercent,
    rss_mb: Math.round(used.rss / 1024 / 1024),
    external_mb: Math.round(used.external / 1024 / 1024)
  };
}

/**
 * Informações do processo
 */
function getProcessInfo() {
  const uptime = process.uptime();
  
  return {
    uptime_seconds: Math.round(uptime),
    uptime_formatted: formatUptime(uptime),
    recently_started: uptime < THRESHOLDS.uptime_min_seconds,
    node_version: process.version,
    pid: process.pid,
    platform: process.platform,
    arch: process.arch
  };
}

/**
 * Formata uptime em formato legível
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

/**
 * Verifica configurações críticas
 */
function checkConfiguration() {
  const issues = [];
  
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('development')) {
    issues.push('JWT_SECRET não configurado ou usando valor de desenvolvimento');
  }
  
  if (!process.env.ENCRYPTION_KEY) {
    issues.push('ENCRYPTION_KEY não configurada');
  }
  
  if (!process.env.RESEND_API_KEY) {
    issues.push('RESEND_API_KEY não configurada');
  }
  
  if (!process.env.SUPABASE_URL) {
    issues.push('SUPABASE_URL não configurada');
  }
  
  return {
    status: issues.length === 0 ? 'healthy' : 'degraded',
    issues,
    environment: process.env.NODE_ENV || 'development'
  };
}

// =============================================================================
// ROTAS DE HEALTH CHECK
// =============================================================================

/**
 * Health check básico (para load balancers)
 */
async function basicHealth(req, res) {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'BXD NFC Backend',
    version: process.env.npm_package_version || '1.0.0'
  });
}

/**
 * Health check detalhado (para monitoramento)
 */
async function detailedHealth(req, res) {
  const checks = {
    database: await checkDatabase(),
    memory: checkMemory(),
    process: getProcessInfo(),
    configuration: checkConfiguration()
  };
  
  // Determinar status geral
  const statuses = [
    checks.database.status,
    checks.memory.status,
    checks.configuration.status
  ];
  
  let overallStatus = 'healthy';
  if (statuses.includes('unhealthy')) {
    overallStatus = 'unhealthy';
  } else if (statuses.includes('degraded')) {
    overallStatus = 'degraded';
  }
  
  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    service: 'BXD NFC Backend',
    version: process.env.npm_package_version || '1.0.0',
    checks
  };
  
  // Retornar 503 se não saudável (para alertas)
  const httpStatus = overallStatus === 'unhealthy' ? 503 : 200;
  res.status(httpStatus).json(response);
}

/**
 * Readiness check (pronto para receber tráfego)
 */
async function readinessCheck(req, res) {
  const dbCheck = await checkDatabase();
  
  if (dbCheck.status === 'unhealthy') {
    return res.status(503).json({
      ready: false,
      reason: 'Database unavailable',
      details: dbCheck
    });
  }
  
  res.json({
    ready: true,
    timestamp: new Date().toISOString()
  });
}

/**
 * Liveness check (processo está vivo)
 */
function livenessCheck(req, res) {
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}

// =============================================================================
// EXPORTAR
// =============================================================================

module.exports = {
  basicHealth,
  detailedHealth,
  readinessCheck,
  livenessCheck,
  checkDatabase,
  checkMemory,
  checkConfiguration
};
