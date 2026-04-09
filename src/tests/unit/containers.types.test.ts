import { describe, test, expect } from 'bun:test';
import type { CreateContainerRequest, ContainerResponse, PortMapping } from '../../types/containers';

describe('Container Types', () => {
  test('CreateContainerRequest 타입 검증', () => {
    const request: CreateContainerRequest = { name: 'test-container' };
    expect(request.name).toBe('test-container');
  });

  test('ContainerResponse 타입 검증', () => {
    const response: ContainerResponse = {
      id: 'abc123',
      name: 'test-container',
      image: 'nginx:latest',
      status: 'running',
      created: '2026-04-09T10:00:00Z',
      ports: [{ host: 8080, container: 80 }]
    };
    expect(response.status).toBe('running');
    expect(response.ports?.[0]?.host).toBe(8080);
  });
});
