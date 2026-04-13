import { describe, test, expect, beforeEach, mock } from 'bun:test'
import { Hono } from 'hono'
import { createContainerRoutes } from '../../routes/containers/index'

const mockCreateContainer = mock(() =>
  Promise.resolve({
    id: 'abc123',
    name: 'test-container',
    image: 'nginx:latest',
    status: 'running',
    created: '2026-04-09T10:00:00Z',
    ports: [{ host: 8080, container: 80 }],
  }),
)

const mockStartContainer = mock(() => Promise.resolve(undefined))
const mockStopContainer = mock(() => Promise.resolve(undefined))
const mockDeleteContainer = mock(() => Promise.resolve(undefined))
const mockGetContainer = mock(() =>
  Promise.resolve({
    id: 'abc123',
    name: 'test-container',
    image: 'nginx:latest',
    status: 'running',
    created: '2026-04-09T10:00:00Z',
  }),
)

const mockListContainers = mock(() =>
  Promise.resolve([
    {
      id: 'abc123',
      name: 'test-container',
      image: 'nginx:latest',
      status: 'running',
      created: '2026-04-09T10:00:00Z',
    },
  ]),
)

class MockContainerUseCase {
  createContainer = mockCreateContainer
  startContainer = mockStartContainer
  stopContainer = mockStopContainer
  deleteContainer = mockDeleteContainer
  getContainer = mockGetContainer
  listContainers = mockListContainers
}

describe('Container Routes', () => {
  let app: Hono
  let useCase: MockContainerUseCase

  beforeEach(() => {
    useCase = new MockContainerUseCase()
    app = new Hono()
    app.use('*', (c, next) => {
      c.set('auth', true)
      return next()
    })
    app.route('/containers', createContainerRoutes(useCase as any))
  })

  test('POST /containers - 컨테이너 생성', async () => {
    const res = await app.request('/containers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.name).toBe('test-container')
  })

  test('POST /containers/:id/start - 컨테이너 시작', async () => {
    const res = await app.request('/containers/abc123/start', {
      method: 'POST',
    })

    expect(res.status).toBe(204)
  })

  test('POST /containers/:id/stop - 컨테이너 정지', async () => {
    const res = await app.request('/containers/abc123/stop', {
      method: 'POST',
    })

    expect(res.status).toBe(204)
  })

  test('DELETE /containers/:id - 컨테이너 삭제', async () => {
    const res = await app.request('/containers/abc123', {
      method: 'DELETE',
    })

    expect(res.status).toBe(204)
  })

  test('GET /containers/:id - 컨테이너 조회', async () => {
    const res = await app.request('/containers/abc123', {
      method: 'GET',
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.id).toBe('abc123')
  })

  test('GET /containers - 컨테이너 목록 조회', async () => {
    const res = await app.request('/containers', {
      method: 'GET',
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toBeInstanceOf(Array)
  })
})
