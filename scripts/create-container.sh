#!/bin/bash

set -e

generate_container_name() {
  local suffix
  suffix=$(LC_ALL=C tr -dc 'a-z0-9' < /dev/urandom | head -c 6)
  echo "container-${suffix}"
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
  --restart unless-stopped \
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
