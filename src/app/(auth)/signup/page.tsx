'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { authErrorMessage } from '@/lib/supabase/auth-errors'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } })
    if (error) { toast.error(authErrorMessage(error.message)); setLoading(false); return }
    // メール確認が不要な設定（または既にセッションがある）場合はそのままダッシュボードへ
    if (data.session) { router.push('/dashboard'); return }
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-center">確認メールを送信しました</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">{email}</span> 宛に確認メールを送りました。メール内の「Confirm your mail」のリンクをクリックすると登録が完了し、ログインできるようになります。
        </p>
        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          <li>送信元は <span className="font-mono">noreply@mail.app.supabase.io</span> です（件名は英語で届きます）。</li>
          <li>数分待っても届かない場合は、迷惑メールフォルダをご確認ください。</li>
          <li>リンクの有効期限は 24 時間です。期限が切れた場合は、もう一度アカウント作成をお試しください。</li>
        </ul>
        <Link href="/login" className="block text-center text-sm text-primary hover:underline">ログイン画面へ</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-center">アカウント作成</h2>
      <div><Label htmlFor="name">表示名</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} required /></div>
      <div><Label htmlFor="email">メールアドレス</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
      <div><Label htmlFor="password">パスワード（8文字以上）</Label><Input id="password" type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} required /></div>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? '作成中...' : 'アカウントを作成'}</Button>
      <p className="text-center text-xs text-muted-foreground leading-relaxed">
        アカウントを作成することで、
        <Link href="/terms" className="text-primary hover:underline">利用規約</Link>・
        <Link href="/privacy" className="text-primary hover:underline">プライバシーポリシー</Link>・
        <Link href="/tokusho" className="text-primary hover:underline">特定商取引法に基づく表記</Link>
        に同意したものとみなします。
      </p>
      <p className="text-center text-sm text-muted-foreground">既にアカウントをお持ちの方は<Link href="/login" className="text-primary hover:underline">ログイン</Link></p>
    </form>
  )
}
