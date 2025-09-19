import { prisma } from '@/lib/db'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { Role } from '@prisma/client'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production'
)

export interface AuthPayload {
  userId: string
  role: Role
  teamId?: string
  email?: string
}

export async function signJWT(payload: AuthPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyJWT(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as AuthPayload
  } catch (error) {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function getAuthFromRequest(req: NextRequest): Promise<AuthPayload | null> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.slice(7)
  return verifyJWT(token)
}

export async function requireAuth(req: NextRequest, requiredRole?: Role): Promise<AuthPayload> {
  const auth = await getAuthFromRequest(req)
  
  if (!auth) {
    throw new Error('Unauthorized: No valid authentication')
  }
  
  if (requiredRole && auth.role !== requiredRole) {
    throw new Error(`Unauthorized: Requires ${requiredRole} role`)
  }
  
  return auth
}

export async function getTeamFromAuth(req: NextRequest) {
  const auth = await requireAuth(req, 'TEAM')
  
  if (!auth.teamId) {
    throw new Error('No team associated with this user')
  }
  
  const team = await prisma.team.findUnique({
    where: { id: auth.teamId }
  })
  
  if (!team) {
    throw new Error('Team not found')
  }
  
  return team
}

export async function getAdminFromAuth(req: NextRequest) {
  const auth = await requireAuth(req, 'ADMIN')
  
  const admin = await prisma.user.findUnique({
    where: { id: auth.userId }
  })
  
  if (!admin) {
    throw new Error('Admin not found')
  }
  
  return admin
}
