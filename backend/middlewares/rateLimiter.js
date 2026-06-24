const { rateLimit } = require('express-rate-limit');

const getKey = (req) => req.user?.id || req.ip;

const activeStreams = new Map();

const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getKey,
  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000 / 60);
    res.status(429).json({
      message: `Too many messages. Please try again after ${retryAfter} minute${retryAfter > 1 ? 's' : ''}.`,
    });
  },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getKey,
  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000 / 60);
    res.status(429).json({
      message: `Too many requests. Please try again after ${retryAfter} minutes.`,
    });
  },
});

const concurrentLimiter = (req, res, next) => {
  const userId = req.user.id;
  if (activeStreams.get(userId)) {
    return res.status(429).json({ message: 'You already have a request in progress.' });
  }
  activeStreams.set(userId, true);
  res.on('finish', () => activeStreams.delete(userId));
  res.on('close', () => activeStreams.delete(userId));
  next();
};

module.exports = { messageLimiter, apiLimiter, concurrentLimiter };