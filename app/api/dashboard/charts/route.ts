import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week' // week, month, year

    const now = new Date()
    let startDate: Date
    let endDate = new Date()

    if (period === 'week') {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else {
      // year
      startDate = new Date(now.getFullYear(), 0, 1)
    }

    // Get transactions for the period
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    })

    // Get habits completions
    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        completions: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    })

    // Get exercises
    const exercises = await prisma.exercise.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    })

    // Format data for charts - aggregate transactions by date
    const transactionMap = new Map<string, { income: number; expense: number }>()
    transactions.forEach((t) => {
      const dateKey = t.date.toISOString().split('T')[0]
      const existing = transactionMap.get(dateKey) || { income: 0, expense: 0 }
      if (t.type === 'income') {
        existing.income += t.amount
      } else {
        existing.expense += t.amount
      }
      transactionMap.set(dateKey, existing)
    })
    const transactionData = Array.from(transactionMap.entries())
      .map(([date, values]) => ({
        date,
        income: values.income,
        expense: values.expense,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const habitData = habits.map((h) => ({
      name: h.name,
      completions: h.completions.length,
      streak: h.streak,
    }))

    // Aggregate exercises by date
    const exerciseMap = new Map<string, { duration: number; calories: number }>()
    exercises.forEach((e) => {
      const dateKey = e.date.toISOString().split('T')[0]
      const existing = exerciseMap.get(dateKey) || { duration: 0, calories: 0 }
      existing.duration += e.duration || 0
      existing.calories += e.calories || 0
      exerciseMap.set(dateKey, existing)
    })
    const exerciseData = Array.from(exerciseMap.entries())
      .map(([date, values]) => ({
        date,
        duration: values.duration,
        calories: values.calories,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      transactions: transactionData,
      habits: habitData,
      exercises: exerciseData,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

