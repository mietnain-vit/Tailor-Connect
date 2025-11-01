export const mockData = {
    tailors: [
        { id: 1, name: 'Rajesh Kumar', specialty: 'Traditional Wear', rating: 4.8, orders: 250, experience: '15 years', location: 'Mumbai' },
        { id: 2, name: 'Priya Sharma', specialty: 'Wedding Attire', rating: 4.9, orders: 180, experience: '10 years', location: 'Delhi' },
        { id: 3, name: 'Mohammed Ali', specialty: 'Formal Suits', rating: 4.7, orders: 320, experience: '20 years', location: 'Bangalore' },
        { id: 4, name: 'Anita Desai', specialty: 'Casual Wear', rating: 4.6, orders: 150, experience: '8 years', location: 'Chennai' },
        { id: 5, name: 'Suresh Patel', specialty: 'Ethnic Fashion', rating: 4.9, orders: 290, experience: '18 years', location: 'Ahmedabad' },
        { id: 6, name: 'Lakshmi Iyer', specialty: 'Designer Wear', rating: 4.8, orders: 210, experience: '12 years', location: 'Hyderabad' }
    ],
    testimonials: [
        { id: 1, name: 'Amit Verma', role: 'Business Professional', text: 'TailorConnect transformed my wardrobe! The attention to detail and perfect fit exceeded my expectations. Highly recommend!' },
        { id: 2, name: 'Sneha Reddy', role: 'Bride', text: 'Found the perfect tailor for my wedding outfits. The communication was seamless and the results were stunning!' },
        { id: 3, name: 'Karan Singh', role: 'Fashion Enthusiast', text: 'The quality of work is exceptional. I love how easy it is to track my orders and communicate with tailors.' }
    ],
    chats: [
        { id: 1, name: 'Rajesh Kumar', lastMessage: 'Your order is 60% complete', time: '2 min ago', unread: 2 },
        { id: 2, name: 'Priya Sharma', lastMessage: 'I\'ve received your measurements', time: '1 hour ago', unread: 0 },
        { id: 3, name: 'Mohammed Ali', lastMessage: 'Thank you for your order!', time: '2 days ago', unread: 0 }
    ],
    messages: [
        { id: 1, chatId: 1, sender: 'tailor', text: 'Hello! I\'ve started working on your sherwani.', time: '10:30 AM' },
        { id: 2, chatId: 1, sender: 'customer', text: 'Great! Can you share progress photos?', time: '10:32 AM' },
        { id: 3, chatId: 1, sender: 'tailor', text: 'Sure, I\'ll send them by evening.', time: '10:35 AM' },
        { id: 4, chatId: 1, sender: 'tailor', text: 'Your order is 60% complete', time: '2 min ago' }
    ],
    orders: [
        { id: 'ORD-001', tailorName: 'Rajesh Kumar', item: 'Sherwani', status: 'in-progress', date: '2025-10-25', amount: 8500, progress: 60 },
        { id: 'ORD-002', tailorName: 'Priya Sharma', item: 'Lehenga', status: 'pending', date: '2025-10-28', amount: 15000, progress: 0 },
        { id: 'ORD-003', tailorName: 'Mohammed Ali', item: 'Business Suit', status: 'completed', date: '2025-10-15', amount: 12000, progress: 100 }
    ]
}

export const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const validatePassword = (password) => {
    return password.length >= 8
}

export const validatePhone = (phone) => {
    return /^[\d\s\-\+\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10
}