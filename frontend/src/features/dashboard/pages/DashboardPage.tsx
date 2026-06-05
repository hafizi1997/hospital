import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/features/auth/api/useLogout'

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const { mutate: logout, isPending } = useLogout()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className="text-base font-semibold text-gray-900">HospitalRun</span>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs capitalize text-gray-500">{user?.roles[0]}</p>
            </div>

            <button
              onClick={() => logout()}
              disabled={isPending}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {isPending ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back, {user?.name}. More features coming soon.</p>
      </main>
    </div>
  )
}
