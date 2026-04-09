import { describe, test, expect, beforeAll } from 'bun:test';
import { Hono } from 'hono';

describe('Container API Integration Tests', () => {
  const apiKey = process.env.API_KEY || 'dev-api-key-12345';
  let app: Hono;

  beforeAll(async () => {
    const isDockerAvailable = await checkDockerAvailable();
    if (!isDockerAvailable) {
      console.warn('Docker not available, skipping integration tests');
      return;
    }

    app = (await import('../../app')).app;
  });

  async function checkDockerAvailable(): Promise<boolean> {
    try {
      const { spawn } = await import('child_process');
      return new Promise((resolve) => {
        const proc = spawn('docker', ['ps']);
        proc.on('close', (code) => resolve(code === 0));
        proc.on('error', () => resolve(false));
      });
    } catch {
      return false;
    }
  }

  test('인증 없이 요청 시 401 반환', async () => {
    const res = await app.request('/containers');
    expect(res.status).toBe(401);
  });

  test('잘못된 API Key로 요청 시 401 반환', async () => {
    const res = await app.request('/containers', {
      headers: { 'X-API-Key': 'wrong-key' }
    });
    expect(res.status).toBe(401);
  });

  test('POST /containers - 컨테이너 생성', async () => {
    const containerName = `test-${Date.now()}`;
    let containerId: string;

    const res = await app.request('/containers', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: containerName })
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.name).toBe(containerName);
    expect(json.status).toBe('running');
    containerId = json.id;

    try {
      await app.request(`/containers/${containerId}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': apiKey }
      });
    } catch (error) {
      console.warn(`Failed to delete container ${containerId}:`, error);
    }
  });

  test('GET /containers/:id - 컨테이너 조회', async () => {
    const containerName = `test-${Date.now()}`;
    let containerId: string;

    const createRes = await app.request('/containers', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: containerName })
    });

    expect(createRes.status).toBe(201);
    const createJson = await createRes.json();
    containerId = createJson.id;

    const res = await app.request(`/containers/${containerId}`, {
      headers: { 'X-API-Key': apiKey }
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe(containerId);

    try {
      await app.request(`/containers/${containerId}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': apiKey }
      });
    } catch (error) {
      console.warn(`Failed to delete container ${containerId}:`, error);
    }
  });

  test('GET /containers - 컨테이너 목록 조회', async () => {
    const res = await app.request('/containers', {
      headers: { 'X-API-Key': apiKey }
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
  });

  test('POST /containers/:id/stop - 컨테이너 정지', async () => {
    const containerName = `test-${Date.now()}`;
    let containerId: string;

    const createRes = await app.request('/containers', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: containerName })
    });

    expect(createRes.status).toBe(201);
    const createJson = await createRes.json();
    containerId = createJson.id;

    const res = await app.request(`/containers/${containerId}/stop`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey }
    });

    expect(res.status).toBe(204);

    try {
      await app.request(`/containers/${containerId}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': apiKey }
      });
    } catch (error) {
      console.warn(`Failed to delete container ${containerId}:`, error);
    }
  });

  test('POST /containers/:id/start - 컨테이너 시작', async () => {
    const containerName = `test-${Date.now()}`;
    let containerId: string;

    const createRes = await app.request('/containers', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: containerName })
    });

    expect(createRes.status).toBe(201);
    const createJson = await createRes.json();
    containerId = createJson.id;

    const stopRes = await app.request(`/containers/${containerId}/stop`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey }
    });

    expect(stopRes.status).toBe(204);

    const res = await app.request(`/containers/${containerId}/start`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey }
    });

    expect(res.status).toBe(204);

    try {
      await app.request(`/containers/${containerId}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': apiKey }
      });
    } catch (error) {
      console.warn(`Failed to delete container ${containerId}:`, error);
    }
  });

  test('DELETE /containers/:id - 컨테이너 삭제', async () => {
    const containerName = `test-${Date.now()}`;
    let containerId: string;

    const createRes = await app.request('/containers', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: containerName })
    });

    expect(createRes.status).toBe(201);
    const createJson = await createRes.json();
    containerId = createJson.id;

    const res = await app.request(`/containers/${containerId}`, {
      method: 'DELETE',
      headers: { 'X-API-Key': apiKey }
    });

    expect(res.status).toBe(204);
  });
});