import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// GET - Get leaderboard (if visible to teams)
export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, 'TEAM')
    
    // Get current event
    const event = await prisma.event.findFirst({
      where: { isOpen: true }
    })
    
    if (!event) {
      return NextResponse.json(
        { error: 'No active event' },
        { status: 404 }
      )
    }
    
    // Check visibility
    if (event.leaderboardVisibility !== 'TEAMS') {
      return NextResponse.json(
        { error: 'Leaderboard is not visible to teams' },
        { status: 403 }
      )
    }
    
    // Get scores
    const scores = await prisma.score.findMany({
      where: { eventId: event.id },
      include: {
        team: {
          select: {
            id: true,
            code: true,
            displayName: true
          }
        }
      },
      orderBy: [
        { total: 'desc' },
        { updatedAt: 'asc' } // Earlier submission wins ties
      ]
    })
    
    // Add rankings
    const leaderboard = scores.map((score, index) => ({
      rank: index + 1,
      teamId: score.team.id,
      teamCode: score.team.code,
      teamName: score.team.displayName,
      score: score.total,
      lastUpdated: score.updatedAt
    }))
    
    return NextResponse.json({ 
      leaderboard,
      event: {
        id: event.id,
        name: event.name
      }
    })
  } catch (error) {
    console.error('Get leaderboard error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    )
  }
}
