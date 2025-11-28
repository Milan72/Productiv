import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'
import { z } from 'zod'

const goalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  targetDate: z.string().optional(),
  status: z.enum(['active', 'completed', 'paused']).optional(),
  progress: z.number().min(0).max(100).optional(),
  priority: z.string().optional(),
  timeframe: z.string().optional(),
  currentValue: z.number().optional(),
  targetValue: z.number().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const goals = await prisma.goal.findMany({
      where: { userId },
      include: { okrs: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ goals })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = goalSchema.parse(body)

    const goal = await prisma.goal.create({
      data: {
        title: data.title,
        description: data.description || null,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        status: data.status || 'active',
        progress: data.progress || 0,
        priority: data.priority || null,
        timeframe: data.timeframe || null,
        currentValue: data.currentValue || null,
        targetValue: data.targetValue || null,
        userId,
      },
      include: { okrs: true },
    })

    return NextResponse.json({ goal }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



