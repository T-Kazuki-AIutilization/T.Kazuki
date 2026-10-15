'use client'
import Link from 'next/link'
import { CheckCircle2, Circle } from 'lucide-react'

type Step = { key: string; label: string; desc: string; href: string; done: boolean }

/** 初回利用者向けの 3 ステップ。全部終わったら表示しない。 */
export function OnboardingChecklist({ clients, projects, revenue }: { clients: number; projects: number; revenue: number }) {
  const steps: Step[] = [
    { key: 'client', label: 'クライアントを登録する', desc: '取引先を 1 件登録すると案件に紐づけられます。', href: '/clients/new', done: clients > 0 },
    { key: 'project', label: '案件を登録する', desc: '受注額と納期を入れると、ダッシュボードに反映されます。', href: '/projects/new', done: projects > 0 },
    { key: 'revenue', label: '売上・入金を記録する', desc: '請求した金額と入金日を記録すると、未入金が一目で分かります。', href: '/revenue', done: revenue > 0 },
  ]
  if (steps.every((s) => s.done)) return null
  const doneCount = steps.filter((s) => s.done).length
  return (
    <section className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">はじめの 3 ステップ</h2>
        <span className="text-xs text-muted-foreground">{doneCount} / {steps.length} 完了</span>
      </div>
      <ol className="mt-3 grid gap-3 sm:grid-cols-3">
        {steps.map((s) => (
          <li key={s.key} className={`rounded-md border bg-white p-3 ${s.done ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-2">
              {s.done ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />}
              <div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
                {!s.done && (
                  <Link href={s.href} className="mt-2 inline-block text-xs font-medium text-primary hover:underline">今すぐ登録 →</Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
