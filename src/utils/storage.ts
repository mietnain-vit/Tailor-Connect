export interface Message {
  id: number
  chatId: number
  sender: string
  text: string
  time: string
}

export interface Notification {
  id: number
  title: string
  body: string
  time: string
  read?: boolean
  orderId?: string
  url?: string
}

const key = (prefix: string, id?: string | number) => (id !== undefined ? `${prefix}-${id}` : prefix)

export function getMessages(chatId: number) {
  const raw = localStorage.getItem(key('messages', chatId))
  return raw ? (JSON.parse(raw) as Message[]) : []
}

export function saveMessages(chatId: number, messages: Message[]) {
  localStorage.setItem(key('messages', chatId), JSON.stringify(messages))
}

export function addMessage(chatId: number, message: Message) {
  const msgs = getMessages(chatId)
  msgs.push(message)
  saveMessages(chatId, msgs)
  return msgs
}

export function getNotifications(userKey: string) {
  const raw = localStorage.getItem(key('notifications', userKey))
  return raw ? (JSON.parse(raw) as Notification[]) : []
}

export function addNotification(userKey: string, notification: Notification) {
  const items = getNotifications(userKey)
  items.push(notification)
  localStorage.setItem(key('notifications', userKey), JSON.stringify(items))
  return items
}

export function clearNotifications(userKey: string) {
  localStorage.removeItem(key('notifications', userKey))
}

// collect all helpers into a single default export at the end of the file

// Orders and images helpers
export function getOrders() {
  try { return JSON.parse(localStorage.getItem('orders') || '[]') } catch { return [] }
}

export function saveOrders(orders: any[]) {
  localStorage.setItem('orders', JSON.stringify(orders))
}

export function addOrder(order: any) {
  const orders = getOrders()
  orders.unshift(order)
  saveOrders(orders)
  try {
    // Notify the assigned tailor only (use tailor's user id as notification key if present)
    if (order.assignedTailorId) {
      addNotification(String(order.assignedTailorId), {
        id: Date.now(),
        title: `New order request ${order.id}`,
        body: `You have a new order request from ${order.customerName || 'a customer'} for ${order.item}`,
        time: new Date().toISOString(),
        orderId: String(order.id),
        url: `/orders/${order.id}`,
        read: false,
      })
    } else {
      // If no specific tailor assigned, add a generic 'tailor' notification so tailors browsing the dashboard can see it
      addNotification('tailor', {
        id: Date.now(),
        title: `New order ${order.id}`,
        body: `A new order was posted: ${order.item}`,
        time: new Date().toISOString(),
        orderId: String(order.id),
        url: `/orders/${order.id}`,
        read: false,
      })
    }

    // Also notify the customer who created the order (if we have a customer id stored)
    if (order.customerId) {
      addNotification(String(order.customerId), {
        id: Date.now() + 1,
        title: `Order ${order.id} placed`,
        body: `Your order request for ${order.item} was placed successfully.`,
        time: new Date().toISOString(),
        orderId: String(order.id),
        url: `/orders/${order.id}`,
        read: false,
      })
    }
  } catch (e) {
    // ignore notification errors in demo
    console.warn('notify addOrder error', e)
  }
  return orders
}

export function updateOrder(orderId: string, patch: Partial<any>) {
  const orders = getOrders()
  const updated = orders.map((o: any) => (o.id === orderId ? { ...o, ...patch } : o))
  saveOrders(updated)
  window.dispatchEvent(new CustomEvent('order-updated', { detail: { orderId } }))
  return updated
}

export function getOrderImages(orderId: string) {
  try { return JSON.parse(localStorage.getItem(`order-${orderId}-images`) || '[]') } catch { return [] }
}

export function addOrderImage(orderId: string, img: { data: string, name?: string, time?: string }) {
  const keyName = `order-${orderId}-images`
  const list = getOrderImages(orderId)
  list.push({ ...img, time: img.time || new Date().toISOString() })
  localStorage.setItem(keyName, JSON.stringify(list))
  window.dispatchEvent(new CustomEvent('order-updated', { detail: { orderId } }))
  return list
}

// Portfolio helpers for tailors
export function getPortfolio(tailorId: string) {
  try { return JSON.parse(localStorage.getItem(`tailor-portfolio-${tailorId}`) || '[]') } catch { return [] }
}

export function savePortfolio(tailorId: string, items: any[]) {
  localStorage.setItem(`tailor-portfolio-${tailorId}`, JSON.stringify(items))
}

export function addPortfolioItem(tailorId: string, item: { id?: number | string, data: string, title?: string, time?: string }) {
  const list = getPortfolio(tailorId)
  const entry = { id: item.id ?? Date.now(), data: item.data, title: item.title || '', time: item.time || new Date().toISOString() }
  list.unshift(entry)
  savePortfolio(tailorId, list)
  return list
}

export function removePortfolioItem(tailorId: string, itemId: number | string) {
  const list = getPortfolio(tailorId)
  const updated = list.filter((i: any) => String(i.id) !== String(itemId))
  savePortfolio(tailorId, updated)
  return updated
}

// Upload abstraction: try external upload endpoint (Vite env VITE_UPLOAD_URL), else save base64 like before
export async function uploadPortfolioItem(tailorId: string, file: File) {
  const uploadUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_UPLOAD_URL) ? (import.meta as any).env.VITE_UPLOAD_URL : ''
  if (uploadUrl) {
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(uploadUrl, { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed')
      const json = await res.json()
      const url = json.url || json.fileUrl || json.key || ''
      const list = getPortfolio(tailorId)
      const entry = { id: Date.now(), data: url, title: file.name, time: new Date().toISOString() }
      list.unshift(entry)
      savePortfolio(tailorId, list)
      return list
    } catch (e) {
      // fallthrough to base64 fallback
      console.warn('uploadPortfolioItem external upload failed, falling back to base64', e)
    }
  }

  // Fallback: read file to base64 and add
  return new Promise<any[]>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = reader.result as string
        const updated = addPortfolioItem(tailorId, { data, title: file.name })
        resolve(updated)
      } catch (err) { reject(err) }
    }
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}

// Reviews
export function getReviews(tailorId: string) {
  try { return JSON.parse(localStorage.getItem(`tailor-reviews-${tailorId}`) || '[]') } catch { return [] }
}

export function addReview(tailorId: string, review: { id: number, rating: number, text: string, user?: string, time?: string }) {
  const list = getReviews(tailorId)
  list.push({ ...review, time: review.time || new Date().toISOString() })
  localStorage.setItem(`tailor-reviews-${tailorId}`, JSON.stringify(list))
  return list
}

// Payouts helpers for tailors
export function getPayouts(tailorId: string) {
  try { return JSON.parse(localStorage.getItem(`payouts-${tailorId}`) || '[]') } catch { return [] }
}

export function recordPayout(tailorId: string, payout: { id?: number | string, amount: number, method?: string, status?: string, time?: string }) {
  const list = getPayouts(tailorId)
  const entry = { id: payout.id ?? Date.now(), amount: payout.amount, method: payout.method || 'bank', status: payout.status || 'requested', time: payout.time || new Date().toISOString() }
  list.unshift(entry)
  localStorage.setItem(`payouts-${tailorId}`, JSON.stringify(list))
  return list
}

export function approvePayout(tailorId: string, payoutId: number | string, newStatus: string = 'approved') {
  const list = getPayouts(tailorId)
  const updated = list.map((p: any) => (String(p.id) === String(payoutId) ? { ...p, status: newStatus, processedAt: new Date().toISOString() } : p))
  localStorage.setItem(`payouts-${tailorId}`, JSON.stringify(updated))
  return updated
}
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  },
  
  remove: (key: string): void => {
    localStorage.removeItem(key)
  },
  
  clear: (): void => {
    localStorage.clear()
  },
}

export const sessionStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error)
    }
  },
  
  remove: (key: string): void => {
    window.sessionStorage.removeItem(key)
  },
}

// Default export with all helpers for backward compatibility
const fullExport = {
  getMessages,
  saveMessages,
  addMessage,
  getNotifications,
  addNotification,
  clearNotifications,
  getOrders,
  saveOrders,
  addOrder,
  updateOrder,
  getOrderImages,
  addOrderImage,
  getReviews,
  addReview,
  getPortfolio,
  savePortfolio,
  addPortfolioItem,
  removePortfolioItem,
  uploadPortfolioItem,
  getPayouts,
  recordPayout,
  approvePayout,
  storage,
  sessionStorage,
}

export default fullExport

