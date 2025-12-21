interface StatCardProps {
  title: string
  value: string | number
  icon: string
  trend?: string
  color: "sky" | "cyan" | "blue" | "indigo"
}

export default function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  const colorMap = {
    sky: "from-sky-500 to-cyan-500",
    cyan: "from-cyan-500 to-blue-500",
    blue: "from-blue-500 to-indigo-500",
    indigo: "from-indigo-500 to-purple-500",
  }

  return (
    <div
      className={`bg-gradient-to-br ${colorMap[color]} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm opacity-90 font-medium mb-2">{title}</p>
          <p className="text-4xl font-bold">{value}</p>
          {trend && <p className="text-xs mt-2 opacity-80">{trend}</p>}
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  )
}
