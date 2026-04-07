const createError = require('http-errors');

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return next(createError(401, 'Not authenticated'));
    if (req.user.role !== role) return next(createError(403, 'Forbidden'));
    next();
  };
}

module.exports = { requireRole };
