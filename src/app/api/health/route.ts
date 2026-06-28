export const dynamic = 'force-dynamic'
import { jsonResponse } from '@/lib/utils'
export async function GET() { return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }) }
