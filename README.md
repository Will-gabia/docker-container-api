## Docker 컨테이너 관리 API

Docker 컨테이너를 생성/관리하는 API입니다. 자세한 내용은 [API 문서](./docs/api/containers.md)를 참조하세요.

### 사용법

#### 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일에서 `API_KEY`를 설정하세요:

```bash
API_KEY=your-secret-api-key
```

#### 개발 서버 시작

```bash
npm install
npm dev
```

서버가 `http://localhost:3333`에서 실행됩니다.

#### API 호출 예시

**컨테이너 생성:**

```bash
curl -X POST http://localhost:3333/containers \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "my-container"}'
```

**컨테이너 시작:**

```bash
curl -X POST http://localhost:3333/containers/abc123/start \
  -H "X-API-Key: $API_KEY"
```

**컨테이너 정지:**

```bash
curl -X POST http://localhost:3333/containers/abc123/stop \
  -H "X-API-Key: $API_KEY"
```

**컨테이너 조회:**

```bash
curl http://localhost:3333/containers/abc123 \
  -H "X-API-Key: $API_KEY"
```

**컨테이너 목록:**

```bash
curl http://localhost:3333/containers \
  -H "X-API-Key: $API_KEY"
```

**컨테이너 삭제:**

```bash
curl -X DELETE http://localhost:3333/containers/abc123 \
  -H "X-API-Key: $API_KEY"
```

### 특징

- 컨테이너 생성/시작/정지/삭제/조회 기능
- API Key 기반 인증
- JSON 형식 응답
- 셸 스크립트 기반 컨테이너 생성 (시스템 엔지니어 관리)

---
