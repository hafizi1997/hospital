import axios from 'axios'

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

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: {
    Accept: 'application/json',
  },
})

export async function getHealth() {
  const response = await api.get<ApiHealth>('/health')

  return response.data
}
