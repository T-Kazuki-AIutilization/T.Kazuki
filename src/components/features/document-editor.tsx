'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeft, Printer, Plus, Trash2, Receipt } from 'lucide-react'
import { toast } from 'sonner'

/**
 * 見積書・納品書・請求書の編集＋印刷（PDF 保存）コンポーネント。
 * 発行者情報と書類の内容はこの端末（localStorage）に保存する。
 * 案件ページ（ログイン後）と公開ツール（/tools/invoice）の両方で使う。
 */

export type Issuer = { name: string; address: string; tel: string; email: string; regNo: string; bank: string }
export type Item = { desc: string; qty: number; unit: number }
export type Kind = 'invoice' | 'quote' | 'delivery'
export type Doc = {
  kind: Kind; number: string; date: string; due: string; items: Item[]; withholding: boolean; note: string; subject: string
  clientName?: string; recordedRevenueId?: string
}
export type Totals = { subtotal: number; tax: number; withholding: number; total: number }

export const KINDS: Record<Kind, { title: string; dateLabel: string; dueLabel: string | null; amountLabel: string; greeting: string }> = {
  invoice: { title: '請求書', dateLabel: '請求日', dueLabel: 'お支払期限', amountLabel: 'ご請求金額', greeting: '下記のとおりご請求申し上げます。' },
  quote: { title: '見積書', dateLabel: '見積日', dueLabel: '有効期限', amountLabel: 'お見積金額', greeting: '下記のとおりお見積り申し上げます。' },
  delivery: { title: '納品書', dateLabel: '納品日', dueLabel: null, amountLabel: '納品金額', greeting: '下記のとおり納品いたしました。' },
}

const ISSUER_KEY = 'fos.invoice.issuer'
const emptyIssuer: Issuer = { name: '', address: '', tel: '', email: '', regNo: '', bank: '' }

export function yen(n: number) { return new Intl.NumberFormat('ja-JP').format(n) }
export function today(offsetDays = 0) {
  const d = new Date(); d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}
export function loadLocal<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? { ...fallback, ...JSON.parse(v) } : fallback } catch { return fallback }
}
function save(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }

export function computeTotals(doc: Doc | null): Totals {
  const subtotal = (doc?.items ?? []).reduce((s, it) => s + Math.floor((it.qty || 0) * (it.unit || 0)), 0)
  const tax = Math.floor(subtotal * 0.1)
  const withholding = doc?.withholding ? Math.floor(subtotal * 0.1021) : 0
  return { subtotal, tax, withholding, total: subtotal + tax - withholding }
}

type Props = {
  storageKey: string
  initial: Doc
  /** 案件に紐づく宛先（指定があれば宛先欄は編集不可） */
  fixedClientName?: string
  /** true: フッターの FreelanceOS 表記なし（Pro）。false/null: 表記あり */
  paid: boolean | null
  backHref?: string
  backLabel?: string
  /** 請求書を売上に記録する処理（案件ページのみ）。成功時は売上 ID を返す */
  onRecord?: (doc: Doc, totals: Totals) => Promise<string | undefined>
  /** 公開ツールモード（登録導線を表示） */
  publicMode?: boolean
}

export function DocumentEditor({ storageKey, initial, fixedClientName, paid, backHref, backLabel, onRecord, publicMode }: Props) {
  const [issuer, setIssuer] = useState<Issuer>(emptyIssuer)
  const [doc, setDoc] = useState<Doc | null>(null)
  const [recording, setRecording] = useState(false)

  useEffect(() => {
    setIssuer(loadLocal(ISSUER_KEY, emptyIssuer))
    setDoc(loadLocal(storageKey, initial))
    // initial は呼び出し側で安定していないことがあるため storageKey のみに反応する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])
  useEffect(() => { if (doc) save(storageKey, doc) }, [doc, storageKey])
  useEffect(() => { save(ISSUER_KEY, issuer) }, [issuer])

  const totals = useMemo(() => computeTotals(doc), [doc])

  async function record() {
    if (!doc || !onRecord || recording) return
    setRecording(true)
    try {
      const id = await onRecord(doc, totals)
      setDoc(d => d && ({ ...d, recordedRevenueId: id ?? 'recorded' }))
      toast.success('売上・入金に「請求済み」として記録しました')
    } catch (e: any) { toast.error(e?.message ?? '記録に失敗しました') } finally { setRecording(false) }
  }

  if (!doc) return <div className="p-8 text-sm text-muted-foreground">読み込み中...</div>
  const K = KINDS[doc.kind]
  const branded = paid !== true

  const setI = (k: keyof Issuer) => (e: React.ChangeEvent<HTMLInputElement>) => setIssuer(s => ({ ...s, [k]: e.target.value }))
  const setD = (k: keyof Doc) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDoc(d => d && ({ ...d, [k]: e.target.value }))
  const setItem = (i: number, k: keyof Item, v: string) => setDoc(d => d && ({ ...d, items: d.items.map((it, j) => j === i ? { ...it, [k]: k === 'desc' ? v : Number(v) || 0 } : it) }))
  const addItem = () => setDoc(d => d && ({ ...d, items: [...d.items, { desc: '', qty: 1, unit: 0 }] }))
  const removeItem = (i: number) => setDoc(d => d && ({ ...d, items: d.items.filter((_, j) => j !== i) }))
  const clientName = fixedClientName ?? doc.clientName ?? ''

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 lg:flex-row print:block print:max-w-none print:p-0">
        {/* 入力パネル（印刷時は非表示） */}
        <aside className="w-full space-y-5 lg:w-[380px] print:hidden">
          <div className="flex items-center justify-between">
            {backHref ? (
              <Link href={backHref} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="mr-1 h-4 w-4" />{backLabel ?? '戻る'}</Link>
            ) : <span />}
            <Button size="sm" onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" />印刷 / PDF に保存</Button>
          </div>
          {branded && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              {publicMode
                ? <>書類の末尾に小さく「FreelanceOS で作成」と入ります。<Link href="/signup" className="font-medium underline">無料登録</Link>すると案件・入金管理と連動し、Pro（14 日間無料）では表記なしで発行できます。</>
                : <>無料プランでは書類の末尾に小さく「FreelanceOS で作成」と入ります。<Link href="/settings/billing" className="font-medium underline">Pro（14 日間無料）</Link>で表記なしの書類を発行できます。</>}
            </div>
          )}
          <section className="rounded-lg border bg-white p-4">
            <h2 className="text-sm font-semibold">書類の種類</h2>
            <div className="mt-2 flex gap-2">
              {(Object.keys(KINDS) as Kind[]).map(k => (
                <button key={k} type="button" onClick={() => setDoc(d => d && ({ ...d, kind: k }))}
                  className={`rounded-md border px-3 py-1.5 text-sm ${doc.kind === k ? 'border-primary bg-primary text-white' : 'bg-white hover:bg-slate-50'}`}>{KINDS[k].title}</button>
              ))}
            </div>
            {doc.kind === 'invoice' && onRecord && (
              <div className="mt-3">
                {doc.recordedRevenueId ? (
                  <p className="text-xs text-muted-foreground">この請求書は売上・入金に記録済みです（<Link href="/revenue" className="text-primary underline">入金状況を見る</Link>）</p>
                ) : (
                  <Button size="sm" variant="outline" onClick={record} disabled={recording || totals.total <= 0}><Receipt className="mr-1 h-4 w-4" />{recording ? '記録中...' : '売上・入金に「請求済み」で記録'}</Button>
                )}
                <p className="mt-1 text-xs text-muted-foreground">合計 ¥{yen(totals.total)} を請求日・支払期限つきで登録し、未入金アラートの対象にします。</p>
              </div>
            )}
            {doc.kind === 'invoice' && publicMode && (
              <p className="mt-3 text-xs text-muted-foreground">FreelanceOS に無料登録すると、案件から請求書を作り、そのまま「請求済み」として入金管理に登録できます。</p>
            )}
          </section>
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
            <h2 className="text-sm font-semibold">{K.title}の内容</h2>
            <div className="mt-3 grid gap-2">
              {fixedClientName === undefined && (
                <div><Label className="text-xs">宛先（会社名・氏名）</Label><Input value={doc.clientName ?? ''} onChange={setD('clientName')} placeholder="株式会社〇〇" /></div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <div><Label className="text-xs">番号</Label><Input value={doc.number} onChange={setD('number')} /></div>
                <div><Label className="text-xs">{K.dateLabel}</Label><Input type="date" value={doc.date} onChange={setD('date')} /></div>
                <div><Label className="text-xs">{K.dueLabel ?? '期限（未使用）'}</Label><Input type="date" value={doc.due} onChange={setD('due')} disabled={!K.dueLabel} /></div>
              </div>
              <div><Label className="text-xs">件名</Label><Input value={doc.subject} onChange={setD('subject')} /></div>
              <div>
                <Label className="text-xs">明細（品目・数量・単価）</Label>
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
          <p className="text-xs text-muted-foreground">印刷ダイアログで「送信先: PDF に保存」を選ぶと PDF になります。用紙は A4、余白は「既定」のままで収まります。入力内容はこの端末にだけ保存され、サーバーには送信されません。</p>
        </aside>

        {/* 書類本体（印刷対象） */}
        <main className="relative flex-1">
          <div className="relative mx-auto w-full max-w-[794px] bg-white p-10 text-[13px] leading-relaxed text-slate-900 shadow print:max-w-none print:p-0 print:shadow-none">
            <h1 className="text-center text-2xl font-bold tracking-[0.5em]">{K.title}</h1>
            <div className="mt-6 flex items-start justify-between gap-6">
              <div>
                <p className="whitespace-pre-line text-base font-semibold">{clientName || '（宛先未設定）'} <span className="text-sm font-normal">御中</span></p>
                <p className="mt-4">件名: {doc.subject}</p>
                <p className="mt-1">{K.greeting}</p>
                <p className="mt-3 text-lg font-bold">{K.amountLabel} <span className="ml-2 text-2xl">¥{yen(totals.total)}</span>（税込）</p>
                {K.dueLabel && doc.due && <p className="mt-1">{K.dueLabel}: {doc.due.replace(/-/g, '/')}</p>}
              </div>
              <div className="min-w-[240px] text-right">
                <p>{K.title}番号: {doc.number}</p>
                <p>{K.dateLabel}: {doc.date.replace(/-/g, '/')}</p>
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
            {issuer.bank && doc.kind === 'invoice' && (
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
            {branded && (
              <p className="mt-10 text-right text-[10px] text-slate-400">FreelanceOS（freelanceos-eosin.vercel.app）で作成</p>
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
