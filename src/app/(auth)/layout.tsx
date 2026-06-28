export const dynamic = 'force-dynamic'
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-lg font-bold text-white">F</span>
          </div>
          <h1 className="text-xl font-bold">FreelanceOS</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
