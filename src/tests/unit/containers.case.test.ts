import { describe, test, expect, mock } from 'bun:test';
import type { CreateContainerRequest } from '../../types/containers';

mock.module('../../app/services/docker', () => ({
  DockerService: mock().mockImplementation(() => ({
    createContainer: mock().mockResolvedValue({
      id: 'abc123',
      name: 'test-container',
      image: 'nginx:latest',
      status: 'running',
      created: '2026-04-09T10:00:00Z',
      ports: [{ host: 8080, container: 80 }]
    }),
    startContainer: mock().mockResolvedValue(undefined),
    stopContainer: mock().mockResolvedValue(undefined),
    deleteContainer: mock().mockResolvedValue(undefined),
    getContainer: mock().mockResolvedValue({
      id: 'abc123',
      name: 'test-container',
      image: 'nginx:latest',
      status: 'running',
      created: '2026-04-09T10:00:00Z'
    }),
    listContainers: mock().mockResolvedValue([
      {
        id: 'abc123',
        name: 'test-container',
        image: 'nginx:latest',
        status: 'running',
        created: '2026-04-09T10:00:00Z'
      }
    ])
  }))
}));

import { ContainerUseCase } from '../../app/cases/containers';

describe('ContainerUseCase', () => {
  let useCase: ContainerUseCase;

  test('createContainer - 성공', async () => {
    useCase = new ContainerUseCase();
    const request: CreateContainerRequest = { name: 'test-container' };
    const result = await useCase.createContainer(request);
    
    expect(result).toMatchObject({
      id: 'abc123',
      name: 'test-container',
      status: 'running'
    });
  });

  test('startContainer - 성공', async () => {
    useCase = new ContainerUseCase();
    await useCase.startContainer('abc123');
    expect(true).toBe(true);
  });

  test('stopContainer - 성공', async () => {
    useCase = new ContainerUseCase();
    await useCase.stopContainer('abc123');
    expect(true).toBe(true);
  });

  test('deleteContainer - 성공', async () => {
    useCase = new ContainerUseCase();
    await useCase.deleteContainer('abc123');
    expect(true).toBe(true);
  });

  test('getContainer - 성공', async () => {
    useCase = new ContainerUseCase();
    const result = await useCase.getContainer('abc123');
    expect(result.id).toBe('abc123');
  });

  test('listContainers - 성공', async () => {
    useCase = new ContainerUseCase();
    const result = await useCase.listContainers();
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(1);
  });
});

describe('ContainerUseCase', () => {
  let useCase: ContainerUseCase;

  test('createContainer - 성공', async () => {
    useCase = new ContainerUseCase();
    const request: CreateContainerRequest = { name: 'test-container' };
    const result = await useCase.createContainer(request);
    
    expect(result).toMatchObject({
      id: 'abc123',
      name: 'test-container',
      status: 'running'
    });
  });

  test('startContainer - 성공', async () => {
    useCase = new ContainerUseCase();
    await useCase.startContainer('abc123');
    expect(true).toBe(true);
  });

  test('stopContainer - 성공', async () => {
    useCase = new ContainerUseCase();
    await useCase.stopContainer('abc123');
    expect(true).toBe(true);
  });

  test('deleteContainer - 성공', async () => {
    useCase = new ContainerUseCase();
    await useCase.deleteContainer('abc123');
    expect(true).toBe(true);
  });

  test('getContainer - 성공', async () => {
    useCase = new ContainerUseCase();
    const result = await useCase.getContainer('abc123');
    expect(result.id).toBe('abc123');
  });

  test('listContainers - 성공', async () => {
    useCase = new ContainerUseCase();
    const result = await useCase.listContainers();
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(1);
  });
});
