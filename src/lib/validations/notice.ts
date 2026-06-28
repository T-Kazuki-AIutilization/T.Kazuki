import { z } from 'zod'

export const noticeCreateSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200),
  body: z.string().min(1, '本文は必須です').max(10000),
  category: z.enum(['info', 'maintenance', 'feature']).default('info'),
  status: z.enum(['draft', 'published']).default('draft'),
  publishedAt: z.string().datetime().optional().nullable(),
})

export const noticeUpdateSchema = noticeCreateSchema.partial()
export type NoticeCreateInput = z.infer<typeof noticeCreateSchema>
