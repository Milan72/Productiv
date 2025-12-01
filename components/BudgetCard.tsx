import { TrendingUp } from 'lucide-react'

interface BudgetCardProps {
  percentage: number
  spent: string
  total: string
}

export default function BudgetCard({
  percentage,
  spent,
  total,
}: BudgetCardProps) {
  return (
    <div className="bg-[#252a3a] rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-gray-400 text-sm">Monthly Budget</h3>
        <TrendingUp className="w-5 h-5 text-green-400" />
      </div>
      <div className="mb-2">
        <div className="text-2xl font-bold text-green-400 mb-1">
          {percentage}%
        </div>
        <div className="text-white text-sm">
          ${parseFloat(spent).toLocaleString()} of ${parseFloat(total).toLocaleString()}
        </div>
      </div>
    </div>
  )
}

