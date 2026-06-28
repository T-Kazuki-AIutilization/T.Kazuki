import { cn } from '@/lib/utils'

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-700',
  green: 'bg-green-100 text-green-700',
  gray: 'bg-gray-100 text-gray-500',
  red: 'bg-red-100 text-red-700',
}

type Props = { label: string; color: string; className?: string }

export function StatusBadge({ label, color, className }: Props) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium', colorMap[color] ?? colorMap.gray, className)}>
      {label}
    </span>
  )
}
