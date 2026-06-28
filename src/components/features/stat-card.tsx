import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type Props = { label: string; value: string; icon: LucideIcon; sublabel?: string; className?: string }

export function StatCard({ label, value, icon: Icon, sublabel, className }: Props) {
  return (
    <div className={cn('rounded-lg border bg-card p-4 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-[30px] font-bold leading-none tracking-tight">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
    </div>
  )
}
