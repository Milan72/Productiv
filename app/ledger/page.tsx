'use client'

import { useEffect, useState } from 'react'
import AuthLayout from '@/components/AuthLayout'
import { Plus, DollarSign, ArrowUp, ArrowDown, Trash2, ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, User, Briefcase, Heart, LineChart } from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  category: string
  description: string | null
  date: string
}

interface BudgetCategory {
  id: string
  name: string
  budget: number
  spent: number
}

export default function LedgerPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    incomeChange: 0,
  })
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchData()
  }, [currentDate, selectedPeriod])

  async function fetchData() {
    try {
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      const response = await fetch(`/api/transactions?month=${month}&year=${year}`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions)
        setSummary({
          ...data.summary,
          incomeChange: 12.5, // Mock data
        })
      }

      const budgetResponse = await fetch('/api/budget-categories')
      if (budgetResponse.ok) {
        const budgetData = await budgetResponse.json()
        setBudgetCategories(budgetData.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      })
      if (response.ok) {
        setShowForm(false)
        setFormData({
          amount: '',
          type: 'expense',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
        })
        fetchData()
      }
    } catch (error) {
      console.error('Failed to create transaction:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Failed to delete transaction:', error)
    }
  }

  function getMonthYearString() {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  function navigateMonth(direction: 'prev' | 'next') {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const budgetPercentage = summary.totalExpenses > 0 && budgetCategories.length > 0
    ? Math.round((summary.totalExpenses / budgetCategories.reduce((sum, cat) => sum + cat.budget, 0)) * 100)
    : 0

  const defaultCategories = [
    { name: 'Personal', icon: User, color: 'purple', budget: 2000, spent: 1450 },
    { name: 'Business', icon: Briefcase, color: 'brown', budget: 5000, spent: 3200 },
    { name: 'Charity', icon: Heart, color: 'pink', budget: 500, spent: 350 },
    { name: 'Investments', icon: LineChart, color: 'blue', budget: 3000, spent: 2800 },
  ]

  return (
    <AuthLayout>
      <div className="p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Financial Ledger</h1>
            <p className="text-gray-400">Rockefeller-style penny accuracy</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>

        {/* Date Navigation */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="bg-[#252a3a] rounded-xl px-4 py-2 flex items-center justify-between sm:justify-start gap-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-white font-medium">{getMonthYearString()}</span>
              <button
                onClick={() => navigateMonth('next')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2">
              {(['day', 'week', 'month'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-yellow-400 text-white'
                      : 'bg-[#252a3a] text-gray-300 hover:text-white'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-[#252a3a] rounded-2xl p-6 relative">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-gray-400 text-sm mb-2">Total Income</div>
                <div className="text-3xl font-bold text-green-400">
                  ${summary.totalIncome.toFixed(2)}
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  +{summary.incomeChange}% from last month
                </div>
              </div>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="bg-[#252a3a] rounded-2xl p-6 relative">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-gray-400 text-sm mb-2">Total Expenses</div>
                <div className="text-3xl font-bold text-red-400">
                  ${summary.totalExpenses.toFixed(2)}
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  {budgetPercentage}% of budget
                </div>
              </div>
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <div className="bg-[#252a3a] rounded-2xl p-6 relative">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-gray-400 text-sm mb-2">Net Position</div>
                <div className="text-3xl font-bold text-yellow-400">
                  ${summary.balance.toFixed(2)}
                </div>
                <div className="text-gray-400 text-sm mt-2">Available funds</div>
              </div>
              <LineChart className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Budget Breakdown */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Budget Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {defaultCategories.map((category) => {
              const Icon = category.icon
              const percentage = Math.round((category.spent / category.budget) * 100)
              const isOverBudget = percentage >= 90

              return (
                <div key={category.name} className="bg-[#252a3a] rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
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
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{category.name}</h3>
                      <div className="text-gray-400 text-sm">
                        ${category.spent.toLocaleString()} / ${category.budget.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full ${
                          isOverBudget ? 'bg-red-400' : 'bg-yellow-400'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-white text-sm font-medium">{percentage}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Recent Transactions</h2>
            <button className="text-gray-400 hover:text-white text-sm transition-colors">
              View All &gt;
            </button>
          </div>
          {loading ? (
            <div className="text-white">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-[#252a3a] rounded-xl p-4 hover:bg-[#2a3042] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income'
                            ? 'bg-green-500/20'
                            : 'bg-red-500/20'
                        }`}
                      >
                        {transaction.type === 'income' ? (
                          <ArrowUp className="w-5 h-5 text-green-400" />
                        ) : (
                          <ArrowDown className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-white font-medium">
                            {transaction.category}
                          </h3>
                          <span className="text-gray-500 text-sm">
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                        </div>
                        {transaction.description && (
                          <p className="text-gray-400 text-sm mt-1">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          transaction.type === 'income'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}$
                        {transaction.amount.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-400 hover:text-red-300 p-2 ml-4"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Transaction Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#252a3a] rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-white mb-4">Add Transaction</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                    className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  />
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as 'income' | 'expense',
                      })
                    }
                    className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
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
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg flex-1"
                  >
                    Add Transaction
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
