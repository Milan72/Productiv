import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { discoverConnected: true, discoverLastSync: true },
    })

    if (!user?.discoverConnected) {
      return NextResponse.json(
        { error: 'Discover account not connected' },
        { status: 400 }
      )
    }

    // In a real implementation, you would:
    // 1. Call Discover API to fetch transactions since last sync
    // 2. Parse and import transactions
    // 3. Update user's last sync time

    // Simulated sync for now
    const lastSync = user.discoverLastSync || new Date()
    const now = new Date()

    // Simulate fetching new transactions (in production, call actual API)
    // For demonstration, we'll just update the sync time
    await prisma.user.update({
      where: { id: userId },
      data: { discoverLastSync: now },
    })

    return NextResponse.json({
      message: 'Sync completed',
      lastSync: now,
      transactionsImported: 0, // In real implementation, return actual count
      note: 'Auto-sync is simulated. Configure Discover API credentials for real integration.',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

