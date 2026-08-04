import rateLimit from "express-rate-limit";

// Rate limiter specifically for login attempts: max 5 requests per 15 minutes per IP
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true, // Return rate limit info in standard headers (`RateLimit-*`)
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res /*, next, options */) => {
    res.status(429).json({
      statusCode: 429,
      success: false,
      message: "Too many login attempts from this IP, please try again after 15 minutes.",
      errors: [],
      data: null,
    });
  },
});
