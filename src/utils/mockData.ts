export interface Tailor {
  id: number
  name: string
  specialty: string
  services?: string[]
  rating: number
  orders: number
  experience: string
  priceFrom?: number
  available?: boolean
  location: string
}

export interface Testimonial {
  id: number
  name: string
  role: string
  text: string
}

export interface Chat {
  id: number
  name: string
  lastMessage: string
  time: string
  unread: number
}

export interface Message {
  id: number
  chatId: number
  sender: string
  text: string
  time: string
}

export interface Order {
  id: string
  tailorName: string
  assignedTailorId?: number
  item: string
  status: string
  date: string
  amount: number
  progress?: number
}

export const mockData = {
  tailors: [
  { id: 1, name: 'Rajesh Kumar', specialty: 'Traditional Wear', services: ['Traditional Wear','Wedding Attire','Casual Wear'], rating: 4.8, orders: 250, experience: '15 years', priceFrom: 5000, available: true, location: 'Mumbai' },
  { id: 2, name: 'Priya Sharma', specialty: 'Wedding Attire', services: ['Wedding Attire','Traditional Wear'], rating: 4.9, orders: 180, experience: '10 years', priceFrom: 12000, available: true, location: 'Delhi' },
  { id: 3, name: 'Mohammed Ali', specialty: 'Formal Suits', services: ['Formal Suits','Designer Wear'], rating: 4.7, orders: 320, experience: '20 years', priceFrom: 8000, available: false, location: 'Bangalore' },
  { id: 4, name: 'Anita Desai', specialty: 'Casual Wear', services: ['Casual Wear','Designer Wear'], rating: 4.6, orders: 150, experience: '8 years', priceFrom: 3000, available: true, location: 'Chennai' },
  { id: 5, name: 'Suresh Patel', specialty: 'Ethnic Fashion', services: ['Ethnic Fashion','Traditional Wear'], rating: 4.9, orders: 290, experience: '18 years', priceFrom: 7000, available: true, location: 'Ahmedabad' },
  { id: 6, name: 'Lakshmi Iyer', specialty: 'Designer Wear', services: ['Designer Wear','Wedding Attire'], rating: 4.8, orders: 210, experience: '12 years', priceFrom: 10000, available: false, location: 'Hyderabad' },
  ] as Tailor[],
  testimonials: [
    { id: 1, name: 'Amit Verma', role: 'Business Professional', text: 'TailorConnect transformed my wardrobe! The attention to detail and perfect fit exceeded my expectations. Highly recommend!' },
    { id: 2, name: 'Sneha Reddy', role: 'Bride', text: 'Found the perfect tailor for my wedding outfits. The communication was seamless and the results were stunning!' },
    { id: 3, name: 'Karan Singh', role: 'Fashion Enthusiast', text: 'The quality of work is exceptional. I love how easy it is to track my orders and communicate with tailors.' },
  ] as Testimonial[],
  chats: [
    { id: 1, name: 'Rajesh Kumar', lastMessage: 'Your order is 60% complete', time: '2 min ago', unread: 2 },
    { id: 2, name: 'Priya Sharma', lastMessage: 'I\'ve received your measurements', time: '1 hour ago', unread: 0 },
    { id: 3, name: 'Mohammed Ali', lastMessage: 'Thank you for your order!', time: '2 days ago', unread: 0 },
  ] as Chat[],
  messages: [
    { id: 1, chatId: 1, sender: 'tailor', text: 'Hello! I\'ve started working on your sherwani.', time: '10:30 AM' },
    { id: 2, chatId: 1, sender: 'customer', text: 'Great! Can you share progress photos?', time: '10:32 AM' },
    { id: 3, chatId: 1, sender: 'tailor', text: 'Sure, I\'ll send them by evening.', time: '10:35 AM' },
    { id: 4, chatId: 1, sender: 'tailor', text: 'Your order is 60% complete', time: '2 min ago' },
  ] as Message[],
  orders: [
    { id: 'ORD-001', tailorName: 'Rajesh Kumar', assignedTailorId: 1, item: 'Sherwani', status: 'in-progress', date: '2025-10-25', amount: 8500, progress: 60 },
    { id: 'ORD-002', tailorName: 'Priya Sharma', assignedTailorId: 2, item: 'Lehenga', status: 'pending', date: '2025-10-28', amount: 15000, progress: 0 },
    { id: 'ORD-003', tailorName: 'Mohammed Ali', assignedTailorId: 3, item: 'Business Suit', status: 'completed', date: '2025-10-15', amount: 12000, progress: 100 },
  ] as Order[],
}


export const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const validatePassword = (password: string): boolean => {
  return password.length >= 8
}

export const validatePhone = (phone: string): boolean => {
  return /^[\d\s\-\+\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10
}

