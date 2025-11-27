import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'
import { z } from 'zod'

const habitSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  frequency: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        completions: {
          orderBy: { date: 'desc' },
          take: 30, // Last 30 completions
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ habits })
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
    const data = habitSchema.parse(body)

    const habit = await prisma.habit.create({
      data: {
        ...data,
        userId,
      },
    })

    return NextResponse.json({ habit }, { status: 201 })
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



