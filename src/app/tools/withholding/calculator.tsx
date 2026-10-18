'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/** 源泉徴収税額（10.21%、100 万円超は 20.42%）の計算と、振込額からの逆算 */
const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(n)
function withholding(base: number) { return base <= 1000000 ? Math.floor(base * 0.1021) : Math.floor((base - 1000000) * 0.2042 + 102100) }

export function WithholdingCalculator() {
  const [mode, setMode] = useState<'from_base' | 'from_paid'>('from_base')
  const [base, setBase] = useState(100000)
  const [paid, setPaid] = useState(99790)
  const [separateTax, setSeparateTax] = useState(true)
  const r = useMemo(() => {
    if (mode === 'from_base') {
      const tax = Math.floor(base * 0.1)
      const wBase = separateTax ? base : base + tax
      const w = withholding(wBase)
      return { base, tax, w, total: base + tax - w, wBase }
    }
    // 振込額から税抜報酬を逆算（消費税を区分している前提、100 万円以下）
    let b = Math.round(paid / 0.9979)
    // 端数の調整: 計算結果が振込額に一致する b を近傍で探す
    for (let d = -3; d <= 3; d++) { const c = b + d; if (c + Math.floor(c * 0.1) - withholding(c) === paid) { b = c; break } }
    const tax = Math.floor(b * 0.1); const w = withholding(b)
    return { base: b, tax, w, total: b + tax - w, wBase: b }
  }, [mode, base, paid, separateTax])
  const num = (set: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => set(Number(e.target.value.replace(/[^\d]/g, '')) || 0)

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode('from_base')} className={`rounded-md border px-3 py-1.5 text-sm ${mode === 'from_base' ? 'border-primary bg-primary text-white' : 'bg-white hover:bg-slate-50'}`}>報酬額から計算</button>
          <button type="button" onClick={() => setMode('from_paid')} className={`rounded-md border px-3 py-1.5 text-sm ${mode === 'from_paid' ? 'border-primary bg-primary text-white' : 'bg-white hover:bg-slate-50'}`}>振込額から逆算</button>
        </div>
        {mode === 'from_base' ? (
          <>
            <div><Label className="text-xs">報酬額（税抜、円）</Label><Input inputMode="numeric" value={yen(base)} onChange={num(setBase)} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={separateTax} onChange={e => setSeparateTax(e.target.checked)} />請求書で消費税を分けて記載している（税抜額が源泉徴収の対象）</label>
          </>
        ) : (
          <>
            <div><Label className="text-xs">振込額（円）</Label><Input inputMode="numeric" value={yen(paid)} onChange={num(setPaid)} /></div>
            <p className="text-xs text-muted-foreground">消費税を分けて記載し、報酬が 100 万円以下の場合の逆算です（税抜報酬 ＝ 振込額 ÷ 0.9979）。振込手数料が引かれていると一致しません。</p>
          </>
        )}
      </section>
      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">源泉徴収税額</p>
          <p className="mt-1 text-4xl font-bold">¥{yen(r.w)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{r.wBase <= 1000000 ? `${yen(r.wBase)} × 10.21%` : `(${yen(r.wBase)} − 1,000,000) × 20.42% ＋ 102,100`}</p>
        </div>
        <div className="rounded-xl border bg-white p-5 text-sm">
          <h2 className="text-sm font-semibold">請求書の書き方（この金額の場合）</h2>
          <table className="mt-3 w-full">
            <tbody>
              <tr className="border-b border-slate-100"><td className="py-1.5">小計（税抜）</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.base)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5">消費税（10%）</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.tax)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5">源泉徴収税額</td><td className="py-1.5 text-right tabular-nums">−¥{yen(r.w)}</td></tr>
              <tr className="font-semibold"><td className="py-1.5">差引請求金額（振込額）</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.total)}</td></tr>
            </tbody>
          </table>
          {mode === 'from_base' && !separateTax && <p className="mt-3 text-xs text-muted-foreground">消費税を分けて書かない場合は税込額が対象になり、分けて書いた場合より源泉徴収税額が ¥{yen(r.w - withholding(base))} 多くなります。</p>}
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm">
          <p className="font-semibold">この内容で請求書を作る</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/tools/invoice" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">請求書作成ツール（無料・登録不要）</Link>
            <Link href="/blog/freelance-withholding-tax" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium hover:bg-slate-50">対象になる報酬・還付の受け方</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
