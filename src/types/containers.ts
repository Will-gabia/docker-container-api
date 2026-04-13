// 컨테이너 포트 매핑
export interface PortMapping {
  host: number
  container: number
}

// 컨테이너 볼륨 마운트
export interface VolumeMount {
  host: string
  container: string
}

// 컨테이너 생성 요청
export interface CreateContainerRequest {
  readonly __brand: unique symbol
}

// 컨테이너 응답
export interface ContainerResponse {
  id: string
  name: string
  image: string
  status: 'running' | 'stopped' | 'exited'
  created: string
  ports?: PortMapping[]
}

// 에러 응답
export interface ErrorResponse {
  error: string
  message: string
  details?: Record<string, unknown>
}

// 셸 스크립트 반환 타입
// note: ports는 required인데 ContainerResponse.ports는 optional
// 이는 컨테이너 생성 스크립트가 항상 포트 정보를 반환하도록 설계되었음을 의미
// 반면, ContainerResponse는 기존 컨테이너가 포트를 사용하지 않을 수도 있음
export interface CreateContainerScriptOutput {
  id: string
  name: string
  image: string
  ports: PortMapping[]
}

// 컨테이너 삭제 스크립트 반환 타입
export interface DeleteContainerScriptOutput {
  id: string
  name: string
  deleted: boolean
}
