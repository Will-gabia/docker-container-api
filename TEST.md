# API Test Commands

API 서버의 각 엔드포인트를 테스트하는 curl 명령어입니다.

**기본 URL:** `http://localhost:3000`
**API KEY:** `X-API-Key: your-api-key-here` (환경변수 `API_KEY`로 설정)

---

## 1. Health Check

서버가 정상적으로 실행 중인지 확인합니다.

```bash
curl -X GET http://localhost:3000/health
```

**응답:**

```json
{
  "uptime": 123.456,
  "message": "Ok",
  "date": "2026-04-13T12:00:00.000Z"
}
```

---

## 2. Create Container

새로운 Docker 컨테이너를 생성합니다.

```bash
curl -X POST http://localhost:3000/containers \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{}'
```

**응답:**

```json
{
  "id": "abc123def456",
  "name": "my-container",
  "image": "nginx:latest",
  "status": "running",
  "created": "2026-04-13T12:00:00.000Z",
  "ports": [
    {
      "host": 12345,
      "container": 80
    }
  ]
}
```

**주의:** `name` 필드는 필수이며, 1-100자 사이여야 하고 `[a-zA-Z0-9_-]+` 패턴을 따라야 합니다.

---

## 3. List Containers

모든 컨테이너 목록을 조회합니다.

```bash
curl -X GET http://localhost:3000/containers \
  -H "X-API-Key: your-api-key-here"
```

**응답:**

```json
[
  {
    "id": "abc123def456",
    "name": "my-container",
    "image": "nginx:latest",
    "status": "running",
    "created": "2026-04-13T12:00:00.000Z"
  },
  {
    "id": "def789ghi012",
    "name": "another-container",
    "image": "nginx:latest",
    "status": "exited",
    "created": "2026-04-13T11:00:00.000Z"
  }
]
```

---

## 4. Get Container Details

특정 컨테이너의 상세 정보를 조회합니다.

```bash
curl -X GET http://localhost:3000/containers/abc123def456 \
  -H "X-API-Key: your-api-key-here"
```

**응답:**

```json
{
  "id": "abc123def456",
  "name": "my-container",
  "image": "nginx:latest",
  "status": "running",
  "created": "2026-04-13T12:00:00.000Z",
  "ports": [
    {
      "host": 12345,
      "container": 80
    }
  ]
}
```

---

## 5. Start Container

정지된 컨테이너를 시작합니다.

```bash
curl -X POST http://localhost:3000/containers/abc123def456/start \
  -H "X-API-Key: your-api-key-here"
```

**응답:** `204 No Content`

---

## 6. Stop Container

실행 중인 컨테이너를 정지합니다.

```bash
curl -X POST http://localhost:3000/containers/abc123def456/stop \
  -H "X-API-Key: your-api-key-here"
```

**응답:** `204 No Content`

---

## 7. Delete Container

컨테이너를 삭제합니다. 실행 중인 컨테이너도 삭제됩니다.

```bash
curl -X DELETE http://localhost:3000/containers/abc123def456 \
  -H "X-API-Key: your-api-key-here"
```

**응답:** `204 No Content`

---

## 테스트 시나리오

### 시나리오 1: 컨테이너 전체 생애주기

```bash
# 1. 컨테이너 생성
CONTAINER_ID=$(curl -s -X POST http://localhost:3000/containers \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"name": "test-container"}' | jq -r '.id')

echo "Created container: $CONTAINER_ID"

# 2. 컨테이너 목록 확인
curl -X GET http://localhost:3000/containers \
  -H "X-API-Key: your-api-key-here"

# 3. 컨테이너 상세 확인
curl -X GET http://localhost:3000/containers/$CONTAINER_ID \
  -H "X-API-Key: your-api-key-here"

# 4. 컨테이너 정지
curl -X POST http://localhost:3000/containers/$CONTAINER_ID/stop \
  -H "X-API-Key: your-api-key-here"

# 5. 컨테이너 삭제
curl -X DELETE http://localhost:3000/containers/$CONTAINER_ID \
  -H "X-API-Key: your-api-key-here"

echo "Container deleted"
```

### 시나리오 2: 여러 컨테이너 관리

```bash
# 3개의 컨테이너 생성
for i in 1 2 3; do
  curl -s -X POST http://localhost:3000/containers \
    -H "Content-Type: application/json" \
    -H "X-API-Key: your-api-key-here" \
    -d "{\"name\": \"container-$i\"}"
done

# 모든 컨테이너 목록 확인
curl -X GET http://localhost:3000/containers \
  -H "X-API-Key: your-api-key-here" | jq .

# 첫 번째 컨테이너 정지
curl -X POST http://localhost:3000/containers/container-1/stop \
  -H "X-API-Key: your-api-key-here"

# 세 번째 컨테이너 삭제
curl -X DELETE http://localhost:3000/containers/container-3 \
  -H "X-API-Key: your-api-key-here"

# 다시 목록 확인 (1개 정지됨, 1개 삭제됨)
curl -X GET http://localhost:3000/containers \
  -H "X-API-Key: your-api-key-here" | jq .
```

---

## 인증 실패 테스트

### 유효하지 않은 API KEY

```bash
curl -X GET http://localhost:3000/containers \
  -H "X-API-Key: invalid-key"
```

**응답:**

```json
{
  "error": "Unauthorized",
  "message": "Invalid API key"
}
```

### API KEY 누락

```bash
curl -X GET http://localhost:3000/containers
```

**응답:**

```json
{
  "error": "Unauthorized",
  "message": "Invalid API key"
}
```

---

## 유효성 검증 테스트

### 컨테이너 이름 유효성 검사

```bash
# 유효한 이름
curl -X POST http://localhost:3000/containers \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"name": "valid-name-123"}'

# 유효하지 않은 이름 (공백)
curl -X POST http://localhost:3000/containers \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"name": ""}'

# 유효하지 않은 이름 (특수문자 포함)
curl -X POST http://localhost:3000/containers \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"name": "invalid@name"}'

# 유효하지 않은 이름 (100자 초과)
curl -X POST http://localhost:3000/containers \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"name": "'"$(printf 'a%.0s' {1..101})"'"}'
```

---

## 팁

1. **API KEY 설정:** 테스트 전에 `API_KEY` 환경변수를 설정하세요.

   ```bash
   export API_KEY="your-secret-api-key"
   ```

2. **jq 설치:** JSON 응답을 보기 쉽게 파싱하려면 `jq`를 설치하세요.

   ```bash
   # Ubuntu/Debian
   sudo apt-get install jq

   # macOS
   brew install jq
   ```

3. **서버 시작:** 테스트 전에 서버가 실행 중인지 확인하세요.

   ```bash
   npm run dev
   # 또는
   npm run start
   ```

4. **변수 사용:** 자주 사용되는 변수를 미리 설정하세요.

   ```bash
   API_URL="http://localhost:3000"
   API_KEY="your-api-key-here"

   curl -X GET $API_URL/containers -H "X-API-Key: $API_KEY"
   ```

5. **jq 설치:** JSON 응답을 보기 쉽게 파싱하려면 `jq`를 설치하세요.

   ```bash
   # Ubuntu/Debian
   sudo apt-get install jq

   # macOS
   brew install jq
   ```

6. **서버 시작:** 테스트 전에 서버가 실행 중인지 확인하세요.

   ```bash
   npm run dev
   # 또는
   npm run start
   ```

7. **변수 사용:** 자주 사용되는 변수를 미리 설정하세요.

   ```bash
   API_URL="http://localhost:3000"
   API_KEY="your-api-key-here"

   curl -X GET $API_URL/containers -H "X-API-Key: $API_KEY"
   ```

8. **jq 설치:** JSON 응답을 보기 쉽게 파싱하려면 `jq`를 설치하세요.

   ```bash
   # Ubuntu/Debian
   sudo apt-get install jq

   # macOS
   brew install jq
   ```

9. **서버 시작:** 테스트 전에 서버가 실행 중인지 확인하세요.

   ```bash
   npm run dev
   # 또는
   npm start
   ```

10. **변수 사용:** 자주 사용되는 변수를 미리 설정하세요.

    ```bash
    API_URL="http://localhost:3000"
    API_KEY="your-api-key-here"

    curl -X GET $API_URL/containers -H "X-API-Key: $API_KEY"
    ```

---

## OpenAPI 문서

모든 API 엔드포인트의 상세 문서는 다음에서 확인할 수 있습니다:

- **OpenAPI 스펙:** `http://localhost:3000/doc`
- **API 레퍼런스:** `http://localhost:3000/reference`
