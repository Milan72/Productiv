'use client'

import { useEffect, useState } from 'react'
import AuthLayout from '@/components/AuthLayout'
import { useAuth } from '@/contexts/AuthContext'
import { User, LogOut } from 'lucide-react'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({
    goals: 0,
    habits: 0,
    transactions: 0,
    exercises: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const [goalsRes, habitsRes, transactionsRes, exercisesRes] =
        await Promise.all([
          fetch('/api/goals'),
          fetch('/api/habits'),
          fetch('/api/transactions'),
          fetch('/api/exercises'),
        ])

      const goals = goalsRes.ok ? (await goalsRes.json()).goals.length : 0
      const habits = habitsRes.ok ? (await habitsRes.json()).habits.length : 0
      const transactions = transactionsRes.ok
        ? (await transactionsRes.json()).transactions.length
        : 0
      const exercises = exercisesRes.ok
        ? (await exercisesRes.json()).exercises.length
        : 0

      setStats({ goals, habits, transactions, exercises })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  return (
    <AuthLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-400">Manage your account and view statistics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#252a3a] rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                  <p className="text-gray-400">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#252a3a] rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1e2332] rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Goals</div>
                  <div className="text-3xl font-bold text-yellow-400">
                    {stats.goals}
                  </div>
                </div>
                <div className="bg-[#1e2332] rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Habits</div>
                  <div className="text-3xl font-bold text-yellow-400">
                    {stats.habits}
                  </div>
                </div>
                <div className="bg-[#1e2332] rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Transactions</div>
                  <div className="text-3xl font-bold text-yellow-400">
                    {stats.transactions}
                  </div>
                </div>
                <div className="bg-[#1e2332] rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Exercises</div>
                  <div className="text-3xl font-bold text-yellow-400">
                    {stats.exercises}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#252a3a] rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Account</h3>
              <button
                onClick={logout}
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}



