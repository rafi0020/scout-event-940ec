import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
	isFrozen: z.boolean().optional(),
	title: z.string().min(1).optional(),
	description: z.string().min(1).optional(),
	order: z.number().int().min(1).max(4).optional()
})

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
	try {
		await requireAuth(req, 'ADMIN')
		const body = await req.json()
		const data = updateSchema.parse(body)

        const params = await context.params
        const updated = await prisma.activity.update({
            where: { id: params.id },
			data
		})

		return NextResponse.json({ activity: updated })
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
		}
		return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 400 })
	}
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
	try {
		await requireAuth(req, 'ADMIN')
        const params = await context.params
        await prisma.activity.delete({ where: { id: params.id } })
		return NextResponse.json({ success: true })
	} catch (error) {
		return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 400 })
	}
}
