# 랜덤 컨테이너 생성 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** create-container.sh 스크립트를 수정하여 컨테이너 이름과 호스트 포트를 랜덤하게 생성하고 충돌을 방지합니다.

**Architecture:** 순수 스크립트 솔루션으로, create-container.sh만 수정하여 랜덤화를 구현합니다. generate_container_name(), generate_available_port(), is_port_available() 세 함수를 추가하고 기존의 CONTAINER_NAME과 HOST_PORT 할당을 이 함수 호출로 변경합니다.

**Tech Stack:** Bash, Docker, iproute2 (ss 명령어)

---

## File Structure

- **Modify:** `scripts/create-container.sh` - 랜덤 생성 함수 추가 및 이름/포트 생성 로직 변경

---

## Task 1: generate_container_name 함수 추가

**Files:**

- Modify: `scripts/create-container.sh`

- [ ] **Step 1: create-container.sh에 generate_container_name 함수 추가**

스크립트의 시작 부분(컨테이너 이름 검증 전)에 다음 함수를 추가:

```bash
generate_container_name() {
  local suffix
  suffix=$(LC_ALL=C tr -dc 'a-z0-9' < /dev/urandom | head -c 6)
  echo "container-${suffix}"
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/create-container.sh
git commit -m "feat: add generate_container_name function"
```

---

## Task 2: is_port_available 함수 추가

**Files:**

- Modify: `scripts/create-container.sh`

- [ ] **Step 1: create-container.sh에 is_port_available 함수 추가**

generate_container_name 함수 뒤에 다음 함수를 추가:

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

- [ ] **Step 2: Commit**

```bash
git add scripts/create-container.sh
git commit -m "feat: add is_port_available function"
```

---

## Task 3: generate_available_port 함수 추가

**Files:**

- Modify: `scripts/create-container.sh`

- [ ] **Step 1: create-container.sh에 generate_available_port 함수 추가**

is_port_available 함수 뒤에 다음 함수를 추가:

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

- [ ] **Step 2: Commit**

```bash
git add scripts/create-container.sh
git commit -m "feat: add generate_available_port function"
```

---

## Task 4: CONTAINER_NAME 할당 변경

**Files:**

- Modify: `scripts/create-container.sh:5`

- [ ] **Step 1: CONTAINER_NAME을 랜덤 생성으로 변경**

다음 줄을:

```bash
CONTAINER_NAME=$1
```

다음으로 변경:

```bash
CONTAINER_NAME=$(generate_container_name)
```

- [ ] **Step 2: Commit**

```bash
git add scripts/create-container.sh
git commit -m "feat: use random container name instead of user input"
```

---

## Task 5: HOST_PORT 할당 변경

**Files:**

- Modify: `scripts/create-container.sh:27`

- [ ] **Step 1: HOST_PORT을 랜덤 생성으로 변경**

다음 줄을:

```bash
HOST_PORT=8080
```

다음으로 변경:

```bash
HOST_PORT=$(generate_available_port)
```

- [ ] **Step 2: Commit**

```bash
git add scripts/create-container.sh
git commit -m "feat: use random available port instead of fixed port 8080"
```

---

## Task 6: 로컬 테스트

**Files:**

- Test: `scripts/create-container.sh`

- [ ] **Step 1: 함수가 올바르게 작동하는지 테스트**

```bash
# 컨테이너 이름 생성 테스트
bash -c 'source scripts/create-container.sh && generate_container_name'

# 포트 사용 가능 여부 테스트 (사용 중인 포트 확인)
bash -c 'source scripts/create-container.sh && is_port_available 8080'

# 랜덤 포트 생성 테스트
bash -c 'source scripts/create-container.sh && generate_available_port'
```

예상 결과:

- generate_container_name: container-XXXXXX 형식의 문자열
- is_port_available 8080: 0 또는 1 (포트 사용 상태)
- generate_available_port: 1024-49151 사이의 숫자

- [ ] **Step 2: 컨테이너 생성 통합 테스트**

```bash
./scripts/create-container.sh test-name
```

예상 결과:

- JSON 응답 반환
- 컨테이너 이름이 container-XXXXXX 형식
- 호스트 포트가 1024-49151 범위

- [ ] **Step 3: 생성된 컨테이너 확인**

```bash
docker ps -a --filter "name=container-*" --format "{{.Names}}: {{.Ports}}"
```

예상 결과:

- container-XXXXXX 이름의 컨테이너가 생성됨
- 포트 매핑이 올바르게 설정됨

- [ ] **Step 4: 테스트 컨테이너 정리**

```bash
docker rm -f $(docker ps -aq --filter "name=container-*")
```

---

## Task 7: 통합 테스트 실행

**Files:**

- Test: `src/tests/integration/containers.test.ts`

- [ ] **Step 1: 기존 통합 테스트 실행**

```bash
pnpm test:integration
```

예상 결과: 모든 테스트 통과

---

## Task 8: 설명서 업데이트

**Files:**

- Modify: `docs/superpowers/specs/2026-04-13-random-container-generation-design.md`

- [ ] **Step 1: 디자인 문서에 구현 완료 표기**

디자인 문서의 "롤아웃 계획" 섹션에 완료 상태 표기

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-04-13-random-container-generation-design.md
git commit -m "docs: mark random container generation as implemented"
```
