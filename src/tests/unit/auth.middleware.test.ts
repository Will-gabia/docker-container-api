import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { authMiddleware } from '../../lib/middleware/auth.ts';
import { Hono } from 'hono';

describe('authMiddleware', () => {
  const originalApiKey = process.env.API_KEY;

  beforeEach(() => {
    process.env.API_KEY = 'test-key';
  });

  afterEach(() => {
    process.env.API_KEY = originalApiKey;
  });

  test('유효한 API Key로 요청 성공', async () => {
    const app = new Hono();
    app.use('*', authMiddleware);
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test', {
      headers: { 'X-API-Key': 'test-key' }
    });

    expect(res.status).toBe(200);
  });

  test('없는 API Key로 401 반환', async () => {
    const app = new Hono();
    app.use('*', authMiddleware);
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test', {
      headers: { 'X-API-Key': 'wrong-key' }
    });

    expect(res.status).toBe(401);
  });

  test('API Key 헤더 없이 401 반환', async () => {
    const app = new Hono();
    app.use('*', authMiddleware);
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test');

    expect(res.status).toBe(401);
  });
});