import { z } from 'zod';

export const createContainerSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid container name')
});
