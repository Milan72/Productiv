import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'
import { z } from 'zod'

const balancesSchema = z.object({
  cashBalance: z.number().optional(),
  bankBalance: z.number().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { cashBalance: true, bankBalance: true },
    })

    return NextResponse.json({
      cashBalance: user?.cashBalance || 0,
      bankBalance: user?.bankBalance || 0,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = balancesSchema.parse(body)

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { cashBalance: true, bankBalance: true },
    })

    return NextResponse.json({
      cashBalance: user.cashBalance,
      bankBalance: user.bankBalance,
    })
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

