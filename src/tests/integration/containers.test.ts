import { describe, test, expect, beforeAll, afterEach } from 'bun:test'
import { Hono } from 'hono'

describe('Container API Integration Tests', () => {
  const apiKey = process.env.API_KEY || 'dev-api-key-12345'
  let app: Hono
  let containerId: string | undefined

  beforeAll(async () => {
    const isDockerAvailable = await checkDockerAvailable()
    if (!isDockerAvailable) {
      console.warn('Docker not available, skipping integration tests')
      return
    }

    app = (await import('../../app')).app
  })

  afterEach(async () => {
    if (containerId) {
      try {
        await app.request(`/containers/${containerId}`, {
          method: 'DELETE',
          headers: { 'X-API-Key': apiKey },
        })
      } catch (error) {
        console.warn(`Failed to delete container ${containerId}:`, error)
      }
      containerId = undefined
    }
  })

  async function checkDockerAvailable(): Promise<boolean> {
    try {
      const { spawn } = await import('child_process')
      return new Promise(resolve => {
        const proc = spawn('docker', ['ps'])
        proc.on('close', code => resolve(code === 0))
        proc.on('error', () => resolve(false))
      })
    } catch {
      return false
    }
  }

  test('인증 없이 요청 시 401 반환', async () => {
    const res = await app.request('/containers')
    expect(res.status).toBe(401)
  })

  test('잘못된 API Key로 요청 시 401 반환', async () => {
    const res = await app.request('/containers', {
      headers: { 'X-API-Key': 'wrong-key' },
    })
    expect(res.status).toBe(401)
  })

  test('POST /containers - 컨테이너 생성', async () => {
    const res = await app.request('/containers', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.status).toBe('running')
    containerId = json.id
  })

  test('GET /containers/:id - 컨테이너 조회', async () => {
    const createRes = await app.request('/containers', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    expect(createRes.status).toBe(201)
    const createJson = await createRes.json()
    containerId = createJson.id

    const res = await app.request(`/containers/${containerId}`, {
      headers: { 'X-API-Key': apiKey },
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.id).toBe(containerId)
  })

  test('GET /containers - 컨테이너 목록 조회', async () => {
    const res = await app.request('/containers', {
      headers: { 'X-API-Key': apiKey },
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json)).toBe(true)
  })

  test('POST /containers/:id/stop - 컨테이너 정지', async () => {
    const createRes = await app.request('/containers', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    expect(createRes.status).toBe(201)
    const createJson = await createRes.json()
    containerId = createJson.id

    const res = await app.request(`/containers/${containerId}/stop`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey },
    })

    expect(res.status).toBe(204)
  })

  test('POST /containers/:id/start - 컨테이너 시작', async () => {
    const createRes = await app.request('/containers', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    expect(createRes.status).toBe(201)
    const createJson = await createRes.json()
    containerId = createJson.id

    const stopRes = await app.request(`/containers/${containerId}/stop`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey },
    })

    expect(stopRes.status).toBe(204)

    const res = await app.request(`/containers/${containerId}/start`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey },
    })

    expect(res.status).toBe(204)
  })

  test('DELETE /containers/:id - 컨테이너 삭제', async () => {
    const createRes = await app.request('/containers', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    expect(createRes.status).toBe(201)
    const createJson = await createRes.json()
    containerId = createJson.id

    const res = await app.request(`/containers/${containerId}`, {
      method: 'DELETE',
      headers: { 'X-API-Key': apiKey },
    })

    expect(res.status).toBe(204)
    containerId = undefined
  })
})
