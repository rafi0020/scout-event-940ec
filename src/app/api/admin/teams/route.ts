import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

export async function GET(req: NextRequest) {
	try {
		await requireAuth(req, 'ADMIN')
		const teams = await prisma.team.findMany({
			include: { user: true, scores: true }
		})
		return NextResponse.json({ teams })
	} catch (e) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}
}

const updateSchema = z.object({
	displayName: z.string().min(2).max(50).optional(),
	code: z.string().regex(/^[A-Z]-\d{2}$/).optional()
})

export async function PATCH(req: NextRequest) {
	try {
		await requireAuth(req, 'ADMIN')
		const body = await req.json()
		const { id, ...data } = body
		if (!id) {
			return NextResponse.json({ error: 'Team ID required' }, { status: 400 })
		}
		updateSchema.parse(data)
		const updated = await prisma.team.update({ where: { id }, data })
		return NextResponse.json({ team: updated })
	} catch (e: any) {
		console.error('Team update error:', e)
		return NextResponse.json({ error: e.message || 'Bad request' }, { status: 400 })
	}
}

export async function DELETE(req: NextRequest) {
	try {
		await requireAuth(req, 'ADMIN')
		const { id } = await req.json()
		if (!id) {
			return NextResponse.json({ error: 'Team ID required' }, { status: 400 })
		}
		// Delete related data first
		await prisma.submission.deleteMany({ where: { teamId: id } })
		await prisma.score.deleteMany({ where: { teamId: id } })
		// Find team to get linked userId
		const teamRecord = await prisma.team.findUnique({ where: { id } })
		if (!teamRecord) {
			return NextResponse.json({ error: 'Team not found' }, { status: 404 })
		}
		await prisma.team.delete({ where: { id } })
		await prisma.user.delete({ where: { id: teamRecord.userId } })
		return NextResponse.json({ success: true })
	} catch (e: any) {
		console.error('Team delete error:', e)
		return NextResponse.json({ error: e.message || 'Bad request' }, { status: 400 })
	}
}
