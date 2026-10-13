'use client'
import { useState } from 'react'
import Link from 'next/link'
import { signInAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const result = await signInAction(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-center">ログイン</h2>
      <div><Label htmlFor="email">メールアドレス</Label><Input id="email" name="email" type="email" required /></div>
      <div><Label htmlFor="password">パスワード</Label><Input id="password" name="password" type="password" required /></div>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? 'ログイン中...' : 'ログイン'}</Button>
      {error && <p className="text-sm text-center text-red-500">{error}</p>}
      <div className="text-center text-sm text-muted-foreground">
        <Link href="/reset-password" className="text-primary hover:underline">パスワードを忘れた方</Link>
        {' | '}
        <Link href="/signup" className="text-primary hover:underline">アカウント作成</Link>
      </div>
    </form>
  )
}
