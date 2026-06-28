'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` })
    if (error) { toast.error(error.message); return }
    setSent(true)
  }

  if (sent) return <div className="rounded-lg border bg-white p-6 shadow-sm text-center"><p className="text-sm">パスワードリセット用のメールを送信しました。</p><Link href="/login" className="mt-4 inline-block text-sm text-primary hover:underline">ログインに戻る</Link></div>

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-center">パスワードリセット</h2>
      <div><Label htmlFor="email">メールアドレス</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
      <Button type="submit" className="w-full">リセットメールを送信</Button>
      <p className="text-center text-sm"><Link href="/login" className="text-primary hover:underline">ログインに戻る</Link></p>
    </form>
  )
}
