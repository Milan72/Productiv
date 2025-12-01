'use client'

import { useEffect, useState } from 'react'
import AuthLayout from '@/components/AuthLayout'
import { Plus, DollarSign, ArrowUp, ArrowDown, Trash2, ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, User, Briefcase, Heart, LineChart, Edit2, Save, X } from 'lucide-react'

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
    startingBalance: 0,
  })
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingStartingBalance, setEditingStartingBalance] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [categoryEditData, setCategoryEditData] = useState<Record<string, { name: string; budget: number }>>({})
  const [startingBalanceValue, setStartingBalanceValue] = useState('0')
  const [monthlyBudgetValue, setMonthlyBudgetValue] = useState('0')
  const [editingMonthlyBudget, setEditingMonthlyBudget] = useState(false)
  const [showImportForm, setShowImportForm] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [cashBalance, setCashBalance] = useState('0')
  const [bankBalance, setBankBalance] = useState('0')
  const [editingCash, setEditingCash] = useState(false)
  const [editingBank, setEditingBank] = useState(false)
  const [showTransferForm, setShowTransferForm] = useState(false)
  const [transferAmount, setTransferAmount] = useState('')
  const [transferFrom, setTransferFrom] = useState<'cash' | 'bank'>('cash')
  const [discoverConnected, setDiscoverConnected] = useState(false)
  const [discoverLastSync, setDiscoverLastSync] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
    fetchStartingBalance()
    fetchMonthlyBudget()
    fetchBalances()
    fetchDiscoverStatus()
    ensureDefaultCategories()
  }, [currentDate, selectedPeriod])

  async function ensureDefaultCategories() {
    const defaultCats = ['Personal', 'Business', 'Charity', 'Investments']
    for (const catName of defaultCats) {
      try {
        const response = await fetch('/api/budget-categories')
        const data = await response.json()
        const exists = data.categories?.some((c: BudgetCategory) => c.name === catName)
        
        if (!exists) {
          await fetch('/api/budget-categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: catName, budget: 0 }),
          })
        }
      } catch (error) {
        console.error('Failed to create category:', error)
      }
    }
  }

  async function fetchStartingBalance() {
    try {
      const response = await fetch('/api/user/starting-balance')
      if (response.ok) {
        const data = await response.json()
        setStartingBalanceValue(data.startingBalance.toString())
      }
    } catch (error) {
      console.error('Failed to fetch starting balance:', error)
    }
  }

  async function updateStartingBalance() {
    try {
      const response = await fetch('/api/user/starting-balance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startingBalance: parseFloat(startingBalanceValue) }),
      })
      if (response.ok) {
        setEditingStartingBalance(false)
        fetchData()
      }
    } catch (error) {
      console.error('Failed to update starting balance:', error)
    }
  }

  async function fetchMonthlyBudget() {
    try {
      const response = await fetch('/api/user/monthly-budget')
      if (response.ok) {
        const data = await response.json()
        setMonthlyBudgetValue(data.monthlyBudget.toString())
      }
    } catch (error) {
      console.error('Failed to fetch monthly budget:', error)
    }
  }

  async function updateMonthlyBudget() {
    try {
      const response = await fetch('/api/user/monthly-budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyBudget: parseFloat(monthlyBudgetValue) }),
      })
      if (response.ok) {
        setEditingMonthlyBudget(false)
        fetchData()
      }
    } catch (error) {
      console.error('Failed to update monthly budget:', error)
    }
  }

  async function fetchBalances() {
    try {
      const response = await fetch('/api/user/balances')
      if (response.ok) {
        const data = await response.json()
        setCashBalance(data.cashBalance.toString())
        setBankBalance(data.bankBalance.toString())
      }
    } catch (error) {
      console.error('Failed to fetch balances:', error)
    }
  }

  async function updateBalance(type: 'cash' | 'bank', value: string) {
    try {
      const response = await fetch('/api/user/balances', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [type === 'cash' ? 'cashBalance' : 'bankBalance']: parseFloat(value),
        }),
      })
      if (response.ok) {
        if (type === 'cash') setEditingCash(false)
        else setEditingBank(false)
        fetchBalances()
      }
    } catch (error) {
      console.error('Failed to update balance:', error)
    }
  }

  async function handleTransfer() {
    if (!transferAmount || parseFloat(transferAmount) <= 0) return

    try {
      const response = await fetch('/api/user/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(transferAmount),
          from: transferFrom,
          to: transferFrom === 'cash' ? 'bank' : 'cash',
        }),
      })

      if (response.ok) {
        alert('Transfer successful!')
        setShowTransferForm(false)
        setTransferAmount('')
        fetchBalances()
      } else {
        const error = await response.json()
        alert('Transfer failed: ' + error.error)
      }
    } catch (error) {
      console.error('Failed to transfer:', error)
      alert('Transfer failed. Please try again.')
    }
  }

  async function fetchDiscoverStatus() {
    try {
      const response = await fetch('/api/discover/connect')
      if (response.ok) {
        const data = await response.json()
        setDiscoverConnected(data.connected)
        setDiscoverLastSync(data.lastSync)
      }
    } catch (error) {
      console.error('Failed to fetch Discover status:', error)
    }
  }

  async function handleDiscoverConnect() {
    try {
      const response = await fetch('/api/discover/connect', {
        method: 'POST',
      })

      if (response.ok) {
        alert('Successfully connected to Discover!')
        fetchDiscoverStatus()
      }
    } catch (error) {
      console.error('Failed to connect to Discover:', error)
      alert('Failed to connect to Discover.')
    }
  }

  async function handleDiscoverSync() {
    try {
      const response = await fetch('/api/discover/sync', {
        method: 'POST',
      })

      if (response.ok) {
        alert('Sync completed!')
        fetchDiscoverStatus()
        fetchData()
      }
    } catch (error) {
      console.error('Failed to sync with Discover:', error)
      alert('Sync failed.')
    }
  }

  async function handleImportDiscover() {
    if (!importFile) return

    try {
      const fileContent = await importFile.text()
      let transactions = []

      // Try to parse as JSON first
      try {
        const jsonData = JSON.parse(fileContent)
        transactions = Array.isArray(jsonData) ? jsonData : jsonData.transactions
      } catch {
        // If JSON parsing fails, try CSV
        const lines = fileContent.split('\n')
        const headers = lines[0].split(',')
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue
          const values = lines[i].split(',')
          const transaction: any = {}
          
          headers.forEach((header, index) => {
            transaction[header.trim().toLowerCase()] = values[index]?.trim()
          })
          
          transactions.push({
            amount: parseFloat(transaction.amount || transaction.debit || transaction.credit),
            description: transaction.description || transaction.merchant || transaction.desc,
            date: transaction.date || transaction['trans. date'] || transaction['post date'],
            category: transaction.category || 'Discover Import',
          })
        }
      }

      const response = await fetch('/api/discover/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions }),
      })

      if (response.ok) {
        alert('Transactions imported successfully!')
        setShowImportForm(false)
        setImportFile(null)
        fetchData()
      } else {
        const error = await response.json()
        alert('Failed to import transactions: ' + JSON.stringify(error))
      }
    } catch (error) {
      console.error('Failed to import transactions:', error)
      alert('Failed to import transactions. Please check the file format.')
    }
  }

  async function fetchData() {
    try {
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      const response = await fetch(`/api/transactions?month=${month}&year=${year}`)
      let transactionData: any = null
      
      if (response.ok) {
        transactionData = await response.json()
        setTransactions(transactionData.transactions)
        setSummary({
          ...transactionData.summary,
          incomeChange: 12.5, // Mock data
        })
      }

      const budgetResponse = await fetch('/api/budget-categories')
      if (budgetResponse.ok) {
        const budgetData = await budgetResponse.json()
        const categories = budgetData.categories || []
        
        // Calculate spent amount for each category from transactions
        const categoriesWithSpent = categories.map((cat: BudgetCategory) => {
          const spent = transactionData 
            ? transactionData.transactions
                .filter((t: Transaction) => t.type === 'expense' && t.category === cat.name)
                .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
            : 0
          return { ...cat, spent: spent || 0 }
        })
        
        setBudgetCategories(categoriesWithSpent)
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
      if (editingTransaction) {
        const response = await fetch(`/api/transactions/${editingTransaction}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            amount: parseFloat(formData.amount),
          }),
        })
        if (response.ok) {
          setEditingTransaction(null)
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
      } else {
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
      }
    } catch (error) {
      console.error('Failed to save transaction:', error)
    }
  }

  async function handleEditTransaction(transaction: Transaction) {
    setEditingTransaction(transaction.id)
    setFormData({
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      description: transaction.description || '',
      date: new Date(transaction.date).toISOString().split('T')[0],
    })
    setShowForm(true)
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

  async function handleUpdateCategory(categoryId: string) {
    const editData = categoryEditData[categoryId]
    if (!editData) return

    try {
      const response = await fetch(`/api/budget-categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      if (response.ok) {
        setEditingCategory(null)
        setCategoryEditData({})
        fetchData()
      }
    } catch (error) {
      console.error('Failed to update category:', error)
    }
  }

  function startEditingCategory(category: BudgetCategory) {
    setEditingCategory(category.id)
    setCategoryEditData({
      [category.id]: {
        name: category.name,
        budget: category.budget,
      },
    })
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

  const totalBudget = parseFloat(monthlyBudgetValue) > 0 
    ? parseFloat(monthlyBudgetValue)
    : budgetCategories.reduce((sum, cat) => sum + cat.budget, 0)
  
  const budgetPercentage = summary.totalExpenses > 0 && totalBudget > 0
    ? Math.round((summary.totalExpenses / totalBudget) * 100)
    : 0

  const categoryIcons: Record<string, { icon: any; color: string }> = {
    'Personal': { icon: User, color: 'purple' },
    'Business': { icon: Briefcase, color: 'brown' },
    'Charity': { icon: Heart, color: 'pink' },
    'Investments': { icon: LineChart, color: 'blue' },
  }

  // Use actual budget categories from database
  const allCategories = budgetCategories.map((cat) => ({
    ...cat,
    icon: categoryIcons[cat.name]?.icon || User,
    color: categoryIcons[cat.name]?.color || 'purple',
  }))

  return (
    <AuthLayout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Financial Ledger</h1>
            <p className="text-gray-400">Rockefeller-style penny accuracy</p>
          </div>
          <div className="flex gap-3 flex-col md:flex-row">
            {discoverConnected ? (
              <button
                onClick={handleDiscoverSync}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors w-full md:w-auto justify-center"
              >
                <ArrowDown className="w-5 h-5" />
                Sync Discover
              </button>
            ) : (
              <button
                onClick={handleDiscoverConnect}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors w-full md:w-auto justify-center"
              >
                <ArrowDown className="w-5 h-5" />
                Connect Discover
              </button>
            )}
            <button
              onClick={() => setShowImportForm(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors w-full md:w-auto justify-center"
            >
              <ArrowUp className="w-5 h-5" />
              Manual Import
            </button>
            <button
              onClick={() => {
                setEditingTransaction(null)
                setFormData({
                  amount: '',
                  type: 'expense',
                  category: '',
                  description: '',
                  date: new Date().toISOString().split('T')[0],
                })
                setShowForm(!showForm)
              }}
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors w-full md:w-auto justify-center"
            >
              <Plus className="w-5 h-5" />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Discover Status */}
        {discoverConnected && discoverLastSync && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">Discover Connected</span>
              <span className="text-gray-400 text-sm">
                Last synced: {new Date(discoverLastSync).toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleDiscoverSync}
              className="text-green-400 hover:text-green-300 text-sm underline"
            >
              Sync Now
            </button>
          </div>
        )}

        {/* Balances Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <div className="bg-[#252a3a] rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-gray-400 text-sm mb-2">Starting Balance</div>
                {editingStartingBalance ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={startingBalanceValue}
                      onChange={(e) => setStartingBalanceValue(e.target.value)}
                      className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-2 text-white text-xl font-bold w-48"
                    />
                    <button
                      onClick={updateStartingBalance}
                      className="p-2 bg-green-500 hover:bg-green-600 rounded-lg"
                    >
                      <Save className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingStartingBalance(false)
                        fetchStartingBalance()
                      }}
                      className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="text-2xl md:text-3xl font-bold text-yellow-400">
                      ${parseFloat(startingBalanceValue).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <button
                      onClick={() => setEditingStartingBalance(true)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#252a3a] rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-gray-400 text-sm mb-2">Monthly Budget</div>
                {editingMonthlyBudget ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={monthlyBudgetValue}
                      onChange={(e) => setMonthlyBudgetValue(e.target.value)}
                      className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-2 text-white text-xl font-bold w-48"
                    />
                    <button
                      onClick={updateMonthlyBudget}
                      className="p-2 bg-green-500 hover:bg-green-600 rounded-lg"
                    >
                      <Save className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingMonthlyBudget(false)
                        fetchMonthlyBudget()
                      }}
                      className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="text-2xl md:text-3xl font-bold text-green-400">
                      ${parseFloat(monthlyBudgetValue).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <button
                      onClick={() => setEditingMonthlyBudget(true)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#252a3a] rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-gray-400 text-sm mb-2">Cash Balance</div>
                {editingCash ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={cashBalance}
                      onChange={(e) => setCashBalance(e.target.value)}
                      className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-2 text-white text-xl font-bold w-48"
                    />
                    <button
                      onClick={() => updateBalance('cash', cashBalance)}
                      className="p-2 bg-green-500 hover:bg-green-600 rounded-lg"
                    >
                      <Save className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingCash(false)
                        fetchBalances()
                      }}
                      className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="text-2xl md:text-3xl font-bold text-blue-400">
                      ${parseFloat(cashBalance).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <button
                      onClick={() => setEditingCash(true)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#252a3a] rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-gray-400 text-sm mb-2">Bank Balance</div>
                {editingBank ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={bankBalance}
                      onChange={(e) => setBankBalance(e.target.value)}
                      className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-2 text-white text-xl font-bold w-48"
                    />
                    <button
                      onClick={() => updateBalance('bank', bankBalance)}
                      className="p-2 bg-green-500 hover:bg-green-600 rounded-lg"
                    >
                      <Save className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingBank(false)
                        fetchBalances()
                      }}
                      className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="text-2xl md:text-3xl font-bold text-purple-400">
                      ${parseFloat(bankBalance).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <button
                      onClick={() => setEditingBank(true)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowTransferForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
          >
            <ArrowUp className="w-5 h-5 rotate-90" />
            Transfer Between Accounts
          </button>
        </div>

        {/* Date Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-[#252a3a] rounded-xl px-4 py-2 flex items-center gap-4">
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
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-[#252a3a] rounded-2xl p-4 md:p-6 relative">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-gray-400 text-sm mb-2">Total Income</div>
                <div className="text-2xl md:text-3xl font-bold text-green-400">
                  ${summary.totalIncome.toFixed(2)}
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  +{summary.incomeChange}% from last month
                </div>
              </div>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="bg-[#252a3a] rounded-2xl p-4 md:p-6 relative">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-gray-400 text-sm mb-2">Total Expenses</div>
                <div className="text-2xl md:text-3xl font-bold text-red-400">
                  ${summary.totalExpenses.toFixed(2)}
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  {budgetPercentage}% of budget
                </div>
              </div>
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <div className="bg-[#252a3a] rounded-2xl p-4 md:p-6 relative">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-gray-400 text-sm mb-2">Net Position</div>
                <div className="text-2xl md:text-3xl font-bold text-yellow-400">
                  ${summary.balance.toFixed(2)}
                </div>
                <div className="text-gray-400 text-sm mt-2">Available funds</div>
              </div>
              <LineChart className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Budget Breakdown */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Budget Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allCategories.map((category) => {
              const Icon = category.icon || User
              const categoryId = category.id
              const percentage = category.budget > 0 ? Math.round((category.spent / category.budget) * 100) : 0
              const isOverBudget = percentage >= 90
              const isEditing = editingCategory === categoryId
              const editData = categoryEditData[categoryId] || { name: category.name, budget: category.budget }

              const categoryColor = category.color || 'purple'
              
              return (
                <div key={category.id} className="bg-[#252a3a] rounded-2xl p-4 md:p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      categoryColor === 'purple' ? 'bg-purple-500/20' :
                      categoryColor === 'brown' ? 'bg-amber-700/20' :
                      categoryColor === 'pink' ? 'bg-pink-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        categoryColor === 'purple' ? 'text-purple-400' :
                        categoryColor === 'brown' ? 'text-amber-600' :
                        categoryColor === 'pink' ? 'text-pink-400' :
                        'text-blue-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) =>
                              setCategoryEditData({
                                ...categoryEditData,
                                [categoryId]: { ...editData, name: e.target.value },
                              })
                            }
                            className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                          />
                          <input
                            type="number"
                            step="0.01"
                            value={editData.budget}
                            onChange={(e) =>
                              setCategoryEditData({
                                ...categoryEditData,
                                [categoryId]: { ...editData, budget: parseFloat(e.target.value) },
                              })
                            }
                            className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateCategory(categoryId)}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-white text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingCategory(null)
                                setCategoryEditData({})
                              }}
                              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-white font-semibold mb-1">{category.name}</h3>
                          <div className="text-gray-400 text-sm">
                            ${category.spent.toLocaleString()} / ${category.budget.toLocaleString()}
                          </div>
                        </>
                      )}
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => startEditingCategory(category)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                  {!isEditing && (
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
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white">Recent Transactions</h2>
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-white font-medium">
                            {transaction.category}
                          </h3>
                          <span className="text-gray-500 text-sm">
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                        </div>
                        {transaction.description && (
                          <p className="text-gray-400 text-sm mt-1 truncate">
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
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditTransaction(transaction)}
                        className="text-blue-400 hover:text-blue-300 p-2"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Transaction Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#252a3a] rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
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
                    {editingTransaction ? 'Update' : 'Add'} Transaction
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingTransaction(null)
                      setFormData({
                        amount: '',
                        type: 'expense',
                        category: '',
                        description: '',
                        date: new Date().toISOString().split('T')[0],
                      })
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Import from Discover Form */}
        {showImportForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#252a3a] rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">
                Import Transactions from Discover
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-4">
                    Upload a CSV or JSON file exported from your Discover account.
                  </p>
                  <div className="bg-[#1e2332] border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".csv,.json"
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <ArrowUp className="w-8 h-8 text-gray-400" />
                      <span className="text-white font-medium">
                        {importFile ? importFile.name : 'Choose a file'}
                      </span>
                      <span className="text-gray-500 text-sm">CSV or JSON format</span>
                    </label>
                  </div>
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      <strong>CSV Format:</strong> Headers should include: amount, description, date, category
                      <br />
                      <strong>JSON Format:</strong> Array of objects with the same fields
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleImportDiscover}
                    disabled={!importFile}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg flex-1 transition-colors"
                  >
                    Import Transactions
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportForm(false)
                      setImportFile(null)
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Form */}
        {showTransferForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#252a3a] rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">
                Transfer Between Accounts
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Transfer From</label>
                  <select
                    value={transferFrom}
                    onChange={(e) => setTransferFrom(e.target.value as 'cash' | 'bank')}
                    className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="cash">Cash ({`$${parseFloat(cashBalance).toFixed(2)}`})</option>
                    <option value="bank">Bank ({`$${parseFloat(bankBalance).toFixed(2)}`})</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Transfer To</label>
                  <div className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white">
                    {transferFrom === 'cash' ? `Bank ($${parseFloat(bankBalance).toFixed(2)})` : `Cash ($${parseFloat(cashBalance).toFixed(2)})`}
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Enter amount"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-400 text-sm">
                    {transferAmount && parseFloat(transferAmount) > 0
                      ? `Transfer $${parseFloat(transferAmount).toFixed(2)} from ${transferFrom === 'cash' ? 'Cash' : 'Bank'} to ${transferFrom === 'cash' ? 'Bank' : 'Cash'}`
                      : 'Enter an amount to transfer'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleTransfer}
                    disabled={!transferAmount || parseFloat(transferAmount) <= 0}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg flex-1 transition-colors"
                  >
                    Transfer Funds
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTransferForm(false)
                      setTransferAmount('')
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
