import rateLimit from 'express-rate-limit'

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts" }
})

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
})

export const refreshLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: { error: "Too many refresh attempts" }
})