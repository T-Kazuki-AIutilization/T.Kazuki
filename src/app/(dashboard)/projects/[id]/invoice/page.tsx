'use client'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeft, Printer, Plus, Trash2 } from 'lucide-react'

/**
 * 案件から請求書を作成して印刷（PDF 保存）するページ。
 * 発行者情報と明細はこの端末（localStorage）に保存する（プロフィールに住所等の項目がないため）。
 * 無料プランは透かし入り、Pro は透かしなし。
 */

type Issuer = { name: string; address: string; tel: string; email: string; regNo: string; bank: string }
type Item = { desc: string; qty: number; unit: number }
type Doc = { number: string; date: string; due: string; items: Item[]; withholding: boolean; note: string; subject: string }

const ISSUER_KEY = 'fos.invoice.issuer'
const emptyIssuer: Issuer = { name: '', address: '', tel: '', email: '', regNo: '', bank: '' }

function yen(n: number) { return new Intl.NumberFormat('ja-JP').format(n) }
function today(offsetDays = 0) {
  const d = new Date(); d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}
function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? { ...fallback, ...JSON.parse(v) } : fallback } catch { return fallback }
}
function save(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }

export default function ProjectInvoicePage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<any>(null)
  const [client, setClient] = useState<any>(null)
  const [paid, setPaid] = useState<boolean | null>(null)
  const [issuer, setIssuer] = useState<Issuer>(emptyIssuer)
  const [doc, setDoc] = useState<Doc | null>(null)

  useEffect(() => {
    setIssuer(load(ISSUER_KEY, emptyIssuer))
    fetch('/api/account/usage').then(r => r.json()).then(j => setPaid(Boolean(j.data?.paid))).catch(() => setPaid(false))
    fetch(`/api/projects/${id}`).then(r => r.json()).then(j => {
      const p = j.data
      if (!p) return
      setProject(p)
      const ym = today().slice(0, 7).replace('-', '')
      const fallback: Doc = {
        number: `${ym}-${String(p.id).slice(0, 4).toUpperCase()}`,
        date: today(),
        due: p.deadline ?? today(30),
        subject: p.title,
        items: [{ desc: p.title, qty: 1, unit: Number(p.amount) || 0 }],
        withholding: false,
        note: 'お振込手数料は貴社にてご負担くださいますようお願いいたします。',
      }
      setDoc(load(`fos.invoice.${p.id}`, fallback))
      if (p.client_id) fetch(`/api/clients/${p.client_id}`).then(r => r.json()).then(c => setClient(c.data ?? null))
    })
  }, [id])

  useEffect(() => { if (doc && project) save(`fos.invoice.${project.id}`, doc) }, [doc, project])
  useEffect(() => { save(ISSUER_KEY, issuer) }, [issuer])

  const totals = useMemo(() => {
    const subtotal = (doc?.items ?? []).reduce((s, it) => s + Math.floor((it.qty || 0) * (it.unit || 0)), 0)
    const tax = Math.floor(subtotal * 0.1)
    const withholding = doc?.withholding ? Math.floor(subtotal * 0.1021) : 0
    return { subtotal, tax, withholding, total: subtotal + tax - withholding }
  }, [doc])

  if (!project || !doc) return <div className="p-8 text-sm text-muted-foreground">読み込み中...</div>

  const setI = (k: keyof Issuer) => (e: React.ChangeEvent<HTMLInputElement>) => setIssuer(s => ({ ...s, [k]: e.target.value }))
  const setD = (k: keyof Doc) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDoc(d => d && ({ ...d, [k]: e.target.value }))
  const setItem = (i: number, k: keyof Item, v: string) => setDoc(d => d && ({ ...d, items: d.items.map((it, j) => j === i ? { ...it, [k]: k === 'desc' ? v : Number(v) || 0 } : it) }))
  const addItem = () => setDoc(d => d && ({ ...d, items: [...d.items, { desc: '', qty: 1, unit: 0 }] }))
  const removeItem = (i: number) => setDoc(d => d && ({ ...d, items: d.items.filter((_, j) => j !== i) }))
  const clientName = client ? (client.company_name ? `${client.company_name}\n${client.name}` : client.name) : (project.client?.name ?? '')

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 lg:flex-row print:block print:max-w-none print:p-0">
        {/* 入力パネル（印刷時は非表示） */}
        <aside className="w-full space-y-5 lg:w-[380px] print:hidden">
          <div className="flex items-center justify-between">
            <Link href={`/projects/${project.id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="mr-1 h-4 w-4" />案件に戻る</Link>
            <Button size="sm" onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" />印刷 / PDF に保存</Button>
          </div>
          {paid === false && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              無料プランでは請求書に「FreelanceOS 無料プラン」の透かしが入ります。<Link href="/settings/billing" className="font-medium underline">Pro（14 日間無料）</Link>で透かしなしの請求書を発行できます。
            </div>
          )}
          <section className="rounded-lg border bg-white p-4">
            <h2 className="text-sm font-semibold">発行者情報（この端末に保存）</h2>
            <div className="mt-3 grid gap-2">
              <div><Label className="text-xs">屋号・氏名</Label><Input value={issuer.name} onChange={setI('name')} placeholder="山田 太郎 / 〇〇デザイン" /></div>
              <div><Label className="text-xs">住所</Label><Input value={issuer.address} onChange={setI('address')} placeholder="〒100-0001 東京都千代田区..." /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">電話</Label><Input value={issuer.tel} onChange={setI('tel')} /></div>
                <div><Label className="text-xs">メール</Label><Input value={issuer.email} onChange={setI('email')} /></div>
              </div>
              <div><Label className="text-xs">登録番号（インボイス）</Label><Input value={issuer.regNo} onChange={setI('regNo')} placeholder="T1234567890123（未登録なら空欄）" /></div>
              <div><Label className="text-xs">振込先</Label><Input value={issuer.bank} onChange={setI('bank')} placeholder="〇〇銀行 〇〇支店 普通 1234567 ヤマダ タロウ" /></div>
            </div>
          </section>
          <section className="rounded-lg border bg-white p-4">
            <h2 className="text-sm font-semibold">請求内容</h2>
            <div className="mt-3 grid gap-2">
              <div className="grid grid-cols-3 gap-2">
                <div><Label className="text-xs">請求番号</Label><Input value={doc.number} onChange={setD('number')} /></div>
                <div><Label className="text-xs">請求日</Label><Input type="date" value={doc.date} onChange={setD('date')} /></div>
                <div><Label className="text-xs">支払期限</Label><Input type="date" value={doc.due} onChange={setD('due')} /></div>
              </div>
              <div><Label className="text-xs">件名</Label><Input value={doc.subject} onChange={setD('subject')} /></div>
              <div>
                <Label className="text-xs">明細</Label>
                <div className="mt-1 space-y-2">
                  {doc.items.map((it, i) => (
                    <div key={i} className="grid grid-cols-[1fr_56px_96px_28px] items-center gap-1">
                      <Input value={it.desc} onChange={e => setItem(i, 'desc', e.target.value)} placeholder="品目" />
                      <Input type="number" value={it.qty} onChange={e => setItem(i, 'qty', e.target.value)} />
                      <Input type="number" value={it.unit} onChange={e => setItem(i, 'unit', e.target.value)} />
                      <button type="button" onClick={() => removeItem(i)} className="text-muted-foreground hover:text-red-600" aria-label="削除"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={addItem} className="inline-flex items-center text-xs text-primary hover:underline"><Plus className="mr-1 h-3 w-3" />行を追加</button>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={doc.withholding} onChange={e => setDoc(d => d && ({ ...d, withholding: e.target.checked }))} />源泉徴収税額（税抜額 × 10.21%）を差し引く</label>
              <div><Label className="text-xs">備考</Label><textarea className="w-full rounded-md border px-3 py-2 text-sm" rows={2} value={doc.note} onChange={setD('note')} /></div>
            </div>
          </section>
          <p className="text-xs text-muted-foreground">印刷ダイアログで「送信先: PDF に保存」を選ぶと PDF になります。用紙は A4、余白は「既定」のままで収まります。</p>
        </aside>

        {/* 請求書本体（印刷対象） */}
        <main className="relative flex-1">
          <div className="relative mx-auto w-full max-w-[794px] bg-white p-10 text-[13px] leading-relaxed text-slate-900 shadow print:max-w-none print:p-0 print:shadow-none">
            {paid === false && (
              <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="rotate-[-30deg] text-4xl font-bold text-slate-200">FreelanceOS 無料プラン</span>
              </div>
            )}
            <h1 className="text-center text-2xl font-bold tracking-[0.5em]">請求書</h1>
            <div className="mt-6 flex items-start justify-between gap-6">
              <div>
                <p className="whitespace-pre-line text-base font-semibold">{clientName || '（宛先未設定）'} <span className="text-sm font-normal">御中</span></p>
                <p className="mt-4">件名: {doc.subject}</p>
                <p className="mt-1">下記のとおりご請求申し上げます。</p>
                <p className="mt-3 text-lg font-bold">ご請求金額 <span className="ml-2 text-2xl">¥{yen(totals.total)}</span>（税込）</p>
                <p className="mt-1">お支払期限: {doc.due.replace(/-/g, '/')}</p>
              </div>
              <div className="min-w-[240px] text-right">
                <p>請求番号: {doc.number}</p>
                <p>請求日: {doc.date.replace(/-/g, '/')}</p>
                <div className="mt-4 whitespace-pre-line text-left">
                  <p className="font-semibold">{issuer.name || '（発行者未設定）'}</p>
                  {issuer.address && <p>{issuer.address}</p>}
                  {(issuer.tel || issuer.email) && <p>{[issuer.tel && `TEL: ${issuer.tel}`, issuer.email].filter(Boolean).join('　')}</p>}
                  {issuer.regNo && <p>登録番号: {issuer.regNo}</p>}
                </div>
              </div>
            </div>
            <table className="mt-8 w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 text-left">
                  <th className="py-2">品目</th><th className="w-16 py-2 text-right">数量</th><th className="w-28 py-2 text-right">単価</th><th className="w-32 py-2 text-right">金額</th>
                </tr>
              </thead>
              <tbody>
                {doc.items.map((it, i) => (
                  <tr key={i} className="border-b border-slate-200">
                    <td className="py-2">{it.desc}</td><td className="py-2 text-right">{it.qty}</td><td className="py-2 text-right">¥{yen(it.unit)}</td><td className="py-2 text-right">¥{yen(Math.floor(it.qty * it.unit))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 ml-auto w-72 space-y-1">
              <div className="flex justify-between"><span>小計（税抜）</span><span>¥{yen(totals.subtotal)}</span></div>
              <div className="flex justify-between"><span>消費税（10%）</span><span>¥{yen(totals.tax)}</span></div>
              {doc.withholding && <div className="flex justify-between"><span>源泉徴収税額（10.21%）</span><span>−¥{yen(totals.withholding)}</span></div>}
              <div className="flex justify-between border-t-2 border-slate-800 pt-1 text-base font-bold"><span>合計</span><span>¥{yen(totals.total)}</span></div>
            </div>
            {issuer.bank && (
              <div className="mt-8">
                <p className="font-semibold">お振込先</p>
                <p className="whitespace-pre-line">{issuer.bank}</p>
              </div>
            )}
            {doc.note && (
              <div className="mt-6">
                <p className="font-semibold">備考</p>
                <p className="whitespace-pre-line">{doc.note}</p>
              </div>
            )}
          </div>
        </main>
      </div>
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          body { background: #fff; }
          nav, header, footer { display: none !important; }
        }
      `}</style>
    </div>
  )
}
