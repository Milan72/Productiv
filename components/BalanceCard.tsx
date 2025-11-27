import { DollarSign, TrendingUp } from 'lucide-react'

interface BalanceCardProps {
  balance: string
}

export default function BalanceCard({ balance }: BalanceCardProps) {
  const balanceNum = parseFloat(balance)
  const isPositive = balanceNum >= 0

  return (
    <div className="bg-[#252a3a] rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-gray-400 text-sm">Total Balance</h3>
        <DollarSign className="w-8 h-8 text-yellow-400" />
      </div>
      <div className="mb-2">
        <div className="text-3xl font-bold text-yellow-400 mb-1">
          ${parseFloat(balance).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
        <div className="text-gray-400 text-sm mb-2">All accounts</div>
        {isPositive && (
          <div className="flex items-center gap-1 text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Positive</span>
          </div>
        )}
      </div>
    </div>
  )
}

