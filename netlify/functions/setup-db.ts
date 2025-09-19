import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    // Test database connection
    await prisma.$connect()
    
    // Check if database is already set up
    const eventCount = await prisma.event.count()
    
    if (eventCount > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'Database already initialized',
          eventCount 
        })
      }
    }

    // Create a default event if none exists
    const defaultEvent = await prisma.event.create({
      data: {
        name: 'Scout Event 2025',
        isOpen: true,
        leaderboardVisibility: 'TEAMS'
      }
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Database initialized successfully',
        eventId: defaultEvent.id
      })
    }
  } catch (error) {
    console.error('Database setup error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Database setup failed',
        details: error.message 
      })
    }
  } finally {
    await prisma.$disconnect()
  }
}
