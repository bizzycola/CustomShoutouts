export interface AppUser {
  id: string
  username: string
  email: string
  avatarUrl: string
  isAdmin: boolean
  isSuperAdmin: boolean
  defaultSO: string
  maxAllowedShoutouts: number
  created: Date
  updated: Date
}
