import { describe, test, expect } from 'bun:test';
import type {
  CreateContainerRequest,
  ContainerResponse,
  PortMapping,
  VolumeMount,
  ErrorResponse,
  CreateContainerScriptOutput
} from '../../types/containers';

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

  test('PortMapping 타입 검증', () => {
    const portMapping: PortMapping = {
      host: 8080,
      container: 80
    };
    expect(portMapping.host).toBe(8080);
    expect(portMapping.container).toBe(80);
  });

  test('VolumeMount 타입 검증', () => {
    const volumeMount: VolumeMount = {
      host: '/host/path',
      container: '/container/path'
    };
    expect(volumeMount.host).toBe('/host/path');
    expect(volumeMount.container).toBe('/container/path');
  });

  test('ErrorResponse 타입 검증', () => {
    const error: ErrorResponse = {
      error: 'ValidationError',
      message: 'Invalid container name',
      details: { field: 'name', value: '' }
    };
    expect(error.error).toBe('ValidationError');
    expect(error.message).toBe('Invalid container name');
    expect(error.details).toEqual({ field: 'name', value: '' });
  });

  test('ErrorResponse details 없는 경우', () => {
    const error: ErrorResponse = {
      error: 'NotFoundError',
      message: 'Container not found'
    };
    expect(error.details).toBeUndefined();
  });

  test('CreateContainerScriptOutput 타입 검증', () => {
    const scriptOutput: CreateContainerScriptOutput = {
      id: 'xyz789',
      name: 'test-container',
      image: 'nginx:latest',
      ports: [{ host: 8080, container: 80 }, { host: 8443, container: 443 }]
    };
    expect(scriptOutput.id).toBe('xyz789');
    expect(scriptOutput.ports.length).toBe(2);
    expect(scriptOutput.ports[0].host).toBe(8080);
  });

  test('ContainerResponse 모든 상태 타입 검증 - running', () => {
    const response: ContainerResponse = {
      id: 'abc123',
      name: 'test-container',
      image: 'nginx:latest',
      status: 'running',
      created: '2026-04-09T10:00:00Z',
      ports: [{ host: 8080, container: 80 }]
    };
    expect(response.status).toBe('running');
  });

  test('ContainerResponse 모든 상태 타입 검증 - stopped', () => {
    const response: ContainerResponse = {
      id: 'abc123',
      name: 'test-container',
      image: 'nginx:latest',
      status: 'stopped',
      created: '2026-04-09T10:00:00Z'
    };
    expect(response.status).toBe('stopped');
  });

  test('ContainerResponse 모든 상태 타입 검증 - exited', () => {
    const response: ContainerResponse = {
      id: 'abc123',
      name: 'test-container',
      image: 'nginx:latest',
      status: 'exited',
      created: '2026-04-09T10:00:00Z'
    };
    expect(response.status).toBe('exited');
  });
});
