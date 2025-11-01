import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send, Search, Paperclip, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mockData } from '@/utils/mockData'
import { getInitials } from '@/lib/utils'

interface Message {
  id: number
  chatId: number
  sender: string
  text: string
  time: string
}

interface Chat {
  id: number
  name: string
  lastMessage: string
  time: string
  unread: number
}

export default function ChatPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [selectedChat, setSelectedChat] = useState<number | null>(mockData.chats?.[0]?.id || null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    const savedMessages = localStorage.getItem(`chat-${selectedChat}`)
    if (selectedChat) {
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages))
      } else {
        const chatMessages = mockData.messages?.filter(m => m.chatId === selectedChat) || []
        setMessages(chatMessages as Message[])
      }
    }
  }, [isAuthenticated, navigate, selectedChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || !selectedChat) return

    const newMessage: Message = {
      id: Date.now(),
      chatId: selectedChat,
      sender: currentUser?.role === 'customer' ? 'customer' : 'tailor',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    localStorage.setItem(`chat-${selectedChat}`, JSON.stringify(updatedMessages))
    setInputMessage('')
  }

  if (!currentUser || !isAuthenticated) return null

  const chats = (mockData.chats || []) as Chat[]
  const currentChatData = chats.find(c => c.id === selectedChat)

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex h-[calc(100vh-5rem)]">
          {/* Chat Sidebar */}
          <aside className="w-80 border-r bg-card flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search conversations..." className="pl-10" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`w-full p-4 border-b hover:bg-muted transition-colors text-left ${
                    selectedChat === chat.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-white font-bold">
                      {getInitials(chat.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold truncate">{chat.name}</p>
                        <span className="text-xs text-muted-foreground">{chat.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                    </div>
                    {chat.unread > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Chat Main */}
          <main className="flex-1 flex flex-col">
            {selectedChat && currentChatData ? (
              <>
                <div className="p-4 border-b bg-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-white font-bold">
                      {getInitials(currentChatData.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{currentChatData.name}</h3>
                      <p className="text-xs text-muted-foreground">Active now</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender !== 'customer' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-white text-xs font-bold">
                          {getInitials('Tailor')}
                        </div>
                      )}
                      <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.sender === 'customer'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'customer' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                      {msg.sender === 'customer' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-white text-xs font-bold">
                          {getInitials(currentUser.name)}
                        </div>
                      )}
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t bg-card">
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="icon">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" className="bg-gradient-to-r from-gold-600 to-gold-500">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

