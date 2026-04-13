import { describe, test, expect, mock } from 'bun:test'
import { ContainerUseCase } from '../../app/cases/containers'

describe('ContainerUseCase', () => {
  test('createContainer - 성공', async () => {
    const dockerService = {
      createContainer: mock().mockResolvedValue({
        id: 'abc123',
        name: 'test-container',
        image: 'nginx:latest',
        status: 'running',
        created: '2026-04-09T10:00:00Z',
        ports: [{ host: 8080, container: 80 }],
      }),
    }
    const useCase = new ContainerUseCase(dockerService as any)

    const result = await useCase.createContainer()

    expect(result).toMatchObject({
      id: 'abc123',
      name: 'test-container',
      status: 'running',
    })
    expect(dockerService.createContainer).toHaveBeenCalledWith()
  })

  test('startContainer - 성공', async () => {
    const dockerService = {
      startContainer: mock().mockResolvedValue(undefined),
    }
    const useCase = new ContainerUseCase(dockerService as any)

    await useCase.startContainer('abc123')

    expect(dockerService.startContainer).toHaveBeenCalledWith('abc123')
  })

  test('stopContainer - 성공', async () => {
    const dockerService = {
      stopContainer: mock().mockResolvedValue(undefined),
    }
    const useCase = new ContainerUseCase(dockerService as any)

    await useCase.stopContainer('abc123')

    expect(dockerService.stopContainer).toHaveBeenCalledWith('abc123')
  })

  test('deleteContainer - 성공', async () => {
    const dockerService = {
      deleteContainer: mock().mockResolvedValue(undefined),
    }
    const useCase = new ContainerUseCase(dockerService as any)

    await useCase.deleteContainer('abc123')

    expect(dockerService.deleteContainer).toHaveBeenCalledWith('abc123')
  })

  test('getContainer - 성공', async () => {
    const dockerService = {
      getContainer: mock().mockResolvedValue({
        id: 'abc123',
        name: 'test-container',
        image: 'nginx:latest',
        status: 'running',
        created: '2026-04-09T10:00:00Z',
      }),
    }
    const useCase = new ContainerUseCase(dockerService as any)

    const result = await useCase.getContainer('abc123')

    expect(result.id).toBe('abc123')
    expect(dockerService.getContainer).toHaveBeenCalledWith('abc123')
  })

  test('listContainers - 성공', async () => {
    const dockerService = {
      listContainers: mock().mockResolvedValue([
        {
          id: 'abc123',
          name: 'test-container',
          image: 'nginx:latest',
          status: 'running',
          created: '2026-04-09T10:00:00Z',
        },
      ]),
    }
    const useCase = new ContainerUseCase(dockerService as any)

    const result = await useCase.listContainers()

    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBe(1)
    expect(dockerService.listContainers).toHaveBeenCalled()
  })
})
