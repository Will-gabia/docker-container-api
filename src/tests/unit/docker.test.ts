import { describe, test, expect, mock } from 'bun:test'

const mockExec = mock((command: string, options: any) => {
  if (command.includes('docker inspect')) {
    return {
      code: 0,
      stdout: JSON.stringify({
        Id: 'abc123456789',
        Name: '/test-container',
        Config: { Image: 'nginx:latest' },
        State: { Status: 'running' },
        Created: '2026-04-09T10:00:00Z',
        NetworkSettings: {
          Ports: {
            '80/tcp': [{ HostPort: '8080' }],
          },
        },
      }),
      stderr: '',
    }
  }
  if (command.includes('docker ps')) {
    return {
      code: 0,
      stdout: JSON.stringify({
        ID: 'abc123456789',
        Names: ['/test-container'],
        Image: 'nginx:latest',
        State: 'running',
        Created: 1704796800,
      }),
      stderr: '',
    }
  }
  return {
    code: 0,
    stdout: JSON.stringify({
      id: 'abc123',
      name: 'test-container',
      image: 'nginx:latest',
      ports: [{ host: 8080, container: 80 }],
    }),
    stderr: '',
  }
})

mock.module('shelljs', () => ({
  default: {
    exec: mockExec,
  },
}))

import { DockerService } from '../../app/services/docker'
import type {
  ContainerResponse,
  CreateContainerScriptOutput,
} from '../../types/containers'

describe('DockerService', () => {
  let service: DockerService

  test('createContainer - 성공', () => {
    service = new DockerService()
    const result = service.createContainer()

    expect(result).resolves.toMatchObject({
      id: 'abc123',
      name: 'test-container',
      image: 'nginx:latest',
      ports: [{ host: 8080, container: 80 }],
    })
  })

  test('startContainer - 성공', () => {
    service = new DockerService()
    const result = service.startContainer('abc123')
    expect(result).resolves.toBeUndefined()
  })

  test('stopContainer - 성공', () => {
    service = new DockerService()
    const result = service.stopContainer('abc123')
    expect(result).resolves.toBeUndefined()
  })

  test('deleteContainer - 성공', () => {
    service = new DockerService()
    const result = service.deleteContainer('abc123')
    expect(result).resolves.toBeUndefined()
  })

  test('getContainer - 성공', () => {
    service = new DockerService()
    const result = service.getContainer('abc123')
    expect(result).resolves.toMatchObject({
      id: 'abc123456789',
      status: 'running',
    })
  })

  test('listContainers - 성공', () => {
    service = new DockerService()
    const result = service.listContainers()
    expect(result).resolves.toBeInstanceOf(Array)
  })

  test('startContainer - ID 유효성 검증 실패', () => {
    service = new DockerService()
    const result = service.startContainer('invalid$id')
    expect(result).rejects.toThrow('Invalid container ID')
  })

  test('stopContainer - ID 유효성 검증 실패', () => {
    service = new DockerService()
    const result = service.stopContainer('invalid$id')
    expect(result).rejects.toThrow('Invalid container ID')
  })

  test('deleteContainer - ID 유효성 검증 실패', () => {
    service = new DockerService()
    const result = service.deleteContainer('invalid$id')
    expect(result).rejects.toThrow('Invalid container ID')
  })

  test('getContainer - ID 유효성 검증 실패', () => {
    service = new DockerService()
    const result = service.getContainer('invalid$id')
    expect(result).rejects.toThrow('Invalid container ID')
  })
})
