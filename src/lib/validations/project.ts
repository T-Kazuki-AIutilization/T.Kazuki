import { z } from 'zod'

export const projectCreateSchema = z.object({
  title: z.string().min(1, '案件名は必須です').max(200),
  clientId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  amount: z.number().int().min(0, '金額は0以上で入力してください'),
  deadline: z.string().date().optional().nullable(),
  memo: z.string().max(5000).optional().nullable(),
})

export const projectUpdateSchema = projectCreateSchema.partial()

export const projectStatusSchema = z.object({
  status: z.enum(['in_progress', 'completed', 'paid', 'cancelled']),
})

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>
