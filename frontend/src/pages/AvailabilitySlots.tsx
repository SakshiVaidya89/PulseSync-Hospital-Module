"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface AvailabilitySlotsProps {
  onNavigate: (page: string) => void
}

interface DoctorAvailability {
  id: string
  doctor_id: string
  doctor_name: string
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  is_available: boolean
  created_at: string
}

const API_BASE_URL = "http://localhost:5000/api"

export default function AvailabilitySlots({ onNavigate }: AvailabilitySlotsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [availabilities, setAvailabilities] = useState<DoctorAvailability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    doctor_id: "",
    date: "",
    start_time: "",
    end_time: "",
    duration_minutes: 30,
  })

  useEffect(() => {
    setIsVisible(true)
    const userId = localStorage.getItem("user_id")
    // Auto-fill doctor_id with the logged-in user's ID
    if (userId) {
      setFormData((prev) => ({
        ...prev,
        doctor_id: userId,
      }))
    }
    fetchAvailabilities()
  }, [])

  const fetchAvailabilities = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem("auth_token")
      const hospitalId = localStorage.getItem("user_id")

      const response = await fetch(`${API_BASE_URL}/availability/hospital/${hospitalId}/slots`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch availability slots")
      }

      const data = await response.json()
      setAvailabilities(data.availabilities || [])
    } catch (err) {
      console.error("[v0] Error fetching availabilities:", err)
      setError(err instanceof Error ? err.message : "Failed to load availability slots")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration_minutes" ? Number.parseInt(value) : value,
    }))
  }

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("auth_token")
      const userId = localStorage.getItem("user_id")
      
      const finalDoctorId = formData.doctor_id || userId
      
      if (!finalDoctorId) {
        setError("Doctor ID is required. Please ensure you are logged in properly.")
        return
      }

      const response = await fetch(`${API_BASE_URL}/availability/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          doctor_id: finalDoctorId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create availability slot")
      }

      setSuccessMessage("Availability slot created successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
      setFormData({
        doctor_id: "",
        date: "",
        start_time: "",
        end_time: "",
        duration_minutes: 30,
      })
      fetchAvailabilities()
    } catch (err) {
      console.error("[v0] Error creating availability:", err)
      setError(err instanceof Error ? err.message : "Failed to create availability slot")
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("auth_token")

      const response = await fetch(`${API_BASE_URL}/availability/${id}/toggle`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to update availability status")
      }

      setSuccessMessage(`Availability ${currentStatus ? "disabled" : "enabled"} successfully!`)
      setTimeout(() => setSuccessMessage(null), 3000)
      fetchAvailabilities()
    } catch (err) {
      console.error("[v0] Error updating availability:", err)
      setError(err instanceof Error ? err.message : "Failed to update availability status")
      setTimeout(() => setError(null), 5000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mb-4"></div>
          <p className="text-slate-600 font-medium">Loading availability slots...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full bg-gradient-to-b from-sky-50 via-white to-cyan-50 px-5 md:px-10 py-12 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="relative -mx-5 md:-mx-10 -mt-12 mb-8 bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-50 px-5 md:px-10 py-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute w-64 h-64 bg-sky-300/30 rounded-full blur-3xl -top-10 -right-10 animate-pulse"></div>
          <div
            className="absolute w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl -bottom-10 -left-10 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div
          className={`text-center relative z-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"}`}
        >
          <div className="inline-block px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sky-700 text-sm font-semibold mb-4 shadow-md">
            ⏰ Schedule Management
          </div>
          <h1
            className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-sky-700 via-cyan-600 to-blue-700 bg-clip-text text-transparent mb-4 leading-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Doctor Availability Slots
          </h1>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto font-medium">
            Manage doctor availability slots for patient appointments
          </p>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          <p className="font-medium">{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      {/* Form to Add Availability */}
      <div
        className={`bg-white p-8 rounded-3xl shadow-xl border-2 border-sky-100/50 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Add New Availability Slot
        </h2>
        <form onSubmit={handleAddAvailability} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Doctor ID</label>
              <input
                type="text"
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleInputChange}
                placeholder="Enter doctor ID"
                required
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time</label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                required
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">End Time</label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                required
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (minutes)</label>
              <select
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            Add Availability Slot
          </button>
        </form>
      </div>

      {/* Availability Slots List */}
      <div
        className={`space-y-4 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      >
        <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Current Availability Slots
        </h2>
        {availabilities.length > 0 ? (
          availabilities.map((slot) => (
            <div
              key={slot.id}
              className="bg-white p-6 rounded-2xl shadow-lg border-2 border-sky-100 hover:border-sky-300 transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Doctor: {slot.doctor_name || slot.doctor_id}
                  </h3>
                  <p className="text-sm text-slate-600">📅 Date: {new Date(slot.date).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-600">
                    ⏰ Time: {slot.start_time} - {slot.end_time}
                  </p>
                  <p className="text-sm text-slate-600">Duration: {slot.duration_minutes} minutes</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      slot.is_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {slot.is_available ? "Available" : "Unavailable"}
                  </span>
                  <button
                    onClick={() => handleToggleAvailability(slot.id, slot.is_available)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      slot.is_available
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-sky-100 text-sky-700 hover:bg-sky-200"
                    }`}
                  >
                    {slot.is_available ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 px-5 bg-white rounded-2xl shadow-md border border-slate-200 text-slate-500">
            <div className="text-5xl mb-3 opacity-50">⏰</div>
            <p className="text-lg font-medium">No availability slots created yet</p>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  )
}
