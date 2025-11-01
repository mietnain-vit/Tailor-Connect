// Simple payment stub for demo purposes
import { updateOrder } from './storage'

export async function processDeposit(orderId: string, amount: number) {
  // simulate network delay
  await new Promise(r => setTimeout(r, 500))
  // mark order as paid (demo)
  updateOrder(orderId, { paid: true, depositAmount: amount })
  return { success: true, orderId, amount }
}

export async function refund(orderId: string, amount: number) {
  await new Promise(r => setTimeout(r, 500))
  updateOrder(orderId, { paid: false, refundedAmount: amount })
  return { success: true, orderId, amount }
}

export default { processDeposit, refund }
