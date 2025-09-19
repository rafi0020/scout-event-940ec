import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

// GET - Get all activities
export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN')
    
    const activities = await prisma.activity.findMany({
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })
    
    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Get activities error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    )
  }
}

// POST - Create new activity
const questionSchema = z.object({
  type: z.enum(['MCQ', 'CHECKBOX', 'TRUE_FALSE', 'GRID_PATH']),
  prompt: z.any(), // JSON data
  options: z.any().optional(),
  points: z.number().min(1),
  order: z.number().optional()
})

const createActivitySchema = z.object({
  eventId: z.string(),
  title: z.string().min(3),
  description: z.string(),
  order: z.number().min(1).max(4),
  isFrozen: z.boolean().optional(),
  questions: z.array(questionSchema).optional()
})

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN')
    
    const body = await req.json()
    const data = createActivitySchema.parse(body)
    
    // Create activity with questions
    const activity = await prisma.activity.create({
      data: {
        eventId: data.eventId,
        title: data.title,
        description: data.description,
        order: data.order,
        isFrozen: data.isFrozen ?? true,
        questions: data.questions ? {
          create: data.questions.map((q, idx) => ({
            type: q.type,
            prompt: q.prompt,
            options: q.options,
            points: q.points,
            order: q.order ?? idx
          }))
        } : undefined
      },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    })
    
    return NextResponse.json({ activity })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: (error as any).errors },
        { status: 400 }
      )
    }
    
    console.error('Create activity error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    )
  }
}
