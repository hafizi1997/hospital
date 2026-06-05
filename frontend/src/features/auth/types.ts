export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist'

export type AuthUser = {
  id: number
  name: string
  email: string
  roles: UserRole[]
}
