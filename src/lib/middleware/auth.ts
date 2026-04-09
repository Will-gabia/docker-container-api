import { Context, Next } from 'hono';

export const authMiddleware = async (c: Context, next: Next) => {
  const apiKey = c.req.header('X-API-Key');
  const validApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    return c.json(
      { error: 'Unauthorized', message: 'Invalid API key' },
      401
    );
  }

  await next();
};