import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'
import { z } from 'zod'

const exerciseSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().optional(),
  duration: z.number().nullable().optional(),
  calories: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  date: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = exerciseSchema.parse(body)

    await prisma.exercise.updateMany({
      where: { id: params.id, userId },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    })

    const exercise = await prisma.exercise.findUnique({
      where: { id: params.id },
    })

    return NextResponse.json({ exercise })
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.exercise.deleteMany({
      where: { id: params.id, userId },
    })

    return NextResponse.json({ message: 'Exercise deleted' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
