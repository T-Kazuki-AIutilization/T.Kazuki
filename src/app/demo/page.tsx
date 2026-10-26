import type { Metadata } from 'next'
import { SiteShell } from '@/components/marketing/site-shell'
import { Demo } from './demo'

export const metadata: Metadata = {
  title: 'デモ画面（サンプルデータ）| FreelanceOS',
  description: 'FreelanceOS のダッシュボード・案件一覧・入金管理の画面を、登録せずにサンプルデータで確認できます。',
  alternates: { canonical: '/demo' },
}

export default function DemoPage() {
  return (
    <SiteShell>
      <main className="px-4 py-10 sm:px-6">
        <Demo />
      </main>
    </SiteShell>
  )
}
