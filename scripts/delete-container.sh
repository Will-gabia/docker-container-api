#!/bin/bash

set -e

CONTAINER_NAME_OR_ID=$1

# 컨테이너 이름/ID 검증
if [ -z "$CONTAINER_NAME_OR_ID" ]; then
  echo '{"error": "Container name or ID is required"}' >&2
  exit 1
fi

# 컨테이너 ID/이름 길이 제한
if [ ${#CONTAINER_NAME_OR_ID} -gt 100 ]; then
  echo '{"error": "Container name/ID must be 100 characters or less"}' >&2
  exit 1
fi

# 컨테이너 이름/ID 형식 검증 (Docker naming 규칙)
if [[ ! "$CONTAINER_NAME_OR_ID" =~ ^[a-zA-Z0-9][a-zA-Z0-9_.-]*$ ]]; then
  echo '{"error": "Invalid container name/ID format. Must match: [a-zA-Z0-9][a-zA-Z0-9_.-]*"}' >&2
  exit 1
fi

# 컨테이너 존재 여부 확인
if ! docker ps -a --format '{{.Names}}\t{{.ID}}' | grep -q "$CONTAINER_NAME_OR_ID"; then
  echo "{\"error\": \"Container '$CONTAINER_NAME_OR_ID' not found\"}" >&2
  exit 1
fi

# 컨테이너 ID 가져오기
CONTAINER_ID=$(docker ps -a --format '{{.Names}}\t{{.ID}}' | grep "$CONTAINER_NAME_OR_ID" | head -1 | awk '{print $2}')

# 컨테이너 삭제 (실행 중인 컨테이너도 삭제 가능)
if ! OUTPUT=$(docker rm -f "$CONTAINER_NAME_OR_ID" 2>&1); then
  echo "{\"error\": \"Failed to delete container: $OUTPUT\"}" >&2
  exit 1
fi

# 삭제된 컨테이너 정보를 JSON으로 반환
cat <<EOF
{
  "id": "$CONTAINER_ID",
  "name": "$CONTAINER_NAME_OR_ID",
  "deleted": true
}
EOF
