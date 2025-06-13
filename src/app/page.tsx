'use client'

import { Chat } from '@prisma/client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Add this type at the top of the file
type Message = {
  role: 'user' | 'assistant'
  content: string
  createdAt?: Date
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [recentChats, setRecentChats] = useState<Chat[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const handleSend = async () => {
    if (!message.trim()) return
    
    const userMessage: Message = { role: 'user', content: message, createdAt: new Date() }
    setMessages(prev => [...prev, userMessage])
    
    setLoading(true)
    const currentMessage = message
    setMessage('')
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentMessage,
          chatId: currentChatId
        })
      })
      
      const data = await response.json()
      
      const isNewChat = currentChatId === null
      setCurrentChatId(data.chatId)
      setSelectedChatId(data.chatId)

      const aiMessage: Message = { role: 'assistant', content: data.response, createdAt: new Date() }
      setMessages(prev => [...prev, aiMessage])

      if (isNewChat) {
        fetchRecentChats()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentChats = async () => {
    try {
      const response = await fetch('/api/chats')
      const data = await response.json()
      setRecentChats(data.chats)
    } catch (error) {
      console.error('Error fetching recent chats:', error)
    }
  }

  useEffect(() => {
    fetchRecentChats()
  }, [])

  const handleChatClick = (chatId: string) => {
    setCurrentChatId(chatId)
    setSelectedChatId(chatId)
    fetchChatHistory(chatId)
  }

  const startNewChat = () => {
    setMessages([])         
    setCurrentChatId(null)    
    setSelectedChatId(null)
  }

  const fetchChatHistory = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat?chatId=${chatId}`)
      const data = await response.json()
      
      // Convert database format to UI format
      const formattedMessages: Message[] = data.messages.map((msg: any) => ({
        role: msg.role.toLowerCase() as 'user' | 'assistant',
        content: msg.content,
        createdAt: msg.createdAt
      }))
      
      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error fetching chat history:', error)
    }
  }

  const deleteChat = async (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation() 
    
    try {
      const response = await fetch(`/api/chat?chatId=${chatId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Remove from sidebar
        fetchRecentChats()
        
        // If we deleted the currently selected chat, clear it
        if (selectedChatId === chatId) {
          setSelectedChatId(null)
          setCurrentChatId(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                BraddahGPT
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Aloha, {session.user?.name || session.user?.email}!
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface Template */}
      <div className="flex-1 flex">
        {/* Sidebar (Future: Chat History) */}
        <div className="w-64 bg-white border-r border-gray-200">
          <div className="p-4">
            <button 
              onClick={startNewChat}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              + New Chat
            </button>
          </div>
          <div className="px-4 py-2">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Chats</h3>
            {/* Fetch and display recent chats */}
            {recentChats.length > 0 ? (
              <div className="space-y-1">
                {recentChats.map(chat => (
                  <div 
                    key={chat.id}
                    className={`p-2 text-sm rounded cursor-pointer transition-colors group flex justify-between items-center ${
                      selectedChatId === chat.id 
                        ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-500' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => handleChatClick(chat.id)}
                  >
                    <span className="truncate flex-1 mr-2">{chat.title}</span>
                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs px-1 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 text-sm text-gray-500">No recent chats</div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Welcome Message */}
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Ho, howzit!
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Welcome to BraddahGPT, your Hawaiian pidgin AI assistant!
                </p>
                <p className="text-sm text-gray-500">
                  Start a conversation below and I'll talk story with you, brah!
                </p>
              </div>

              {/* Replace the static Sample Messages with this: */}
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-lg px-4 py-2 max-w-md ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border'
                    }`}>
                      {msg.role === 'assistant' && (
                        <div className="text-sm text-gray-500 mb-1">BraddahGPT</div>
                      )}
                      <div>{msg.content}</div>
                      {msg.createdAt && (
                        <div className="text-xs text-light-gray-500 mt-1 text-right">
                          {new Date(msg.createdAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Ask me anything, brah..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Sup you faka...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 