import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { NextResponse } from 'next/server'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

export function errorResponse(message: string, code: string, status = 400) {
  return NextResponse.json({ error: { message, code } }, { status })
}

export function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
    result[snakeKey] = value
  }
  return result
}
