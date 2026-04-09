import shell from 'shelljs';
import type { 
  ContainerResponse, 
  PortMapping, 
  CreateContainerScriptOutput 
} from '../../types/containers';

export class DockerService {
  private readonly SCRIPT_PATH = './scripts/create-container.sh';

  async createContainer(name: string): Promise<ContainerResponse> {
    const result = shell.exec(`${this.SCRIPT_PATH} ${name}`, { silent: true });
    
    if (result.code !== 0) {
      throw new Error(`Failed to create container: ${result.stderr}`);
    }

    const output: CreateContainerScriptOutput = JSON.parse(result.stdout);
    
    return {
      id: output.id,
      name: output.name,
      image: output.image,
      status: 'running',
      created: new Date().toISOString(),
      ports: output.ports
    };
  }

  async startContainer(id: string): Promise<void> {
    const result = shell.exec(`docker start ${id}`, { silent: true });
    
    if (result.code !== 0) {
      throw new Error(`Failed to start container: ${result.stderr}`);
    }
  }

  async stopContainer(id: string): Promise<void> {
    const result = shell.exec(`docker stop ${id}`, { silent: true });
    
    if (result.code !== 0) {
      throw new Error(`Failed to stop container: ${result.stderr}`);
    }
  }

  async deleteContainer(id: string): Promise<void> {
    const result = shell.exec(`docker rm -f ${id}`, { silent: true });
    
    if (result.code !== 0) {
      throw new Error(`Failed to delete container: ${result.stderr}`);
    }
  }

  async getContainer(id: string): Promise<ContainerResponse> {
    const result = shell.exec(`docker inspect --format '{{json .}}' ${id}`, { silent: true });
    
    if (result.code !== 0) {
      throw new Error(`Failed to get container: ${result.stderr}`);
    }

    const inspect = JSON.parse(result.stdout);
    const status = inspect.State.Status;
    
    const ports: PortMapping[] = [];
    const portBindings = inspect.NetworkSettings.Ports;
    for (const [containerPort, bindings] of Object.entries(portBindings)) {
      if (bindings && bindings.length > 0) {
        ports.push({
          container: parseInt(containerPort.split('/')[0]),
          host: parseInt(bindings[0].HostPort)
        });
      }
    }

    return {
      id: inspect.Id.substring(0, 12),
      name: inspect.Name.replace(/^\//, ''),
      image: inspect.Config.Image,
      status: status === 'running' ? 'running' : status === 'exited' ? 'exited' : 'stopped',
      created: inspect.Created,
      ports: ports.length > 0 ? ports : undefined
    };
  }

  async listContainers(): Promise<ContainerResponse[]> {
    const result = shell.exec('docker ps -a --format "{{json .}}"', { silent: true });
    
    if (result.code !== 0) {
      throw new Error(`Failed to list containers: ${result.stderr}`);
    }

    const containers = result.stdout.trim().split('\n').filter(Boolean);
    
    return containers.map(line => {
      const container = JSON.parse(line);
      return {
        id: container.ID.substring(0, 12),
        name: container.Names[0].replace(/^\//, ''),
        image: container.Image,
        status: container.State === 'running' ? 'running' : 
                container.State === 'exited' ? 'exited' : 'stopped',
        created: new Date(container.Created * 1000).toISOString()
      };
    });
  }
}
