'use client'

import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  DollarSign,
  BookOpen,
  Dumbbell,
  Users,
  Calendar,
  Sparkles,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

const navigationItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Goals & OKRs', icon: Target, path: '/goals' },
  { name: 'Habits', icon: CheckSquare, path: '/habits' },
  { name: 'Ledger', icon: DollarSign, path: '/ledger' },
  { name: 'Daily Log', icon: BookOpen, path: '/daily-log' },
  { name: 'Exercise', icon: Dumbbell, path: '/exercise' },
  { name: 'Network', icon: Users, path: '/network' },
  { name: 'Weekly Review', icon: Calendar, path: '/weekly-review' },
  { name: 'AI Advisor', icon: Sparkles, path: '/ai-advisor' },
  { name: 'Profile', icon: User, path: '/profile' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <div className="w-64 bg-[#1a1f2e] h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">PO</span>
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Personal OS</div>
            <div className="text-gray-400 text-xs">{user?.name || 'User'}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-yellow-400 text-white'
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

