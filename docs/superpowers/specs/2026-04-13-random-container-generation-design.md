# 랜덤 컨테이너 생성 설계

## 개요

`create-container.sh` 스크립트를 수정하여 컨테이너 이름과 호스트 포트를 랜덤하게 생성하고 충돌을 방지합니다.

## 요구사항

- 컨테이너 이름: `container-XXXXXX` 형식 (6자리 영문소문자+숫자)
- 호스트 포트: 1024-49151 범위에서 랜덤 생성
- 포트 충돌 확인: Docker 컨테이너 및 시스템 포트 사용 확인
- 실패 시 적절한 JSON 에러 반환
- 의존성: `ss` 명령어 (iproute2 패키지)

## 아키텍처

### 전략

순수 스크립트 솔루션: `create-container.sh`만 수정하여 모든 랜덤화를 처리합니다.

### 함수 정의

#### `generate_container_name()`

랜덤 컨테이너 이름 생성

**입력:** 없음

**출력:** `container-XXXXXX` 형식의 문자열

**구현:**

```bash
generate_container_name() {
  local suffix
  suffix=$(LC_ALL=C tr -dc 'a-z0-9' < /dev/urandom | head -c 6)
  echo "container-${suffix}"
}
```

---

#### `generate_available_port()`

사용 가능한 호스트 포트 생성 (최대 100회 재시도)

**입력:** 없음

**출력:** 1024-49151 범위의 사용 가능한 포트 번호

**에러 처리:** 100회 재시도 실패 시 JSON 에러 반환 후 종료

**구현:**

```bash
generate_available_port() {
  local port
  for i in {1..100}; do
    port=$((RANDOM % (49151 - 1024 + 1) + 1024))
    if is_port_available "$port"; then
      echo "$port"
      return 0
    fi
  done
  echo '{"error": "Failed to find available port"}' >&2
  exit 1
}
```

---

#### `is_port_available()`

포트 사용 여부 확인

**입력:** 포트 번호

**출력:** 0 (사용 가능), 1 (사용 중)

**구현:**

```bash
is_port_available() {
  local port=$1
  # Docker 컨테이너의 포트 사용 확인
  if docker ps -a --format '{{.Ports}}' | grep -q ":${port}->"; then
    return 1
  fi
  # 시스템 포트 사용 확인 (ss만 사용)
  if ss -tuln | grep -q ":${port} "; then
    return 1
  fi
  return 0
}
```

---

### 스크립트 수정 사항

**기존 코드:**

```bash
CONTAINER_NAME=$1  # 사용자 입력 사용
...
IMAGE="nginx:latest"
HOST_PORT=8080  # 고정된 포트
CONTAINER_PORT=80
```

**수정 후 코드:**

```bash
CONTAINER_NAME=$(generate_container_name)  # 랜덤 이름 생성
...
IMAGE="nginx:latest"
HOST_PORT=$(generate_available_port)  # 랜덤 사용 가능 포트
CONTAINER_PORT=80
```

---

## 데이터 흐름

```
API 요청 (name 파라미터)
  ↓
TypeScript (DockerService) - name 파라미터 전달
  ↓
create-container.sh 스크립트
  ↓
generate_container_name() → 무시
generate_available_port() → 랜덤 포트 생성
  ↓
is_port_available() → 포트 충돌 확인
  ↓
Docker 컨테이너 생성
  ↓
JSON 응답 반환 (id, name, image, ports)
```

---

## 에러 처리

### ss 명령어 없음

```json
{
  "error": "Neither ss nor netstat is installed"
}
```

### 사용 가능한 포트 없음

```json
{
  "error": "Failed to find available port"
}
```

---

## 의존성

### 필수 패키지

- **iproute2** (ss 명령어 포함)

**설치 명령어:**

```bash
# Debian/Ubuntu
sudo apt-get install iproute2

# RHEL/CentOS/Rocky
sudo yum install iproute

# Arch Linux
sudo pacman -S iproute2
```

---

## 테스트 계획

1. 기본 컨테이너 생성 동작 확인
2. 랜덤 이름 형식 검증 (container-XXXXXX)
3. 랜덤 포트 범위 검증 (1024-49151)
4. 포트 충돌 시 재시도 동작 확인
5. 100회 실패 시 에러 반환 확인
6. Docker 포트 사용 중 충돌 방지 확인
7. 시스템 포트 사용 중 충돌 방지 확인

---

## 롤아웃 계획

1. 스크립트 수정
2. 로컬 테스트
3. 통합 테스트 실행
4. 배포
