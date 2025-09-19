import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

// GET - Get current event
export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN')
    
    const event = await prisma.event.findFirst({
      include: {
        activities: {
          orderBy: { order: 'asc' }
        },
        scores: {
          include: { team: true }
        }
      }
    })
    
    return NextResponse.json({ event })
  } catch (error: any) {
    console.error('Get event error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    )
  }
}

// POST - Create new event
const createEventSchema = z.object({
  name: z.string().min(3),
  leaderboardVisibility: z.enum(['ADMIN_ONLY', 'TEAMS']).optional()
})

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN')
    
    const body = await req.json()
    const data = createEventSchema.parse(body)
    
    // Close any existing open events
    await prisma.event.updateMany({
      where: { isOpen: true },
      data: { isOpen: false }
    })
    
    // Create new event
    const event = await prisma.event.create({
      data: {
        name: data.name,
        leaderboardVisibility: data.leaderboardVisibility || 'ADMIN_ONLY',
        isOpen: false
      }
    })
    
    return NextResponse.json({ event })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: (error as any).errors },
        { status: 400 }
      )
    }
    
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    )
  }
}

// PATCH - Update event settings
const updateEventSchema = z.object({
  isOpen: z.boolean().optional(),
  leaderboardVisibility: z.enum(['ADMIN_ONLY', 'TEAMS']).optional(),
  eventId: z.string().optional()
})

export async function PATCH(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN')
    
    const body = await req.json()
    const data = updateEventSchema.parse(body)
    
    // Determine target event (by ID if provided, else latest)
    const currentEvent = data.eventId
      ? await prisma.event.findUnique({ where: { id: data.eventId } })
      : await prisma.event.findFirst({ orderBy: { createdAt: 'desc' } })
    
    if (!currentEvent) {
      return NextResponse.json(
        { error: 'No event found' },
        { status: 404 }
      )
    }
    
    // If opening this event, close all others first
    if (data.isOpen === true) {
      await prisma.event.updateMany({ where: { id: { not: currentEvent.id } }, data: { isOpen: false } })
    }

    // Update event
    const { eventId, ...updateData } = data
    const event = await prisma.event.update({
      where: { id: currentEvent.id },
      data: updateData
    })
    
    return NextResponse.json({ event })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: (error as any).errors },
        { status: 400 }
      )
    }
    
    console.error('Update event error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    )
  }
}
