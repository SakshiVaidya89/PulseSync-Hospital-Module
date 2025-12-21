"use client"

interface DoctorCardProps {
  id: number
  name: string
  specialty: string
  rating: number
  patients: number
  avatar: string
  status: "available" | "busy" | "offline"
  onSelect?: () => void
}

export default function DoctorCard({ name, specialty, rating, patients, avatar, status, onSelect }: DoctorCardProps) {
  const statusColor = {
    available: "bg-green-100 text-green-700",
    busy: "bg-yellow-100 text-yellow-700",
    offline: "bg-gray-100 text-gray-700",
  }

  return (
    <div
      onClick={onSelect}
      className="bg-white p-6 rounded-2xl shadow-lg border-2 border-sky-100 hover:border-sky-300 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-sky-300 to-cyan-300 rounded-xl flex items-center justify-center text-2xl font-bold text-white">
          {avatar}
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1">{name}</h3>
      <p className="text-sm text-slate-600 mb-3">{specialty}</p>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <span>⭐</span>
          <span className="font-semibold text-slate-700">{rating}/5.0</span>
        </div>
        <div className="text-slate-600">{patients} patients</div>
      </div>
    </div>
  )
}
