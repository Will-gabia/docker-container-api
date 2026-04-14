import { beforeAll, afterAll } from 'bun:test'

beforeAll(async () => {
  console.log('[Running setup:beforeAll]')
})

afterAll(async () => {
  console.log('[Running setup:afterAll]')
})

