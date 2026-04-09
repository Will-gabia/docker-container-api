// 컨테이너 포트 매핑
export interface PortMapping {
  host: number;
  container: number;
}

// 컨테이너 볼륨 마운트
export interface VolumeMount {
  host: string;
  container: string;
}

// 컨테이너 생성 요청
export interface CreateContainerRequest {
  name: string;
}

// 컨테이너 응답
export interface ContainerResponse {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'exited';
  created: string;
  ports?: PortMapping[];
}

// 에러 응답
export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}

// 셸 스크립트 반환 타입
export interface CreateContainerScriptOutput {
  id: string;
  name: string;
  image: string;
  ports: PortMapping[];
}
