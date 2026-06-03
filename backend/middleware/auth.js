export function requireAuth(req, res, next) {
  if (!req.session) {
    return res.status(401).json({ error: 'Session not initialized.' });
  }
  if (req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized. Please login.' });
}
