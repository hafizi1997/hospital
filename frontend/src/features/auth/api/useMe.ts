import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { AuthUser } from '../types'

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () =>
      api.get<AuthUser>('/v1/auth/me').then((r) => {
        // Set user synchronously inside queryFn — before React Query triggers
        // a re-render — so ProtectedLayout always sees a populated Zustand store
        // by the time isLoading flips to false.
        useAuthStore.getState().setUser(r.data)
        return r.data
      }),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
