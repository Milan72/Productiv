interface PerformanceCardProps {
  percentage: number
  label: string
}

export default function PerformanceCard({
  percentage,
  label,
}: PerformanceCardProps) {
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="bg-[#252a3a] rounded-2xl p-6 flex flex-col">
      <h3 className="text-gray-400 text-sm mb-6 w-full text-left">
        Today&apos;s Performance
      </h3>
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="#374151"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="#fbbf24"
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-white">{percentage}%</span>
        </div>
      </div>
      <p className="text-white text-sm text-center">{label}</p>
    </div>
  )
}

