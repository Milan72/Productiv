'use client'

import { useEffect, useState } from 'react'
import AuthLayout from '@/components/AuthLayout'
import { Plus, CheckSquare, Trash2, Calendar, Flame, BarChart3 } from 'lucide-react'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'

interface Habit {
  id: string
  name: string
  description: string | null
  frequency: string
  streak: number
  completions: Array<{
    date: string
  }>
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
  })

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    fetchHabits()
  }, [])

  async function fetchHabits() {
    try {
      const response = await fetch('/api/habits')
      if (response.ok) {
        const data = await response.json()
        setHabits(data.habits)
      }
    } catch (error) {
      console.error('Failed to fetch habits:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setShowForm(false)
        setFormData({ name: '', description: '', frequency: 'daily' })
        fetchHabits()
      }
    } catch (error) {
      console.error('Failed to create habit:', error)
    }
  }

  async function handleComplete(id: string) {
    try {
      await fetch(`/api/habits/${id}/complete`, { method: 'POST' })
      fetchHabits()
    } catch (error) {
      console.error('Failed to complete habit:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this habit?')) return
    try {
      await fetch(`/api/habits/${id}`, { method: 'DELETE' })
      fetchHabits()
    } catch (error) {
      console.error('Failed to delete habit:', error)
    }
  }

  function isHabitCompletedOnDate(habit: Habit, date: Date): boolean {
    return habit.completions.some((completion) =>
      isSameDay(new Date(completion.date), date)
    )
  }

  function getMonthlyCompletionRate(habit: Habit): number {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthCompletions = habit.completions.filter(
      (c) => new Date(c.date) >= monthStart
    )
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    return Math.round((monthCompletions.length / daysInMonth) * 100)
  }

  const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0
  const completedToday = habits.filter((h) =>
    isHabitCompletedOnDate(h, new Date())
  ).length
  const monthlyRate = habits.length > 0
    ? Math.round(
        habits.reduce((sum, h) => sum + getMonthlyCompletionRate(h), 0) /
          habits.length
      )
    : 0

  const habitIcons: Record<string, { icon: string; color: string }> = {
    'Morning Meditation': { icon: '🧘', color: 'yellow' },
    'Read 30 Minutes': { icon: '📚', color: 'teal' },
    'Physical Exercise': { icon: '💪', color: 'yellow' },
  }

  return (
    <AuthLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Habits</h1>
            <p className="text-gray-400">Build consistency, one day at a time</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Habit
          </button>
        </div>

        {/* This Week Calendar */}
        <div className="bg-[#252a3a] rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">This Week</h2>
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex gap-4">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDate)
              const dayCompletions = habits.filter((h) =>
                isHabitCompletedOnDate(h, day)
              ).length

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className="flex-1 text-center"
                >
                  <div className="text-gray-400 text-xs mb-1">
                    {format(day, 'EEE')}
                  </div>
                  <div
                    className={`w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center text-sm font-medium ${
                      isSelected
                        ? 'bg-purple-500 text-white'
                        : dayCompletions > 0
                        ? 'bg-teal-500 text-white'
                        : 'text-white'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="flex justify-center gap-1">
                    {Array.from({ length: Math.min(dayCompletions, 3) }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 rounded-full ${
                          isSelected ? 'bg-purple-400' : 'bg-teal-400'
                        }`}
                      />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Your Habits */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Your Habits</h2>
          </div>
          {loading ? (
            <div className="text-white">Loading...</div>
          ) : habits.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No habits yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {habits.map((habit) => {
                const monthlyRate = getMonthlyCompletionRate(habit)
                const habitIcon = habitIcons[habit.name] || { icon: '✓', color: 'yellow' }
                const isSelected = false // You can add selection logic

                return (
                  <div
                    key={habit.id}
                    className={`bg-[#252a3a] rounded-2xl p-6 hover:bg-[#2a3042] transition-colors ${
                      isSelected ? 'border-2 border-yellow-400' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{habitIcon.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">
                          {habit.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-yellow-400 flex items-center gap-1">
                            <Flame className="w-4 h-4" />
                            {habit.streak} day streak
                          </span>
                          <span className="text-gray-400">
                            {monthlyRate}% this month
                          </span>
                        </div>
                      </div>
                      <div className="relative w-16 h-16">
                        <svg className="transform -rotate-90 w-16 h-16">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#374151"
                            strokeWidth="4"
                            fill="none"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#a855f7"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={2 * Math.PI * 28}
                            strokeDashoffset={
                              2 * Math.PI * 28 * (1 - monthlyRate / 100)
                            }
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {monthlyRate}%
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(habit.id)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#252a3a] rounded-2xl p-6 text-center">
            <Flame className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">{bestStreak}</div>
            <div className="text-gray-400 text-sm">Best Streak</div>
          </div>
          <div className="bg-[#252a3a] rounded-2xl p-6 text-center">
            <CheckSquare className="w-6 h-6 text-white mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">{completedToday}</div>
            <div className="text-gray-400 text-sm">Completed Today</div>
          </div>
          <div className="bg-[#252a3a] rounded-2xl p-6 text-center">
            <BarChart3 className="w-6 h-6 text-white mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">{monthlyRate}%</div>
            <div className="text-gray-400 text-sm">Monthly Rate</div>
          </div>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>

        {/* Add Habit Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#252a3a] rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-white mb-4">New Habit</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Habit Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                  className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg flex-1"
                  >
                    Create Habit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
