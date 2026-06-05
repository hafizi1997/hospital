import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

export type ApiHealth = {
  status: 'ok' | 'degraded'
  service: string
  environment: string
  database: {
    connected: boolean
    connection: string
    database: string
    error: string | null
  }
  timestamp: string
}

const apiBaseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'
const csrfBaseURL = apiBaseURL.replace(/\/api\/?$/, '') || '/'

export const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if ([401, 419].includes(error.response?.status)) {
      useAuthStore.getState().clearUser()
    }
    return Promise.reject(error)
  },
)

export async function getCsrfCookie() {
  await axios.get('/sanctum/csrf-cookie', {
    baseURL: csrfBaseURL,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
      Accept: 'application/json',
    },
  })
}

export async function getHealth() {
  const response = await api.get<ApiHealth>('/health')
  return response.data
}
