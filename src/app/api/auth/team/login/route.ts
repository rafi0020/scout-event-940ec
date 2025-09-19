import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { signJWT } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  code: z.string()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code } = loginSchema.parse(body)
    
    // Find team by code
    const team = await prisma.team.findUnique({
      where: { code },
      include: { user: true }
    })
    
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }
    
    // Generate JWT
    const token = await signJWT({
      userId: team.user.id,
      role: team.user.role,
      teamId: team.id
    })
    
    return NextResponse.json({
      token,
      team: {
        id: team.id,
        code: team.code,
        displayName: team.displayName
      }
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: (error as any).errors },
        { status: 400 }
      )
    }
    
    console.error('Team login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
