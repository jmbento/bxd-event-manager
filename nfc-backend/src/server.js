/**
 * BXD NFC Backend - Servidor Principal
 * Sistema de pulseiras NFC para eventos
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Importar rotas
const authRoutes = require('./routes/auth.routes');
const attendeeRoutes = require('./routes/attendee.routes');
const wristbandRoutes = require('./routes/wristband.routes');
const accessRoutes = require('./routes/access.routes');
const transactionRoutes = require('./routes/transaction.routes');
const accountRoutes = require('./routes/account.routes');
const reportRoutes = require('./routes/report.routes');

// Rotas de email (ES Module - precisa de import dinâmico)
let emailRoutes = null;
import('./routes/email.routes.js').then(module => {
  emailRoutes = module.default;
}).catch(err => {
  console.warn('⚠️ Email routes não carregadas:', err.message);
});

// Middleware de autenticação
const { authenticateToken } = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3001;

// =============================================================================
// MIDDLEWARES GLOBAIS
// =============================================================================

// Segurança
app.use(helmet());

// CORS - ajuste as origens conforme necessário
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://seu-dominio.com', 'https://bxd-power-event.vercel.app']
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minuto
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { 
    error: 'Muitas requisições. Tente novamente em alguns minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use('/api/', limiter);

// =============================================================================
// ROTAS
// =============================================================================

// Health check (sem autenticação)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'BXD NFC Backend',
    version: '1.0.0'
  });
});

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas (requerem autenticação)
app.use('/api/attendees', authenticateToken, attendeeRoutes);
app.use('/api/wristbands', authenticateToken, wristbandRoutes);
app.use('/api/access-logs', authenticateToken, accessRoutes);
app.use('/api/transactions', authenticateToken, transactionRoutes);
app.use('/api/accounts', authenticateToken, accountRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);

// Rota de email (carregada dinamicamente)
app.use('/api/email', (req, res, next) => {
  if (emailRoutes) {
    return emailRoutes(req, res, next);
  }
  res.status(503).json({ error: 'Serviço de email não disponível' });
});

// =============================================================================
// TRATAMENTO DE ERROS
// =============================================================================

// 404 - Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    code: 'NOT_FOUND',
    path: req.originalUrl
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  
  // Erros de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erro de validação',
      code: 'VALIDATION_ERROR',
      details: err.errors || err.message
    });
  }
  
  // Erros de autenticação
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Não autorizado',
      code: 'UNAUTHORIZED'
    });
  }
  
  // Erro genérico
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message,
    code: 'INTERNAL_ERROR'
  });
});

// =============================================================================
// INICIAR SERVIDOR
// =============================================================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎫 BXD NFC Backend - Sistema de Pulseiras              ║
║                                                           ║
║   Servidor rodando em: http://localhost:${PORT}             ║
║   Ambiente: ${process.env.NODE_ENV || 'development'}                            ║
║                                                           ║
║   Endpoints:                                              ║
║   • POST /api/auth/login                                  ║
║   • GET  /api/wristbands/:uid/status                      ║
║   • POST /api/wristbands/assign                           ║
║   • POST /api/access-logs/check-in                        ║
║   • POST /api/transactions/topup                          ║
║   • POST /api/transactions/purchase                       ║
║   • GET  /api/accounts/:wristband_uid/balance             ║
║   • GET  /api/reports/leads                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
