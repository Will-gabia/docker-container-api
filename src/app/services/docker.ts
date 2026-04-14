import shell from 'shelljs'
import type {
  ContainerResponse,
  PortMapping,
  CreateContainerScriptOutput,
  DeleteContainerScriptOutput,
} from '../../types/containers'

export class DockerService {
  private readonly SCRIPT_PATH = './scripts/create-container.sh'
  private readonly DELETE_SCRIPT_PATH = './scripts/delete-container.sh'

  private validateContainerId(id: string): void {
    const validPattern = /^[a-zA-Z0-9_-]+$/
    if (!validPattern.test(id)) {
      throw new Error(
        `Invalid container ID: ${id}. Only alphanumeric, hyphen, and underscore characters are allowed.`,
      )
    }
  }

  async createContainer(): Promise<ContainerResponse> {
    const result = shell.exec(`${this.SCRIPT_PATH}`, { silent: true })

    if (result.code !== 0) {
      throw new Error(`Failed to create container: ${result.stderr}`)
    }

    let output: CreateContainerScriptOutput
    try {
      output = JSON.parse(result.stdout)
    } catch (e) {
      throw new Error(`Failed to parse script output: Invalid JSON response`)
    }

    return {
      id: output.id.substring(0, 12),
      name: output.name,
      image: output.image,
      api_token: output.api_token,
      status: 'running',
      created: new Date().toISOString(),
      ports: output.ports,
    }
  }

  async startContainer(id: string): Promise<void> {
    this.validateContainerId(id)
    const result = shell.exec(`docker start ${id}`, { silent: true })

    if (result.code !== 0) {
      throw new Error(`Failed to start container: ${result.stderr}`)
    }
  }

  async stopContainer(id: string): Promise<void> {
    this.validateContainerId(id)
    const result = shell.exec(`docker stop ${id}`, { silent: true })

    if (result.code !== 0) {
      throw new Error(`Failed to stop container: ${result.stderr}`)
    }
  }

  async deleteContainer(id: string): Promise<{ id: string; name: string }> {
    this.validateContainerId(id)
    const result = shell.exec(`${this.DELETE_SCRIPT_PATH} ${id}`, {
      silent: true,
    })

    if (result.code !== 0) {
      throw new Error(`Failed to delete container: ${result.stderr}`)
    }

    let output: DeleteContainerScriptOutput
    try {
      output = JSON.parse(result.stdout)
    } catch (e) {
      throw new Error(`Failed to parse script output: Invalid JSON response`)
    }

    return {
      id: output.id.substring(0, 12),
      name: output.name,
    }
  }

  async getContainer(id: string): Promise<ContainerResponse> {
    this.validateContainerId(id)
    const result = shell.exec(`docker inspect --format '{{json .}}' ${id}`, {
      silent: true,
    })

    if (result.code !== 0) {
      throw new Error(`Failed to get container: ${result.stderr}`)
    }

    let inspect
    try {
      inspect = JSON.parse(result.stdout)
    } catch (e) {
      throw new Error(`Failed to parse container data: Invalid JSON response`)
    }
    const status = inspect.State.Status

    const ports: PortMapping[] = []
    const portBindings: Record<string, any[]> = inspect.NetworkSettings.Ports || {}
    for (const [containerPort, bindings] of Object.entries(portBindings)) {
      if (Array.isArray(bindings) && bindings.length > 0) {
        ports.push({
          container: parseInt(containerPort.split('/')[0] as string, 10),
          host: parseInt(bindings[0]?.HostPort || '0', 10),
        })
      }
    }

    return {
      id: inspect.Id.substring(0, 12),
      name: inspect.Name.replace(/^\//, ''),
      image: inspect.Config.Image,
      status:
        status === 'running'
          ? 'running'
          : status === 'exited'
            ? 'exited'
            : 'stopped',
      created: inspect.Created,
      ports: ports.length > 0 ? ports : undefined,
    }
  }

  async listContainers(): Promise<ContainerResponse[]> {
    const result = shell.exec('docker ps -a --format "{{json .}}"', {
      silent: true,
    })

    if (result.code !== 0) {
      throw new Error(`Failed to list containers: ${result.stderr}`)
    }

    const containers = result.stdout.trim().split('\n').filter(Boolean)

    return containers.map(line => {
      let container
      try {
        container = JSON.parse(line)
      } catch (e) {
        throw new Error(`Failed to parse container data: Invalid JSON response`)
      }
      return {
        id: container.ID.substring(0, 12),
        name: container.Names[0].replace(/^\//, ''),
        image: container.Image,
        status:
          container.State === 'running'
            ? 'running'
            : container.State === 'exited'
              ? 'exited'
              : 'stopped',
        created: new Date(container.CreatedAt).toISOString(),
      }
    })
  }
}
