import type { AppUser } from './appUser'

export interface InviteCode {
  code: string
  isAdmin: boolean
  creatorUser: AppUser
  creatorId: string
  user: AppUser
  used: boolean
  usedAt: Date
  created: Date
  comment: string
}
