import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify habit belongs to user
    const habit = await prisma.habit.findFirst({
      where: { id: params.id, userId },
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    // Check if already completed today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingCompletion = await prisma.habitCompletion.findFirst({
      where: {
        habitId: params.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    if (existingCompletion) {
      return NextResponse.json(
        { error: 'Already completed today' },
        { status: 400 }
      )
    }

    // Create completion
    const completion = await prisma.habitCompletion.create({
      data: {
        habitId: params.id,
        date: new Date(),
      },
    })

    // Update streak
    const completions = await prisma.habitCompletion.findMany({
      where: { habitId: params.id },
      orderBy: { date: 'desc' },
    })

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const comp of completions) {
      const compDate = new Date(comp.date)
      compDate.setHours(0, 0, 0, 0)

      if (compDate.getTime() === currentDate.getTime()) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    await prisma.habit.update({
      where: { id: params.id },
      data: { streak },
    })

    return NextResponse.json({ completion, streak })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



