"use client"

import { useState, useEffect } from "react"
import StatCard from "../components/StatCard"

interface DashboardProps {
  onNavigate: (page: string) => void
}

interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  status: string
}

interface TimeSlot {
  id: string
  time: string
  available: boolean
}

const API_BASE_URL = "http://localhost:5000/api"

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showStatusManager, setShowStatusManager] = useState(false)

  // Doctor Status Manager State
  const [status, setStatus] = useState<"available" | "busy">("available")
  const [availableFrom, setAvailableFrom] = useState("")
  const [availableUntil, setAvailableUntil] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: "1", time: "09:00 AM", available: true },
    { id: "2", time: "10:00 AM", available: true },
    { id: "3", time: "11:00 AM", available: true },
    { id: "4", time: "12:00 PM", available: true },
    { id: "5", time: "02:00 PM", available: true },
    { id: "6", time: "03:00 PM", available: true },
    { id: "7", time: "04:00 PM", available: true },
    { id: "8", time: "05:00 PM", available: true },
  ])
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    setIsVisible(true)
    if (!showStatusManager) {
      fetchDashboardData()
    }
  }, [showStatusManager])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token")
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/appointments/hospital/appointments`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        const todayApts = data.today || []
        setRecentAppointments(todayApts.slice(0, 4))
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSlotAvailability = (slotId: string) => {
    setTimeSlots((slots) => slots.map((slot) => (slot.id === slotId ? { ...slot, available: !slot.available } : slot)))
  }

  const handleSaveStatus = async () => {
    try {
      setIsSaving(true)
      setMessage(null)

      const availableSlots = timeSlots.filter((slot) => slot.available).map((slot) => slot.time)

      const response = await fetch(`${API_BASE_URL}/appointments/doctors/availability`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          available_from: availableFrom,
          available_until: availableUntil,
          date: selectedDate,
          slots: availableSlots,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update availability")
      }

      setMessage({ type: "success", text: "Availability updated successfully!" })
    } catch (err) {
      console.error("Error updating availability:", err)
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update availability",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const setAllSlots = (available: boolean) => {
    setTimeSlots((slots) => slots.map((slot) => ({ ...slot, available })))
  }

  if (showStatusManager) {
    return (
      <div className="flex flex-col gap-8 w-full bg-gradient-to-b from-sky-50 via-white to-cyan-50 px-5 md:px-10 py-12 font-['Inter',sans-serif]">
        {/* Back Button */}
        <button
          onClick={() => setShowStatusManager(false)}
          className="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-semibold transition-colors w-fit"
        >
          <span>←</span> Back to Dashboard
        </button>

        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-500 to-cyan-500 p-6">
              <h2 className="text-2xl font-bold text-white m-0">Availability Manager</h2>
              <p className="text-sky-50 text-sm mt-2 m-0">Set your status and manage your schedule</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Toggle */}
              <div className="bg-slate-50 rounded-xl p-5">
                <label className="text-sm font-semibold text-slate-700 block mb-3">Current Status</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStatus("available")}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      status === "available"
                        ? "bg-green-500 text-white shadow-md"
                        : "bg-white text-slate-600 border-2 border-slate-200 hover:border-green-500"
                    }`}
                  >
                    <span className="mr-2">✓</span>
                    Available
                  </button>
                  <button
                    onClick={() => setStatus("busy")}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      status === "busy"
                        ? "bg-red-500 text-white shadow-md"
                        : "bg-white text-slate-600 border-2 border-slate-200 hover:border-red-500"
                    }`}
                  >
                    <span className="mr-2">✕</span>
                    Busy
                  </button>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                />
              </div>

              {/* Availability Time Range */}
              {status === "busy" && (
                <div className="bg-amber-50 rounded-xl p-5 border-2 border-amber-200">
                  <label className="text-sm font-semibold text-amber-900 block mb-3">When will you be available?</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-amber-800 block mb-2">Available From</label>
                      <input
                        type="time"
                        value={availableFrom}
                        onChange={(e) => setAvailableFrom(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-amber-800 block mb-2">Available Until</label>
                      <input
                        type="time"
                        value={availableUntil}
                        onChange={(e) => setAvailableUntil(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Time Slots Management */}
              {status === "available" && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-semibold text-slate-700">Manage Time Slots</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAllSlots(true)}
                        className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 font-medium"
                      >
                        Enable All
                      </button>
                      <button
                        onClick={() => setAllSlots(false)}
                        className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 font-medium"
                      >
                        Disable All
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => toggleSlotAvailability(slot.id)}
                        className={`py-3 px-4 rounded-lg font-medium transition-all ${
                          slot.available
                            ? "bg-green-500 text-white shadow-md hover:bg-green-600"
                            : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                        }`}
                      >
                        <div className="text-xs mb-1">{slot.available ? "Available" : "Blocked"}</div>
                        <div className="font-semibold">{slot.time}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Display */}
              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800 border-2 border-green-200"
                      : "bg-red-50 text-red-800 border-2 border-red-200"
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t-2 border-slate-200">
                <button
                  onClick={handleSaveStatus}
                  disabled={isSaving || (status === "busy" && (!availableFrom || !availableUntil))}
                  className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isSaving ? "Saving..." : "Save Availability"}
                </button>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="mt-6 bg-sky-50 rounded-xl p-5 border-2 border-sky-200">
            <h3 className="text-sm font-semibold text-sky-900 mb-2 m-0">Current Settings Summary</h3>
            <div className="space-y-1 text-sm text-sky-800">
              <p className="m-0">
                Status:{" "}
                <span className={`font-semibold ${status === "available" ? "text-green-600" : "text-red-600"}`}>
                  {status.toUpperCase()}
                </span>
              </p>
              <p className="m-0">
                Date: <span className="font-semibold">{selectedDate}</span>
              </p>
              {status === "busy" && (availableFrom || availableUntil) && (
                <p className="m-0">
                  Next Available:{" "}
                  <span className="font-semibold">
                    {availableFrom || "Not set"} - {availableUntil || "Not set"}
                  </span>
                </p>
              )}
              {status === "available" && (
                <p className="m-0">
                  Available Slots:{" "}
                  <span className="font-semibold">
                    {timeSlots.filter((s) => s.available).length} of {timeSlots.length}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full bg-gradient-to-b from-sky-50 via-white to-cyan-50 px-5 md:px-10 py-12 font-['Inter',sans-serif]">
      {/* Header */}
      <div
        className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"}`}
      >
        <h1
          className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-sky-700 via-cyan-600 to-blue-700 bg-clip-text text-transparent mb-3"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Dashboard
        </h1>
        <p className="text-lg text-slate-700">Welcome to PulseSync Hospital Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* <div
          className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
        >
          <StatCard title="Total Doctors" value="48" icon="👨‍⚕️" color="sky" trend="2 new this month" />
        </div> */}
        <div
          className={`transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
        >
          <StatCard title="Patient Records" value="1,245" icon="👥" color="cyan" trend="156 new this week" />
        </div>
        <div
          className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
        >
          <StatCard title="Appointments" value="312" icon="��" color="blue" trend="85 today" />
        </div>
        <div
          className={`transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
        >
          <StatCard title="Lab Tests" value="527" icon="🔬" color="indigo" trend="42 pending" />
        </div>
      </div>

      {/* Doctor Availability Quick Access */}
      <div
        className={`bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-6 rounded-2xl shadow-lg transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🩺</div>
            <div>
              <h3 className="text-xl font-bold mb-1">Doctor Availability</h3>
              <p className="text-sm opacity-90">Manage your schedule and time slots</p>
            </div>
          </div>
          <button
            onClick={() => setShowStatusManager(true)}
            className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-all hover:-translate-y-0.5 shadow-lg"
          >
            Manage Availability →
          </button>
        </div>
      </div>

      {/* Recent Appointments */}
      <div
        className={`bg-white p-8 rounded-3xl shadow-xl border-2 border-sky-100/50 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>📅</span> {isLoading ? "Loading..." : "Today's Appointments"}
          </h2>
          <button
            onClick={() => onNavigate("appointments")}
            className="text-sky-600 hover:text-sky-700 font-semibold text-sm hover:underline"
          >
            View All
          </button>
        </div>

        <div className="space-y-4">
          {recentAppointments.length > 0 ? (
            recentAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-sky-50 transition-colors border border-slate-200"
              >
                <div>
                  <p className="font-semibold text-slate-900">Patient: {apt.patient_id}</p>
                  <p className="text-sm text-slate-600">
                    {apt.appointment_date} • {apt.appointment_time}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                    apt.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : apt.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No appointments scheduled for today</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => onNavigate("doctors")}
          className="bg-gradient-to-br from-sky-500 to-cyan-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1 group"
        >
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👨‍⚕️</div>
          <h3 className="text-xl font-bold mb-2">Manage Doctors</h3>
          <p className="text-sm opacity-90">Add, update, or manage doctor profiles</p>
        </div>

        <div
          onClick={() => onNavigate("patients")}
          className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1 group"
        >
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📋</div>
          <h3 className="text-xl font-bold mb-2">Patient Records</h3>
          <p className="text-sm opacity-90">View and manage electronic health records</p>
        </div>

        <div
          onClick={() => onNavigate("diagnostics")}
          className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1 group"
        >
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔬</div>
          <h3 className="text-xl font-bold mb-2">Diagnostics</h3>
          <p className="text-sm opacity-90">Manage lab tests and diagnostic results</p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>
    </div>
  )
}
