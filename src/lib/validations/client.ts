import { z } from 'zod'

export const clientCreateSchema = z.object({
  name: z.string().min(1, 'クライアント名は必須です').max(100),
  companyName: z.string().max(100).optional().nullable(),
  email: z.string().email('有効なメールアドレスを入力してください').optional().or(z.literal('')).nullable(),
  phone: z.string().max(20).optional().nullable(),
  memo: z.string().max(2000).optional().nullable(),
  tagIds: z.array(z.string().uuid()).optional(),
})

export const clientUpdateSchema = clientCreateSchema.partial()
export type ClientCreateInput = z.infer<typeof clientCreateSchema>
