// Catches anything thrown/passed to next() in controllers so the API
// always returns a consistent JSON error shape instead of crashing
// or leaking a stack trace to the client.
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error.' : err.message;
  res.status(status).json({ error: message });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
}

module.exports = { errorHandler, notFoundHandler };
