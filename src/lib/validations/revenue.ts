import { z } from 'zod'

export const revenueCreateSchema = z.object({
  projectId: z.string().uuid().optional().nullable(),
  amount: z.number().int().min(1, '金額は1以上で入力してください'),
  paymentStatus: z.enum(['unbilled', 'billed', 'paid']).default('unbilled'),
  billedDate: z.string().date().optional().nullable(),
  dueDate: z.string().date().optional().nullable(),
  paidDate: z.string().date().optional().nullable(),
  memo: z.string().max(2000).optional().nullable(),
})

export const revenueUpdateSchema = revenueCreateSchema.partial()
export type RevenueCreateInput = z.infer<typeof revenueCreateSchema>
