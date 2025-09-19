import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTeamFromAuth } from '@/lib/auth'
import { scoreSubmission } from '@/lib/scoring'
import { z } from 'zod'

const submitSchema = z.object({
  answers: z.record(z.string(), z.any()) // { [questionId]: userAnswerPayload }
})

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ activityId: string }> }
) {
  try {
    const params = await context.params
    const team = await getTeamFromAuth(req)
    const body = await req.json()
    const { answers } = submitSchema.parse(body)
    
    // Get activity with questions
    const activity = await prisma.activity.findUnique({
      where: { id: params.activityId },
      include: { 
        questions: {
          orderBy: { order: 'asc' }
        },
        event: true 
      }
    })
    
    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      )
    }
    
    if (!activity.isFrozen) {
      return NextResponse.json(
        { error: 'Activity not available yet' },
        { status: 400 }
      )
    }
    
    if (!activity.event.isOpen) {
      return NextResponse.json(
        { error: 'Event is not open' },
        { status: 400 }
      )
    }
    
    // Check if already submitted (lock after first)
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        teamId_activityId: {
          teamId: team.id,
          activityId: activity.id
        }
      }
    })
    
    if (existingSubmission) {
      return NextResponse.json(
        { error: 'Already submitted this activity' },
        { status: 400 }
      )
    }
    
    // Score the submission
    const result = scoreSubmission(activity.questions, answers)
    
    // Create submission and update score in transaction
    await prisma.$transaction(async (tx) => {
      // Create submission
      await tx.submission.create({
        data: {
          teamId: team.id,
          activityId: activity.id,
          answers,
          score: result.total
        }
      })
      
      // Update team's total score
      await tx.score.upsert({
        where: {
          teamId_eventId: {
            teamId: team.id,
            eventId: activity.eventId
          }
        },
        create: {
          teamId: team.id,
          eventId: activity.eventId,
          total: result.total
        },
        update: {
          total: { increment: result.total }
        }
      })
    })
    
    // Return results with explanations
    return NextResponse.json({
      success: true,
      score: result.total,
      perQuestion: result.perQuestion,
      explanations: result.explanations
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: (error as any).errors },
        { status: 400 }
      )
    }
    
    console.error('Submit activity error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    )
  }
}
