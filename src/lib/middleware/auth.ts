import { Context, Next } from 'hono';
import { timingSafeEqual as cryptoTimingSafeEqual } from 'crypto';

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');

  try {
    return cryptoTimingSafeEqual(bufferA, bufferB);
  } catch {
    return false;
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  const apiKey = c.req.header('X-API-Key');
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    console.warn('API_KEY environment variable is not set');
    return c.json(
      { error: 'Unauthorized', message: 'Invalid API key' },
      401
    );
  }

  if (!apiKey || !timingSafeEqual(apiKey, validApiKey)) {
    return c.json(
      { error: 'Unauthorized', message: 'Invalid API key' },
      401
    );
  }

  await next();
};