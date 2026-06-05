import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white px-8 py-10 shadow-sm ring-1 ring-gray-200">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">HospitalRun</h1>
            <p className="mt-1 text-sm text-gray-500">Sign in to your account to continue</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
