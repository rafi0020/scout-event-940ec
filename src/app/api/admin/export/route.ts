import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN')

    // Find open or latest event
    const event = await prisma.event.findFirst({
      where: {},
      orderBy: { createdAt: 'desc' }
    })
    if (!event) return new NextResponse('No event', { status: 404 })

    // Load questions for consistent ordering
    const activities = await prisma.activity.findMany({
      where: { eventId: event.id },
      include: { questions: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' }
    })
    const questionIdToIdx = new Map<string, number>()
    const questionIdToMeta = new Map<string, { activityOrder: number; points: number; type: string; text: string }>()
    let qIndex = 1
    for (const a of activities) {
      for (const q of a.questions) {
        questionIdToIdx.set(q.id, qIndex++)
        questionIdToMeta.set(q.id, {
          activityOrder: a.order,
          points: q.points,
          type: q.type,
          text: typeof q.prompt === 'object' ? (q.prompt as any).text ?? '' : String(q.prompt)
        })
      }
    }

    // Pull submissions and anonymize team IDs
    const submissions = await prisma.submission.findMany({
      where: { activity: { eventId: event.id } },
      select: {
        teamId: true,
        activityId: true,
        answers: true,
        score: true,
        createdAt: true
      }
    })

    const teamIds = Array.from(new Set(submissions.map(s => s.teamId)))
    const teamIdToAnon = new Map<string, string>(teamIds.map((t, i) => [t, `T${(i+1).toString().padStart(3,'0')}`]))

    // CSV header
    const header = [
      'anonTeamId','activityOrder','questionIndex','questionType','questionText','points','userAnswer','score','submittedAt'
    ]

    const rows: string[] = [header.join(',')]

    for (const s of submissions) {
      const answers = s.answers as Record<string, unknown>
      for (const [qid, userAns] of Object.entries(answers)) {
        const idx = questionIdToIdx.get(qid)
        const meta = questionIdToMeta.get(qid)
        if (!idx || !meta) continue
        rows.push([
          teamIdToAnon.get(s.teamId)!,
          String(meta.activityOrder),
          String(idx),
          meta.type,
          `"${(meta.text || '').replace(/"/g,'""')}"`,
          String(meta.points),
          `"${JSON.stringify(userAns).replace(/"/g,'""')}"`,
          String(s.score),
          s.createdAt.toISOString()
        ].join(','))
      }
    }

    const csv = rows.join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="analytics_${event.id}.csv"`
      }
    })
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}


