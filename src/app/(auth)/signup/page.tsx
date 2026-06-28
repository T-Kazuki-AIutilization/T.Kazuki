'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('確認メールを送信しました')
    router.push('/login')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-center">アカウント作成</h2>
      <div><Label htmlFor="name">表示名</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} required /></div>
      <div><Label htmlFor="email">メールアドレス</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
      <div><Label htmlFor="password">パスワード（8文字以上）</Label><Input id="password" type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} required /></div>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? '作成中...' : 'アカウントを作成'}</Button>
      <p className="text-center text-sm text-muted-foreground">既にアカウントをお持ちの方は<Link href="/login" className="text-primary hover:underline">ログイン</Link></p>
    </form>
  )
}
