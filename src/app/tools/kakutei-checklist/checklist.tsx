'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Item = { t: string; when: string; note?: string; href?: string }
const GROUPS: { title: string; items: Item[] }[] = [
  { title: '1. 事前準備（通年）', items: [
    { t: '開業届を税務署に出した', when: '開業から 1 か月以内', note: '未提出でも申告はできる', href: '/blog/freelance-kaigyo-todoke' },
    { t: '青色申告承認申請書を出した（青色申告する場合）', when: 'その年の 3/15 まで（開業年は 2 か月以内）', note: '65 万円控除には e-Tax か電子帳簿保存が必要', href: '/tools/aoiro' },
    { t: '事業用の銀行口座・クレジットカードを分けた', when: '通年', note: '仕訳と証憑の管理が楽になる' },
    { t: '会計ソフトや Excel で帳簿を毎月つけている', when: '毎月', note: '年末にまとめると漏れが出やすい', href: '/blog/freelance-boki-shiwake' },
    { t: 'メール添付の請求書・Web 明細を電子データのまま保存している', when: '通年', note: '電子帳簿保存法', href: '/blog/freelance-denshi-chobo-hozon' },
  ] },
  { title: '2. 書類を集める（12 月〜1 月）', items: [
    { t: '売上の請求書と入金の記録（通帳・決済サービスの明細）', when: '1 月中' },
    { t: '支払調書（取引先から届く場合）', when: '1 月末ごろ', note: '届かなくても自分の記録で申告できる', href: '/blog/freelance-withholding-tax' },
    { t: '経費の領収書・レシート（紙・電子）', when: '1 月中', note: '科目別・月別に整理', href: '/blog/freelance-expenses-list' },
    { t: '国民年金の控除証明書', when: '11 月ごろ届く', note: '社会保険料控除' },
    { t: '国民健康保険の納付額（通知書や自治体の証明）', when: '1〜2 月', note: '社会保険料控除' },
    { t: '生命保険料・地震保険料の控除証明書', when: '10〜11 月に届く' },
    { t: 'iDeCo・小規模企業共済の掛金の証明書', when: '10〜11 月に届く' },
    { t: 'ふるさと納税の寄附金受領証明書', when: '通年', note: 'ワンストップ特例は確定申告すると無効', href: '/tools/furusato' },
    { t: '医療費の領収書・医療費通知（医療費控除を受ける場合）', when: '1 月中' },
    { t: 'マイナンバーカード（e-Tax に使う）', when: '通年' },
    { t: '前年の確定申告書の控え', when: '通年' },
  ] },
  { title: '3. 帳簿を締める（1 月）', items: [
    { t: '12 月末までの売上をすべて入力した（12 月納品・1 月入金の分も）', when: '1 月中' },
    { t: '未入金の売上（売掛金）を確認した', when: '1 月中' },
    { t: '12 月末までの経費をすべて入力した', when: '1 月中' },
    { t: '家賃・光熱費・通信費の家事按分をした', when: '1 月中', note: '按分の根拠をメモ', href: '/tools/anbun' },
    { t: '10 万円以上の備品を減価償却で処理した', when: '1 月中', note: '青色申告には少額の資産を一括で経費にできる特例あり（条件は国税庁で確認）' },
    { t: '事業用口座の残高と帳簿の残高が一致しているか確認した', when: '1 月中' },
  ] },
  { title: '4. 申告書を作る（2 月〜3 月）', items: [
    { t: '会計ソフトか確定申告書等作成コーナーで申告書を作った', when: '2/16〜3/15', href: '/blog/freelance-etax-how-to' },
    { t: '青色申告決算書（または収支内訳書）を作った', when: '2/16〜3/15' },
    { t: '社会保険料・生命保険料・iDeCo・寄附金などの控除を入力した', when: '2/16〜3/15' },
    { t: '源泉徴収された税額を入力した（還付になることも）', when: '2/16〜3/15', href: '/tools/withholding' },
    { t: 'インボイス登録している人は消費税の申告書も作った', when: '3/31 まで', note: '2026 年分は 2 割特例', href: '/blog/freelance-invoice-3wari-tokurei' },
    { t: '申告書の控え（PDF）を保存した', when: '提出時' },
  ] },
  { title: '5. 提出と納税（3 月）', items: [
    { t: '確定申告書を提出した', when: '3/15 まで', note: 'e-Tax なら 24 時間提出できる' },
    { t: '所得税を納めた（振替納税・クレジットカード・スマホ決済など）', when: '3/15 まで（振替納税は 4 月中旬）' },
    { t: '消費税を納めた（該当する人）', when: '3/31 まで' },
    { t: '6 月からの住民税・国保の支払いに備えて資金を取り分けた', when: '6 月以降', href: '/blog/freelance-juminzei-first-year' },
  ] },
]
const KEY = 'fos.tool.kakutei-checklist'
const total = GROUPS.reduce((s, g) => s + g.items.length, 0)

export function KakuteiChecklist() {
  const [done, setDone] = useState<Record<string, boolean>>({})
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setDone(JSON.parse(s)) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(done)) } catch {} }, [done])
  const count = Object.values(done).filter(Boolean).length
  const pct = Math.round((count / total) * 100)
  return (
    <div>
      <div className="sticky top-14 z-10 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm"><span className="font-semibold">進み具合 {count} / {total}</span><span>{pct}%</span></div>
        <div className="mt-2 h-2 rounded bg-slate-100"><div className="h-2 rounded bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>チェックはこの端末にだけ保存されます。</span><button type="button" className="hover:text-red-600" onClick={() => setDone({})}>すべて外す</button></div>
      </div>
      {GROUPS.map((g) => (
        <section key={g.title} className="mt-8">
          <h2 className="text-lg font-bold">{g.title}</h2>
          <ul className="mt-3 divide-y rounded-xl border bg-white">
            {g.items.map((it) => {
              const id = it.t
              return (
                <li key={id} className="flex gap-3 p-3 text-sm">
                  <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" checked={!!done[id]} onChange={(e) => setDone((d) => ({ ...d, [id]: e.target.checked }))} aria-label={it.t} />
                  <div className="min-w-0">
                    <p className={done[id] ? 'text-muted-foreground line-through' : ''}>{it.t}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">期限・時期: {it.when}{it.note ? ` ／ ${it.note}` : ''}{it.href ? <> ／ <Link href={it.href} className="text-primary hover:underline">詳しく</Link></> : null}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
