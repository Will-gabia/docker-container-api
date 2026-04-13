# Hono Boilerplate

Boilerplate for your typescript projects using [Hono](https://hono.dev).

This project includes a Docker Container Management API with API key-based authentication.

[Project Structure](#project-structure)  
[Tech Stack](#tech-stack)  
[Requirements](#requirements)  
[Run Locally](#run-locally)  
[Run test](#run-test)  
[FAQ](#faq)  
[Dependencies](#dependencies)  
[Extras](#extras)

## Project Structure

The main implementation is inside of the `/app` directory where it uses basic ts node implementation with API key-based authentication.

```bash
/src

/app/cases: # Use cases of your application
/app/repositories: # Repositories and interfaces used by the use cases
/routes: # Routes and middlewares
/tests:  # Integration tests

node.ts: # Initial file to run the project using Node
bun.ts:  # Initial file to run the project using Bun
```

## Tech Stack

**Geral:** [Hono](https://hono.dev), [Zod](https://zod.dev), [Eslint](https://eslint.org)  
**Test:** [Bun test](https://bun.sh/docs/cli/test)  
**Docs:** [Scalar](https://scalar.com/)

## Requirements

[node.js v20+](https://nodejs.org/en) or [bun](https://bun.sh)  
[nvm](https://github.com/nvm-sh/nvm#install--update-script) installed to manage node versions  
[pnpm](https://pnpm.io) to manage dependencies(npm install -g pnpm)

## Run Locally

#### **Update your environment variables**

Create a `.env` files from `.env.example` and populate the values.

```
cp .env.example .env
```

Set the `API_KEY` environment variable for authentication:

```
API_KEY=your-secret-api-key
```

#### **Install your dependencies**

<details>

<summary>Nodejs</summary>

```sh
nvm use
pnpm install
```

</details>

<details>

<summary>Bun</summary>

```sh
bun install
# Reference: https://bun.sh/docs/install/lockfile
```

</details>

#### **Run the project**

<details>

<summary>Nodejs</summary>

```sh
pnpm node:dev or pnpm dev
```

</details>

<details>

<summary>Bun</summary>

```sh
pnpm bun:dev
```

</details>

From here you should be getting a server running on `http://localhost:3333`

## Endpoints

You can find the openapi generated on endpoint "/doc" or access the scalar generated on "/reference".

There is also the "/endpoints" directory that contains endpoints generated to use with bruno. You can use the client or the extension to read them.

- [Bruno API Client](https://www.usebruno.com).
- [VSCode Extension](https://marketplace.visualstudio.com/items?itemName=bruno-api-client.bruno)

## Run test

Tests are implemented using bun which follows a jest-compatible structure.

```sh
# unit tests
pnpm test

pnpm test:integration
```

Tests also run on pull requests and push to main, check `.github/workflows/lint-and-test.yaml`

> Reference: https://bun.sh/docs/cli/test#run-tests

## Build

<details>

<summary>Nodejs</summary>

```sh
pnpm node:build
pnpm node:start
```

</details>

<details>

<summary>Bun</summary>

```sh
pnpm bun:build
pnpm bun:start
```

</details>

## FAQ

<details>

<summary>Why this structure?</summary>

This is a matter of personal preference and depends on your application and deployment process.

I've been using this case structure for a while and have found it enjoyable, though I'm still improving and learning as I go.

I often aim for a balanced approach to structure for various reasons.

As a personal recommendation, try not to become too attached to any one framework. You’ll gain more value by focusing on structuring your code and learning about patterns that can benefit your team, projects, and clients.

Feel free to adapt these ideas to fit your needs.

[Hono best practices](https://hono.dev/guides/best-practices#best-practices)  
[Hono presets](https://hono.dev/api/presets#which-preset-should-i-use)

</details>

<details>

<summary>Framework agnostic?</summary>

Thanks to Hono's simplicity, you can structure your project in a way that suits your needs.

The core of this project is located in the /app directory, where I use only JavaScript; none of these files are specific to Hono. This means that if you ever need to switch away from Hono for any reason, you can simply copy the /app directory and adjust the request handling as needed.

</details>

<details>

<summary>Why hono?</summary>

[Features](https://hono.dev/top#features)

Based on my experience with Express.js and Fastify, I’ve found Hono to be powerful, easy to use, and supported by an active community.

Give it a go.

Here are some basic benchmarks (though they’re not particularly significant).  
[Requests benchmark](https://web-frameworks-benchmark.netlify.app/result?f=express,hono,fastify,hono-bun)  
[Compare benchmark](https://web-frameworks-benchmark.netlify.app/compare?f=express,hono,fastify,hono-bun)

If you're still not convinced, Fastify is also an excellent option.

</details>

## Dependencies

**Nodejs**

> To run the project using nodejs, we need some extra dependencies.
> These are already set in the project.

```sh
# dependencies
@hono/node-server

# devDependencies
typescript
tsx
```

---

## Extras

#### Adding sentry

- For the setup you can use the [hono middleware](https://github.com/honojs/middleware/tree/main/packages/sentry) created for that, you can follow the instructions on the readme there.

The setup is basically adding the middleware on the initial file.

```ts
// ...
import { sentry } from '@hono/sentry'
// ...

app.use(
  '*',
  sentry({
    dsn: process.env.SENTRY_DNS,
    tracesSampleRate: isProduction ? 0.2 : 0.8,
    environment,
  }),
)
```

Then you can call on your global `app.onError`

```ts
app.onError((error, c) => {
  c.get('sentry').captureException(e, {
    tags: {}, // any tag
    extra: {}, // any extra object
  })

  return c.json({ error, message: error.message || 'Unknown Error' }, 500)
})
```

#### Connection example using tursodb (sqlie)

- [Gist example](https://gist.github.com/marcosrjjunior/0a717f4b8b584a13fb36fdec4398d048)

---

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
