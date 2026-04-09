import { describe, test, expect, beforeAll, afterAll } from 'bun:test';

describe('Container API Integration Tests', () => {
  const apiKey = process.env.API_KEY || 'dev-api-key-12345';
  let containerId: string;
  const containerName = `test-${Date.now()}`;
  let app: any;

  beforeAll(async () => {
    if (!process.env.DOCKER_AVAILABLE) {
      console.warn('Docker not available, skipping integration tests');
      return;
    }

    app = (await import('../../app')).app;
  });

  afterAll(async () => {
    if (!process.env.DOCKER_AVAILABLE) return;

    try {
      const res = await app.request(`/containers/${containerId}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': apiKey }
      });
      if (res.status !== 204 && res.status !== 404) {
        console.warn(`Failed to delete container: ${res.status}`);
      }
    } catch (error) {
      // 컨테이너가 없을 수 있음
    }
  });

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
  });

  test('GET /containers/:id - 컨테이너 조회', async () => {
    const res = await app.request(`/containers/${containerId}`, {
      headers: { 'X-API-Key': apiKey }
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe(containerId);
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
    const res = await app.request(`/containers/${containerId}/stop`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey }
    });

    expect(res.status).toBe(204);
  });

  test('POST /containers/:id/start - 컨테이너 시작', async () => {
    const res = await app.request(`/containers/${containerId}/start`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey }
    });

    expect(res.status).toBe(204);
  });

  test('DELETE /containers/:id - 컨테이너 삭제', async () => {
    const res = await app.request(`/containers/${containerId}`, {
      method: 'DELETE',
      headers: { 'X-API-Key': apiKey }
    });

    expect(res.status).toBe(204);
  });
});