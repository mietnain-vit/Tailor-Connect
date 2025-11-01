export const APP_NAME = 'TailorConnect'
export const APP_DESCRIPTION = 'Premium digital tailoring platform connecting customers with skilled tailors'

export const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const USER_ROLES = {
  CUSTOMER: 'customer',
  TAILOR: 'tailor',
  ADMIN: 'admin',
} as const

export const TAILOR_CATEGORIES = [
  'Traditional Wear',
  'Wedding Attire',
  'Formal Suits',
  'Casual Wear',
  'Designer Wear',
  'Ethnic Fashion',
] as const

