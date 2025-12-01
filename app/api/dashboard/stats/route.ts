import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get today's priorities
    const priorities = await prisma.priority.findMany({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    const completedPriorities = priorities.filter((p) => p.completed).length
    const totalPriorities = priorities.length
    const performancePercentage =
      totalPriorities > 0
        ? Math.round((completedPriorities / totalPriorities) * 100)
        : 0

    // Get total balance
    const transactions = await prisma.transaction.findMany({
      where: { userId },
    })

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    const balance = totalIncome - totalExpenses

    // Get monthly budget (assuming $10,500 budget for now)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthStart = new Date(currentYear, currentMonth, 1)
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)

    const monthlyExpenses = transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          t.date >= monthStart &&
          t.date <= monthEnd
      )
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyBudget = 10500
    const budgetPercentage = Math.round((monthlyExpenses / monthlyBudget) * 100)

    // Get today's priorities for display
    const todayPriorities = await prisma.priority.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })

    return NextResponse.json({
      performance: performancePercentage,
      balance: balance.toFixed(2),
      monthlyBudget: {
        spent: monthlyExpenses.toFixed(2),
        total: monthlyBudget.toFixed(2),
        percentage: budgetPercentage,
      },
      priorities: todayPriorities,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



