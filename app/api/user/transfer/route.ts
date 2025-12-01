import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'
import { z } from 'zod'

const transferSchema = z.object({
  amount: z.number().positive(),
  from: z.enum(['cash', 'bank']),
  to: z.enum(['cash', 'bank']),
})

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, from, to } = transferSchema.parse(body)

    if (from === to) {
      return NextResponse.json(
        { error: 'Cannot transfer to the same account' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { cashBalance: true, bankBalance: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const fromBalance = from === 'cash' ? user.cashBalance : user.bankBalance

    if (fromBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient funds' },
        { status: 400 }
      )
    }

    // Perform the transfer
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        cashBalance:
          from === 'cash'
            ? user.cashBalance - amount
            : user.cashBalance + amount,
        bankBalance:
          from === 'bank'
            ? user.bankBalance - amount
            : user.bankBalance + amount,
      },
      select: { cashBalance: true, bankBalance: true },
    })

    return NextResponse.json({
      message: 'Transfer successful',
      cashBalance: updatedUser.cashBalance,
      bankBalance: updatedUser.bankBalance,
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

