import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { signJWT } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  code: z.string().regex(/^[A-Z]-\d{2}$/, 'Invalid team code format (e.g., A-01)'),
  displayName: z.string().min(3).max(50)
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, displayName } = registerSchema.parse(body)
    
    // Check if team code already exists
    const existingTeam = await prisma.team.findUnique({
      where: { code }
    })
    
    if (existingTeam) {
      return NextResponse.json(
        { error: 'Team code already registered' },
        { status: 400 }
      )
    }
    
    // Get the active event
    const event = await prisma.event.findFirst({
      where: { isOpen: true }
    })
    
    if (!event) {
      return NextResponse.json(
        { error: 'No active event found' },
        { status: 400 }
      )
    }
    
    // Create user and team in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user for the team
      const user = await tx.user.create({
        data: {
          role: 'TEAM'
        }
      })
      
      // Create team
      const team = await tx.team.create({
        data: {
          code,
          displayName,
          userId: user.id
        }
      })
      
      // Create initial score entry
      await tx.score.create({
        data: {
          teamId: team.id,
          eventId: event.id,
          total: 0
        }
      })
      
      return { user, team }
    })
    
    // Generate JWT
    const token = await signJWT({
      userId: result.user.id,
      role: result.user.role,
      teamId: result.team.id
    })
    
    return NextResponse.json({
      token,
      team: {
        id: result.team.id,
        code: result.team.code,
        displayName: result.team.displayName
      }
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: (error as any).errors },
        { status: 400 }
      )
    }
    
    console.error('Team registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
