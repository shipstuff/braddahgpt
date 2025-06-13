'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

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
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              + New Chat
            </button>
          </div>
          <div className="px-4 py-2">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Chats</h3>
            <div className="space-y-1">
              <div className="p-2 text-sm text-gray-600 bg-gray-50 rounded cursor-pointer hover:bg-gray-100">
                Chat about surfing...
              </div>
              <div className="p-2 text-sm text-gray-600 rounded cursor-pointer hover:bg-gray-100">
                Hawaiian food recipes...
              </div>
              <div className="p-2 text-sm text-gray-600 rounded cursor-pointer hover:bg-gray-100">
                Planning vacation...
              </div>
            </div>
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
                  Ho, howzit! 🤙
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Welcome to BraddahGPT, your Hawaiian pidgin AI assistant!
                </p>
                <p className="text-sm text-gray-500">
                  Start a conversation below and I'll talk story with you, brah!
                </p>
              </div>

              {/* Sample Messages */}
              <div className="space-y-4">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs">
                    Eh, what's the best beach on Oahu?
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="bg-white border rounded-lg px-4 py-2 max-w-md">
                    <div className="text-sm text-gray-500 mb-1">BraddahGPT</div>
                    <div>
                      Aurite brah! Fo' real kine, Lanikai Beach stay sick! Da water stay crystal clear and da sand stay soft like baby powder. But if you like surf, Pipeline on North Shore stay da place to be, yeah? Just watch out fo' unko - show some respect! 
                    </div>
                  </div>
                </div>
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
                  disabled
                />
                <button
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled
                >
                  Send
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Chat functionality coming soon! This is just a preview.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 