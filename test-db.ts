import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    // Test the connection
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    
    // Count users (should be 0 since we haven't created any)
    const userCount = await prisma.user.count()
    console.log(`📊 Users in database: ${userCount}`)
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
}

testConnection() 