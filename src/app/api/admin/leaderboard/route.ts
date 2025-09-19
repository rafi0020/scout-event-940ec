import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// GET - Get full leaderboard with details
export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN')
    
    // Get current event
    const event = await prisma.event.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        activities: {
          select: {
            id: true,
            title: true,
            order: true
          },
          orderBy: { order: 'asc' }
        }
      }
    })
    
    if (!event) {
      return NextResponse.json(
        { error: 'No event found' },
        { status: 404 }
      )
    }
    
    // Get all teams with scores and submissions
    const teams = await prisma.team.findMany({
      include: {
        scores: {
          where: { eventId: event.id }
        },
        submissions: {
          where: {
            activity: {
              eventId: event.id
            }
          },
          select: {
            activityId: true,
            score: true,
            createdAt: true
          }
        }
      }
    })
    
    // Format leaderboard data
    const leaderboard = teams
      .map(team => {
        const totalScore = team.scores[0]?.total || 0
        const activityScores: Record<string, number> = {}
        
        team.submissions.forEach(sub => {
          activityScores[sub.activityId] = sub.score
        })
        
        return {
          teamId: team.id,
          teamCode: team.code,
          teamName: team.displayName,
          totalScore,
          activityScores,
          submissionCount: team.submissions.length,
          lastActivity: team.submissions.length > 0 
            ? Math.max(...team.submissions.map(s => s.createdAt.getTime()))
            : null
        }
      })
      .sort((a, b) => {
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore
        }
        // Tie breaker: earlier completion
        if (a.lastActivity && b.lastActivity) {
          return a.lastActivity - b.lastActivity
        }
        return 0
      })
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }))
    
    return NextResponse.json({ 
      leaderboard,
      event: {
        id: event.id,
        name: event.name,
        activities: event.activities,
        isOpen: event.isOpen,
        leaderboardVisibility: event.leaderboardVisibility
      }
    })
  } catch (error) {
    console.error('Get admin leaderboard error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    )
  }
}
