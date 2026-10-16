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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error(authErrorMessage(error.message)); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-center">ログイン</h2>
      <div><Label htmlFor="email">メールアドレス</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
      <div><Label htmlFor="password">パスワード</Label><Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? 'ログイン中...' : 'ログイン'}</Button>
      <div className="text-center text-sm text-muted-foreground">
        <Link href="/reset-password" className="text-primary hover:underline">パスワードを忘れた方</Link>
        {' | '}
        <Link href="/signup" className="text-primary hover:underline">アカウント作成</Link>
      </div>
    </form>
  )
}
