'use client'
import { useState, useCallback } from 'react'

type ApiState<T> = { data: T | null; loading: boolean; error: string | null }

export function useApi<T = unknown>() {
  const [state, setState] = useState<ApiState<T>>({ data: null, loading: false, error: null })

  const call = useCallback(async (url: string, options?: RequestInit) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.message || 'エラーが発生しました')
      setState({ data: json.data, loading: false, error: null })
      return json.data as T
    } catch (e: any) {
      setState({ data: null, loading: false, error: e.message })
      throw e
    }
  }, [])

  return { ...state, call }
}
