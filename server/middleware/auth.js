const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function authRequired(req, res, next) {
  try {
    const token = req.cookies?.auth_token || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, error: 'Not authenticated' });
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.uid, email: payload.email };
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
}

module.exports = { authRequired };


