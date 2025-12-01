import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'
import { z } from 'zod'

// Schema for Discover transaction data
const discoverTransactionSchema = z.object({
  transactions: z.array(
    z.object({
      amount: z.number(),
      description: z.string(),
      date: z.string(),
      category: z.string().optional(),
    })
  ),
})

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { transactions } = discoverTransactionSchema.parse(body)

    // Import transactions from Discover
    const createdTransactions = await Promise.all(
      transactions.map(async (trans) => {
        return prisma.transaction.create({
          data: {
            amount: Math.abs(trans.amount),
            type: trans.amount < 0 ? 'expense' : 'income',
            category: trans.category || 'Discover Import',
            description: trans.description,
            date: new Date(trans.date),
            userId,
          },
        })
      })
    )

    return NextResponse.json({
      message: `${createdTransactions.length} transactions imported successfully`,
      transactions: createdTransactions,
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

// This endpoint can be used to fetch transactions from Discover API
// You'll need to add your Discover API credentials
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Implement Discover API integration
    // This is a placeholder. You'll need to:
    // 1. Add Discover API credentials to your .env file
    // 2. Implement the actual API call to Discover
    // 3. Transform the response to match your transaction format

    return NextResponse.json({
      message: 'Discover API integration pending',
      instructions:
        'Please use the POST endpoint to manually import transactions from a CSV or JSON file',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

