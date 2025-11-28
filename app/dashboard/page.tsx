'use client'

import { useEffect, useState } from 'react'
import AuthLayout from '@/components/AuthLayout'
import PerformanceCard from '@/components/PerformanceCard'
import BalanceCard from '@/components/BalanceCard'
import BudgetCard from '@/components/BudgetCard'
import PriorityItem from '@/components/PriorityItem'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { User, Briefcase, Heart, LineChart, Plus, DollarSign, Target, Calendar, BookOpen } from 'lucide-react'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function getFormattedDate() {
  const date = new Date()
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }
  return date.toLocaleDateString('en-US', options)
}

interface DashboardStats {
  performance: number
  balance: string
  monthlyBudget: {
    spent: string
    total: string
    percentage: number
  }
  priorities: Array<{
    id: string
    title: string
    completed: boolean
  }>
}

interface Habit {
  id: string
  name: string
  streak: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchHabits()
  }, [])

  async function fetchStats() {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchHabits() {
    try {
      const response = await fetch('/api/habits')
      if (response.ok) {
        const data = await response.json()
        setHabits(data.habits.slice(0, 3)) // Get top 3 habits
      }
    } catch (error) {
      console.error('Failed to fetch habits:', error)
    }
  }

  if (loading) {
    return (
      <AuthLayout>
        <div className="p-8">
          <div className="text-white">Loading...</div>
        </div>
      </AuthLayout>
    )
  }

  const defaultHabits = [
    { name: 'Morning Meditation', streak: 7, icon: '🧘', color: 'yellow' },
    { name: 'Read 30 Minutes', streak: 12, icon: '📚', color: 'default' },
    { name: 'Physical Exercise', streak: 15, icon: '💪', color: 'yellow' },
  ]

  const budgetCategories = [
    { name: 'Personal', icon: User, color: 'purple', spent: 1450, budget: 2000 },
    { name: 'Business', icon: Briefcase, color: 'brown', spent: 3200, budget: 5000 },
    { name: 'Charity', icon: Heart, color: 'pink', spent: 350, budget: 500 },
    { name: 'Investments', icon: LineChart, color: 'blue', spent: 2800, budget: 3000 },
  ]

  return (
    <AuthLayout>
      <div className="p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            {getGreeting()}, {user?.name || 'User'}
          </h1>
          <p className="text-gray-300 text-base">{getFormattedDate()}</p>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <PerformanceCard
            percentage={stats?.performance || 0}
            label={
              stats && stats.performance >= 80
                ? 'Excellent discipline'
                : stats && stats.performance >= 50
                ? 'Good progress'
                : 'Keep going'
            }
          />
          <BalanceCard balance={stats?.balance || '0.00'} />
          <BudgetCard
            percentage={stats?.monthlyBudget.percentage || 0}
            spent={stats?.monthlyBudget.spent || '0.00'}
            total={stats?.monthlyBudget.total || '0.00'}
          />
        </div>

        {/* Today's Priorities */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              Today&apos;s Priorities
            </h2>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              View All &gt;
            </button>
          </div>
          <div className="space-y-3">
            {stats?.priorities && stats.priorities.length > 0 ? (
              stats.priorities.map((priority) => (
                <PriorityItem
                  key={priority.id}
                  id={priority.id}
                  text={priority.title}
                  completed={priority.completed}
                  onToggle={fetchStats}
                />
              ))
            ) : (
              <div className="text-gray-400 text-center py-8">
                No priorities set for today
              </div>
            )}
          </div>
        </div>

        {/* Rockefeller Discipline */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              Rockefeller Discipline
            </h2>
            <button
              onClick={() => router.push('/habits')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              View All &gt;
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {defaultHabits.map((habit, index) => {
              const progress = Math.min(70 + index * 10, 95)
              return (
                <div
                  key={habit.name}
                  className={`bg-[#252a3a] rounded-2xl p-6 ${
                    habit.color === 'yellow' ? 'border-2 border-yellow-400' : ''
                  }`}
                >
                  <div className="text-4xl mb-3">{habit.icon}</div>
                  <h3 className="text-white font-semibold mb-2">{habit.name}</h3>
                  <div className="text-yellow-400 text-sm mb-3">
                    🔥 {habit.streak} day streak
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Ledger Snapshot */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Ledger Snapshot</h2>
            <button
              onClick={() => router.push('/ledger')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              View Details &gt;
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {budgetCategories.map((category) => {
              const Icon = category.icon
              const percentage = Math.round((category.spent / category.budget) * 100)
              const isOverBudget = percentage >= 90

              return (
                <div key={category.name} className="bg-[#252a3a] rounded-2xl p-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                    category.color === 'purple' ? 'bg-purple-500/20' :
                    category.color === 'brown' ? 'bg-amber-700/20' :
                    category.color === 'pink' ? 'bg-pink-500/20' :
                    'bg-blue-500/20'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      category.color === 'purple' ? 'text-purple-400' :
                      category.color === 'brown' ? 'text-amber-600' :
                      category.color === 'pink' ? 'text-pink-400' :
                      'text-blue-400'
                    }`} />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{category.name}</h3>
                  <div className="text-gray-400 text-sm mb-3">
                    ${category.spent.toLocaleString()} of ${category.budget.toLocaleString()}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${
                        isOverBudget ? 'bg-red-400' : 'bg-yellow-400'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/daily-log')}
              className="bg-[#252a3a] rounded-2xl p-6 hover:bg-[#2a3042] transition-colors text-center"
            >
              <Plus className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-white text-sm font-medium">Daily Entry</div>
            </button>
            <button
              onClick={() => router.push('/ledger')}
              className="bg-[#252a3a] rounded-2xl p-6 hover:bg-[#2a3042] transition-colors text-center"
            >
              <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-white text-sm font-medium">Add Transaction</div>
            </button>
            <button
              onClick={() => router.push('/goals')}
              className="bg-[#252a3a] rounded-2xl p-6 hover:bg-[#2a3042] transition-colors text-center"
            >
              <Target className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-white text-sm font-medium">Review Goals</div>
            </button>
            <button
              onClick={() => router.push('/weekly-review')}
              className="bg-[#252a3a] rounded-2xl p-6 hover:bg-[#2a3042] transition-colors text-center"
            >
              <Calendar className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-white text-sm font-medium">Weekly Review</div>
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
