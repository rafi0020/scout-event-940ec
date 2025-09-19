import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// GET - Get available activities for teams
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, 'TEAM')
    
    // Get open event
    const event = await prisma.event.findFirst({
      where: { isOpen: true }
    })
    
    if (!event) {
      return NextResponse.json(
        { error: 'No active event' },
        { status: 404 }
      )
    }
    
    // Get activities (only frozen ones, without answer keys)
    const activities = await prisma.activity.findMany({
      where: {
        eventId: event.id,
        isFrozen: true
      },
      include: {
        questions: {
          select: {
            id: true,
            type: true,
            prompt: true,
            options: true,
            points: true,
            order: true
            // Exclude aiAnswerKey and aiExplanation
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })
    
    // Get team's submissions
    const submissions = await prisma.submission.findMany({
      where: {
        teamId: auth.teamId!,
        activityId: {
          in: activities.map(a => a.id)
        }
      }
    })
    
    // Mark completed activities
    const completedActivityIds = new Set(submissions.map(s => s.activityId))
    
    const activitiesWithStatus = activities.map(activity => ({
      ...activity,
      isCompleted: completedActivityIds.has(activity.id),
      submission: submissions.find(s => s.activityId === activity.id)
    }))
    
    return NextResponse.json({ 
      activities: activitiesWithStatus,
      event: {
        id: event.id,
        name: event.name
      }
    })
  } catch (error) {
    console.error('Get team activities error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    )
  }
}
