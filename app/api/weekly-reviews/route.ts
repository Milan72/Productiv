import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'
import { z } from 'zod'

const reviewSchema = z.object({
  weekStart: z.string(),
  weekEnd: z.string(),
  achievements: z.string().optional(),
  challenges: z.string().optional(),
  goals: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviews = await prisma.weeklyReview.findMany({
      where: { userId },
      orderBy: { weekStart: 'desc' },
    })

    return NextResponse.json({ reviews })
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
    const data = reviewSchema.parse(body)

    const review = await prisma.weeklyReview.create({
      data: {
        ...data,
        weekStart: new Date(data.weekStart),
        weekEnd: new Date(data.weekEnd),
        userId,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
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



