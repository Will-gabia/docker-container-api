#!/bin/bash

set -e

generate_container_name() {
  local suffix
  suffix=$(LC_ALL=C tr -dc 'a-z0-9' < /dev/urandom | head -c 6)
  echo "container-${suffix}"
}

is_port_available() {
  local port=$1

  # 입력 유효성 검사
  if [[ ! "$port" =~ ^[0-9]+$ ]] || [ "$port" -lt 1 ] || [ "$port" -gt 65535 ]; then
    echo "Error: Invalid port number '$port'" >&2
    return 1
  fi

  # Docker 컨테이너의 포트 사용 확인 (docker port 명령어 사용)
  while read -r container; do
    docker port "$container" 2>/dev/null | grep -q ":${port}/tcp" && return 1
  done < <(docker ps -a --format '{{.Names}}')

  # 시스템 포트 사용 확인 (ss만 사용)
  if ss -tuln | grep -qE ":${port}\s"; then
    return 1
  fi
  return 0
}

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

CONTAINER_NAME=$1

# 컨테이너 이름 검증
if [ -z "$CONTAINER_NAME" ]; then
  echo '{"error": "Container name is required"}' >&2
  exit 1
fi

# 컨테이너 이름 길이 제한
if [ ${#CONTAINER_NAME} -gt 100 ]; then
  echo '{"error": "Container name must be 100 characters or less"}' >&2
  exit 1
fi

# 컨테이너 이름 형식 검증 (Docker naming 규칙)
if [[ ! "$CONTAINER_NAME" =~ ^[a-zA-Z0-9][a-zA-Z0-9_.-]*$ ]]; then
  echo '{"error": "Invalid container name format. Must match: [a-zA-Z0-9][a-zA-Z0-9_.-]*"}' >&2
  exit 1
fi

# 시스템 엔지니어가 관리하는 설정
IMAGE="nginx:latest"
HOST_PORT=8080
CONTAINER_PORT=80

# 컨테이너 생성 (Docker 에러를 JSON으로 변환)
if ! CONTAINER_ID=$(docker run -d \
  --name "$CONTAINER_NAME" \
  -p "$HOST_PORT:$CONTAINER_PORT" \
  "$IMAGE" 2>&1); then
  echo "{\"error\": \"Failed to create container: $CONTAINER_ID\"}" >&2
  exit 1
fi

# 생성된 컨테이너 정보를 JSON으로 반환
cat <<EOF
{
  "id": "$CONTAINER_ID",
  "name": "$CONTAINER_NAME",
  "image": "$IMAGE",
  "ports": [
    {"host": $HOST_PORT, "container": $CONTAINER_PORT}
  ]
}
EOF
