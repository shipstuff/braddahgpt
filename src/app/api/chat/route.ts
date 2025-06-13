import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, chatId } = await request.json()
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create or find chat
    let chat
    if (chatId) {
      // Use existing chat
      chat = await prisma.chat.findUnique({
        where: { id: chatId, userId: user.id }
      })
    } else {
      // Create new chat with title from first message
      const title = message.length > 50 ? message.substring(0, 50) + '...' : message
      chat = await prisma.chat.create({
        data: {
          title,
          userId: user.id
        }
      })
    }

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Save user message to database
    await prisma.message.create({
      data: {
        content: message,
        role: 'USER',
        chatId: chat.id
      }
    })

    // Get conversation history for context
    const previousMessages = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'asc' },
      take: 10 // Last 10 messages for context
    })

    const openaiMessages = [
      {
        role: "system" as const, 
        content: "You are BraddahGPT, a Hawaiian pidgin AI assistant. Talk like a local Hawaiian brah - use words like 'ho', 'brah', 'da kine', 'stay', etc. Be friendly and helpful!"
      },
      ...previousMessages.map(msg => ({
        role: msg.role === 'USER' ? 'user' as const : 'assistant' as const,
        content: msg.content
      })),
      { role: "user" as const, content: message }
    ]

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: openaiMessages,
    })

    const aiResponse = completion.choices[0]?.message?.content || "Sorry brah, no can help right now!"

    // Save AI response to database
    await prisma.message.create({
      data: {
        content: aiResponse,
        role: 'ASSISTANT',
        chatId: chat.id
      }
    })

    return NextResponse.json({ response: aiResponse, chatId: chat.id })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
} 

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

  const { searchParams } = new URL(request.url)
  const chatId = searchParams.get('chatId')

  if (!chatId) {
    return NextResponse.json({ error: 'Chat ID required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const chat = await prisma.chat.findUnique({
    where: { id: chatId, userId: user.id }
  })

  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
  }

  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' },
    select: {
        id: true,
        content: true,
        role: true,
        createdAt: true
    }
  })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete only if user owns the chat
    await prisma.chat.delete({ 
      where: { 
        id: chatId,
        userId: user.id 
      } 
    })

    return NextResponse.json({ message: 'Chat deleted' })
  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 })
  }
}