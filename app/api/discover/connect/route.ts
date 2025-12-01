import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In a real implementation, you would:
    // 1. Redirect user to Discover OAuth flow
    // 2. Store OAuth tokens securely
    // 3. Set up webhooks for real-time updates

    // For now, we'll simulate the connection
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        discoverConnected: true,
        discoverLastSync: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Connected to Discover',
      connected: true,
      lastSync: user.discoverLastSync,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        discoverConnected: false,
        discoverLastSync: null,
      },
    })

    return NextResponse.json({
      message: 'Disconnected from Discover',
      connected: false,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { discoverConnected: true, discoverLastSync: true },
    })

    return NextResponse.json({
      connected: user?.discoverConnected || false,
      lastSync: user?.discoverLastSync,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

