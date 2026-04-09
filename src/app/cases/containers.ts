import { DockerService } from '../services/docker';
import type { 
  CreateContainerRequest, 
  ContainerResponse 
} from '../../types/containers';

export class ContainerUseCase {
  private dockerService: DockerService;

  constructor() {
    this.dockerService = new DockerService();
  }

  async createContainer(request: CreateContainerRequest): Promise<ContainerResponse> {
    return await this.dockerService.createContainer(request.name);
  }

  async startContainer(id: string): Promise<void> {
    await this.dockerService.startContainer(id);
  }

  async stopContainer(id: string): Promise<void> {
    await this.dockerService.stopContainer(id);
  }

  async deleteContainer(id: string): Promise<void> {
    await this.dockerService.deleteContainer(id);
  }

  async getContainer(id: string): Promise<ContainerResponse> {
    return await this.dockerService.getContainer(id);
  }

  async listContainers(): Promise<ContainerResponse[]> {
    return await this.dockerService.listContainers();
  }
}
