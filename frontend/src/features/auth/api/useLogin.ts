import { useMutation } from '@tanstack/react-query'
import { api, getCsrfCookie } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { LoginFormValues } from '../schemas/loginSchema'
import type { AuthUser } from '../types'

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: async (data: LoginFormValues) => {
      await getCsrfCookie()
      return api.post<AuthUser>('/v1/auth/login', data).then((r) => r.data)
    },
    onSuccess: (user) => setUser(user),
  })
}
