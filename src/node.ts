import { app } from './app'
import { serve } from '@hono/node-server'

serve({ ...app, port: +(process.env.PORT || 3000) }, info => {
  console.log(`Listening on http://localhost:${info.port}`)
})
