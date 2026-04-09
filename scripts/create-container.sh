#!/bin/bash

set -e

CONTAINER_NAME=$1

# 컨테이너 이름 검증
if [ -z "$CONTAINER_NAME" ]; then
  echo '{"error": "Container name is required"}' >&2
  exit 1
fi

# 시스템 엔지니어가 관리하는 설정
IMAGE="nginx:latest"
HOST_PORT=8080
CONTAINER_PORT=80

# 컨테이너 생성
CONTAINER_ID=$(docker run -d \
  --name "$CONTAINER_NAME" \
  -p "$HOST_PORT:$CONTAINER_PORT" \
  "$IMAGE")

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
