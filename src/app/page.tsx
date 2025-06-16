'use client'

import { Chat } from '@prisma/client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<string | null>(null)
  const [chatTitleToDelete, setChatTitleToDelete] = useState<string>('')

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

  const openDeleteModal = (chatId: string, chatTitle: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent the chat from being selected when clicking delete
    setChatToDelete(chatId) // Store which chat we want to delete
    setChatTitleToDelete(chatTitle) // Store the chat title for display
    setShowDeleteModal(true) // Show the modal
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false) // Hide the modal
    setChatToDelete(null) // Clear the chat ID
    setChatTitleToDelete('') // Clear the chat title
  }

  const confirmDelete = async () => {
    if (!chatToDelete) return // Safety check - don't delete if no chat is selected
    
    try {
      const response = await fetch(`/api/chat?chatId=${chatToDelete}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Remove from sidebar
        fetchRecentChats()
        
        // If we deleted the currently selected chat, clear it
        if (selectedChatId === chatToDelete) {
          setSelectedChatId(null)
          setCurrentChatId(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    } finally {
      closeDeleteModal() // Always close the modal when done
    }
  }

  const deleteChat = (chatId: string, chatTitle: string, event: React.MouseEvent) => {
    openDeleteModal(chatId, chatTitle, event)
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
    return null 
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-2 sm:px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                BraddahGPT
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Aloha, {session.user?.name || session.user?.email}!
              </span>
              <span className="text-xs text-gray-600 sm:hidden">
                Aloha!
              </span>
              <button
                onClick={() => signOut()}
                className="text-xs sm:text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="flex-1 flex relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:relative
          z-50 md:z-0
          w-64 md:w-64
          bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          h-full
        `}>
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-4 md:mb-0">
              <button 
                onClick={() => {
                  startNewChat()
                  setSidebarOpen(false)
                }}
                className="w-full bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                + New Chat
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden ml-2 p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="px-3 sm:px-4 py-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Recent Chats</h3>
            {recentChats.length > 0 ? (
              <div className="space-y-1">
                {recentChats.map(chat => (
                  <div 
                    key={chat.id}
                    className={`p-2 text-xs sm:text-sm rounded cursor-pointer transition-colors group flex justify-between items-center ${
                      selectedChatId === chat.id 
                        ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-500' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      handleChatClick(chat.id)
                      setSidebarOpen(false)
                    }}
                  >
                    <span className="truncate flex-1 mr-2">{chat.title}</span>
                    <button
                      onClick={(e) => deleteChat(chat.id, chat.title, e)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs px-1 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 text-xs sm:text-sm text-gray-500">No recent chats</div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages Area */}
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
            <div className="max-w-full sm:max-w-3xl mx-auto space-y-4 sm:space-y-6">
              {/* Welcome Message */}
              <div className="text-center py-4 sm:py-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
                  Ho, howzit!
                </h2>
                <p className="text-base sm:text-lg text-gray-600 mb-3 sm:mb-6">
                  Welcome to BraddahGPT, your Hawaiian pidgin AI assistant!
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Start a conversation below and I'll talk story with you, brah!
                </p>
              </div>

              {/* Messages */}
              <div className="space-y-3 sm:space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-lg px-3 sm:px-4 py-2 max-w-[85%] sm:max-w-md ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border'
                    }`}>
                      {msg.role === 'assistant' && (
                        <div className="text-xs sm:text-sm text-gray-500 mb-1">BraddahGPT</div>
                      )}
                      <div className="text-sm sm:text-base">{msg.content}</div>
                      {msg.createdAt && (
                        <div className="text-xs text-gray-400 mt-1 text-right">
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
          <div className="border-t bg-white p-3 sm:p-4">
            <div className="max-w-full sm:max-w-3xl mx-auto">
              <div className="flex space-x-2 sm:space-x-4">
                <input
                  type="text"
                  placeholder="Ask me anything, brah..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base whitespace-nowrap"
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Chat
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{chatTitleToDelete}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 