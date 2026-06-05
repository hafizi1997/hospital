import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/store/authStore'

export function useLogout() {
  const clearUser = useAuthStore((state) => state.clearUser)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => api.post('/v1/auth/logout'),
    onSuccess: () => {
      clearUser()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })
}
