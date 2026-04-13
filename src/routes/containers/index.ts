import { Hono } from 'hono'
import { z } from 'zod'
import { ContainerUseCase } from '../../app/cases/containers'

function createContainerRoutes(useCase: ContainerUseCase): Hono {
  const containers = new Hono()

  containers.post('/', async c => {
    try {
      await c.req.json()
      const result = await useCase.createContainer()
      return c.json(result, 201)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: 'Validation error', message: error.errors }, 400)
      }
      return c.json(
        { error: 'Internal error', message: 'Failed to create container' },
        500,
      )
    }
  })

  containers.post('/:id/start', async c => {
    const id = c.req.param('id')
    await useCase.startContainer(id)
    return c.newResponse(null, 204)
  })

  containers.post('/:id/stop', async c => {
    const id = c.req.param('id')
    await useCase.stopContainer(id)
    return c.newResponse(null, 204)
  })

  containers.delete('/:id', async c => {
    const id = c.req.param('id')
    await useCase.deleteContainer(id)
    return c.newResponse(null, 204)
  })

  containers.get('/:id', async c => {
    const id = c.req.param('id')
    const result = await useCase.getContainer(id)
    return c.json(result)
  })

  containers.get('/', async c => {
    const result = await useCase.listContainers()
    return c.json(result)
  })

  return containers
}

const containers = createContainerRoutes(new ContainerUseCase())
export default containers
export { createContainerRoutes }
