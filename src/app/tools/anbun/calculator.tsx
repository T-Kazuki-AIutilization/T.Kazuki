'use client'
import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(Math.round(n))
const KEY = 'fos.tool.anbun'
type In = {
  rent: number; roomArea: number; totalArea: number; workHours: number; awakeHours: number
  electricity: number; internet: number; internetRatio: number; phone: number; phoneRatio: number
  taxRate: number
}
const defaults: In = { rent: 90000, roomArea: 10, totalArea: 40, workHours: 40, awakeHours: 112, electricity: 9000, internet: 5000, internetRatio: 80, phone: 6000, phoneRatio: 50, taxRate: 0.1 }

export function AnbunCalculator() {
  const [v, setV] = useState<In>(defaults)
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setV({ ...defaults, ...JSON.parse(s) }) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }, [v])
  const n = (k: keyof In) => (e: React.ChangeEvent<HTMLInputElement>) => setV(s => ({ ...s, [k]: Number(e.target.value.replace(/[^\d.]/g, '')) || 0 }))
  const r = useMemo(() => {
    const area = v.totalArea > 0 ? Math.min(1, v.roomArea / v.totalArea) : 0
    const time = v.awakeHours > 0 ? Math.min(1, v.workHours / v.awakeHours) : 0
    const rentRatio = area
    const elecRatio = time
    const rows = [
      { k: '家賃', base: v.rent, ratio: rentRatio, note: '仕事部屋の面積 ÷ 住居の面積' },
      { k: '電気代', base: v.electricity, ratio: elecRatio, note: '仕事をする時間 ÷ 起きている時間' },
      { k: 'インターネット', base: v.internet, ratio: Math.min(1, v.internetRatio / 100), note: '業務で使う割合' },
      { k: '携帯電話', base: v.phone, ratio: Math.min(1, v.phoneRatio / 100), note: '業務で使う割合（通話・データ）' },
    ].map(x => ({ ...x, monthly: x.base * x.ratio, yearly: x.base * x.ratio * 12 }))
    const yearly = rows.reduce((s, x) => s + x.yearly, 0)
    const saving = yearly * (v.taxRate * 1.021 + 0.1 + 0.1)
    return { rows, yearly, saving }
  }, [v])
  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">入力（月額）</h2>
        <div><Label className="text-xs">家賃（円）</Label><Input inputMode="numeric" value={yen(v.rent)} onChange={n('rent')} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label className="text-xs">仕事部屋の面積（㎡）</Label><Input inputMode="decimal" value={v.roomArea} onChange={n('roomArea')} /></div>
          <div><Label className="text-xs">住居の面積（㎡）</Label><Input inputMode="decimal" value={v.totalArea} onChange={n('totalArea')} /></div>
        </div>
        <div><Label className="text-xs">電気代（円）</Label><Input inputMode="numeric" value={yen(v.electricity)} onChange={n('electricity')} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label className="text-xs">週の仕事時間（h）</Label><Input inputMode="numeric" value={v.workHours} onChange={n('workHours')} /></div>
          <div><Label className="text-xs">週の起きている時間（h）</Label><Input inputMode="numeric" value={v.awakeHours} onChange={n('awakeHours')} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label className="text-xs">ネット回線（円）</Label><Input inputMode="numeric" value={yen(v.internet)} onChange={n('internet')} /></div>
          <div><Label className="text-xs">業務の割合（%）</Label><Input inputMode="numeric" value={v.internetRatio} onChange={n('internetRatio')} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label className="text-xs">携帯電話（円）</Label><Input inputMode="numeric" value={yen(v.phone)} onChange={n('phone')} /></div>
          <div><Label className="text-xs">業務の割合（%）</Label><Input inputMode="numeric" value={v.phoneRatio} onChange={n('phoneRatio')} /></div>
        </div>
        <div>
          <Label className="text-xs">所得税の税率（節税額の目安に使用）</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.taxRate} onChange={e => setV(s => ({ ...s, taxRate: Number(e.target.value) }))}>
            <option value={0.05}>5%（課税所得 195 万円以下）</option><option value={0.1}>10%（〜330 万円）</option><option value={0.2}>20%（〜695 万円）</option><option value={0.23}>23%（〜900 万円）</option><option value={0.33}>33%（〜1,800 万円）</option>
          </select>
        </div>
        <p className="text-xs text-muted-foreground">週の起きている時間の目安: 1 日 16 時間 × 7 日 ＝ 112 時間。入力はこの端末にだけ保存されます。</p>
      </section>
      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">経費にできる額（年間）</p>
          <p className="mt-1 text-4xl font-bold">¥{yen(r.yearly)}</p>
          <p className="mt-1 text-sm text-muted-foreground">所得税・住民税・国民健康保険が合わせて年 約 ¥{yen(r.saving)} 下がる目安（税率 {Math.round(v.taxRate * 100)}%＋住民税 10%＋国保 約 10%）</p>
        </div>
        <div className="overflow-x-auto rounded-xl border bg-white p-5">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">費目</th><th className="pr-3">按分率</th><th className="pr-3">月の経費</th><th className="pr-3">年の経費</th><th>根拠</th></tr></thead>
            <tbody>
              {r.rows.map(x => (
                <tr key={x.k} className="border-b border-slate-100">
                  <td className="py-1.5 pr-3">{x.k}</td>
                  <td className="pr-3 tabular-nums">{Math.round(x.ratio * 100)}%</td>
                  <td className="pr-3 tabular-nums">¥{yen(x.monthly)}</td>
                  <td className="pr-3 tabular-nums font-semibold">¥{yen(x.yearly)}</td>
                  <td className="text-xs text-muted-foreground">{x.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">按分率は「面積」「時間」「使用割合」など説明できる基準で決め、計算の根拠をメモしておきます。電気代は、仕事部屋の面積と時間を掛け合わせる考え方もあります。決めた割合は毎年同じ考え方で使い続けるのが基本です。</p>
        </div>
      </section>
    </div>
  )
}
