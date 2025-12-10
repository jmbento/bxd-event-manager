/**
 * Middleware de Autenticação JWT
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key-change-in-production';

/**
 * Verifica se o token JWT é válido
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      error: 'Token de acesso não fornecido',
      code: 'NO_TOKEN'
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(403).json({
      error: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Verifica se o usuário tem uma permissão específica
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }
    
    // Admin tem todas as permissões
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Verifica permissão específica
    if (req.user.permissions && req.user.permissions[permission]) {
      return next();
    }
    
    return res.status(403).json({
      error: 'Permissão negada',
      code: 'PERMISSION_DENIED',
      required: permission
    });
  };
};

/**
 * Verifica se o usuário tem um dos roles permitidos
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }
    
    if (roles.includes(req.user.role)) {
      return next();
    }
    
    return res.status(403).json({
      error: 'Acesso negado para este nível de usuário',
      code: 'ROLE_NOT_ALLOWED',
      required: roles
    });
  };
};

/**
 * Gera um token JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
      assigned_gate_id: user.assigned_gate_id,
      assigned_vendor_id: user.assigned_vendor_id
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

module.exports = {
  authenticateToken,
  requirePermission,
  requireRole,
  generateToken,
  JWT_SECRET
};
