"use client"

import { useState, useEffect } from "react"
import { useNotification } from "../context/NotificationContext"

interface AppointmentManagementProps {
  onNavigate: (page: string) => void
}

interface PatientData {
  id: string
  name: string
  email: string
  phone: string
  blood_type: string
}

interface DoctorData {
  id: string
  name: string
  specialty: string
  email: string
}

interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  reason: string
  notes: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  patient_data?: PatientData
  doctor_data?: DoctorData
}

const API_BASE_URL = "http://localhost:5000/api"

export default function AppointmentManagement({ onNavigate }: AppointmentManagementProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const { addNotification, fetchAppointmentNotifications } = useNotification()

  useEffect(() => {
    setIsVisible(true)
    fetchAppointments()
  }, [])

  const fetchPatientData = async (patientId: string): Promise<PatientData | null> => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${API_BASE_URL}/auth/patient/${patientId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.log("[v0] Failed to fetch patient data")
        return null
      }

      const data = await response.json()
      return {
        id: data.id,
        name: data.full_name || "Unknown Patient",
        email: data.email || "N/A",
        phone: data.phone || "N/A",
        blood_type: data.blood_type || "N/A",
      }
    } catch (err) {
      console.error("[v0] Error fetching patient data:", err)
      return null
    }
  }

  const fetchDoctorData = async (doctorId: string): Promise<DoctorData | null> => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${API_BASE_URL}/auth/doctor/${doctorId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.log("[v0] Failed to fetch doctor data")
        return null
      }

      const data = await response.json()
      return {
        id: data.id,
        name: data.full_name || "Unknown Doctor",
        specialty: data.department || "General Practice",
        email: data.email || "N/A",
      }
    } catch (err) {
      console.error("[v0] Error fetching doctor data:", err)
      return null
    }
  }

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem("auth_token") || localStorage.getItem("token")

      if (!token) {
        setError("Authentication token not found. Please login again.")
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

      if (!response.ok) {
        throw new Error("Failed to fetch appointments")
      }

      const data = await response.json()
      const allAppointments = [...data.today, ...data.upcoming, ...data.past]

      const appointmentsWithData = await Promise.all(
        allAppointments.map(async (apt) => {
          const patientData = await fetchPatientData(apt.patient_id)
          const doctorData = await fetchDoctorData(apt.doctor_id)
          return {
            ...apt,
            patient_data: patientData,
            doctor_data: doctorData,
          }
        }),
      )

      setAppointments(appointmentsWithData)
      setTodayAppointments(data.today || [])

      if (data.today && data.today.length > 0) {
        addNotification({
          title: "Today's Appointments",
          message: `You have ${data.today.length} appointment${data.today.length !== 1 ? "s" : ""} scheduled for today`,
          type: "info",
        })
      }
    } catch (err) {
      console.error("[v0] Error fetching appointments:", err)
      setError(err instanceof Error ? err.message : "Failed to load appointments")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAppointments = appointments.filter(
    (apt) => apt.appointment_date === selectedDate && apt.status !== "cancelled",
  )

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const token = localStorage.getItem("auth_token")

      let endpoint = `${API_BASE_URL}/appointments/${appointmentId}`
      let method = "POST"
      let body: any = {}

      if (status === "confirmed") {
        endpoint += "/confirm"
        body = {}
      } else if (status === "cancelled") {
        endpoint += "/cancel"
        const reason = prompt("Please provide a reason for cancellation:")
        if (!reason) return
        body = { reason }
      }

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error("Failed to update appointment")
      }

      setSuccessMessage(`Appointment ${status} successfully!`)
      setTimeout(() => setSuccessMessage(null), 3000)

      const apt = appointments.find((a) => a.id === appointmentId)
      if (apt) {
        addNotification({
          title: `Appointment ${status}`,
          message: `Patient ${apt.patient_data?.name || apt.patient_id}'s appointment on ${apt.appointment_date} at ${apt.appointment_time} is now ${status}`,
          type: status === "confirmed" ? "success" : "warning",
          appointmentId: appointmentId,
        })
      }

      fetchAppointments()
      // Refresh notifications to show new patient confirmation/cancellation notifications
      await fetchAppointmentNotifications()
    } catch (err) {
      console.error("[v0] Error updating appointment:", err)
      setError(err instanceof Error ? err.message : "Failed to update appointment")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mb-4"></div>
          <p className="text-slate-600 font-medium">Loading appointments...</p>
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
            📅 Schedule Optimization
          </div>
          <h1
            className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-sky-700 via-cyan-600 to-blue-700 bg-clip-text text-transparent mb-4 leading-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Appointment Management
          </h1>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto font-medium">
            Book, reschedule, and optimize the hospital's appointment calendar
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

      {/* Date Picker */}
      <div
        className={`bg-white p-8 rounded-3xl shadow-xl border-2 border-sky-100/50 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      >
        <label className="block text-sm font-semibold text-slate-700 mb-3">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
        <p className="text-sm text-slate-600 mt-4">
          Showing <span className="text-sky-600 font-bold">{filteredAppointments.length}</span> appointment
          {filteredAppointments.length !== 1 ? "s" : ""} for {selectedDate}
        </p>
      </div>

      {/* Appointments List */}
      <div
        className={`space-y-4 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      >
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white p-6 rounded-2xl shadow-lg border-2 border-sky-100 hover:border-sky-300 transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      Patient: {apt.patient_data?.name || apt.patient_id}
                    </h3>
                    <span className="text-xs px-3 py-1 bg-sky-100 text-sky-700 rounded-full font-semibold">
                      {apt.reason}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="text-sm">
                      <p className="text-xs text-slate-500 font-semibold">Email</p>
                      <p className="text-slate-700 font-medium truncate">{apt.patient_data?.email || "N/A"}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-xs text-slate-500 font-semibold">Phone</p>
                      <p className="text-slate-700 font-medium">{apt.patient_data?.phone || "N/A"}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-xs text-slate-500 font-semibold">Blood Type</p>
                      <p className="text-slate-700 font-medium">{apt.patient_data?.blood_type || "N/A"}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-xs text-slate-500 font-semibold">Doctor</p>
                      <p className="text-slate-700 font-medium">{apt.doctor_data?.name || apt.doctor_id}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-1">{apt.appointment_time}</p>
                  {apt.notes && (
                    <p className="text-xs text-slate-500 italic bg-sky-50 p-2 rounded">Notes: {apt.notes}</p>
                  )}
                </div>

                <div className="text-right">
                  <span
                    className={`block px-4 py-2 rounded-lg text-xs font-semibold mb-3 text-center ${
                      apt.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : apt.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </span>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setSelectedAppointment(apt)
                        setIsDetailsModalOpen(true)
                      }}
                      className="px-3 py-2 text-xs bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-all font-semibold"
                    >
                      View Details
                    </button>
                    {apt.status === "pending" && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, "confirmed")}
                        className="px-3 py-2 text-xs bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all font-semibold"
                      >
                        Confirm
                      </button>
                    )}
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, "cancelled")}
                      className="px-3 py-2 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 px-5 bg-white rounded-2xl shadow-md border border-slate-200 text-slate-500">
            <div className="text-5xl mb-3 opacity-50">📅</div>
            <p className="text-lg font-medium">No appointments scheduled for this date</p>
          </div>
        )}
      </div>

      {isDetailsModalOpen && selectedAppointment && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setIsDetailsModalOpen(false)} />
          <div className="fixed inset-4 md:inset-20 bg-white rounded-2xl shadow-2xl z-50 p-8 overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Appointment Details
              </h2>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-2xl text-slate-500 hover:text-slate-700 font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Patient Information */}
              <div className="bg-cyan-50 p-6 rounded-xl border-2 border-cyan-200">
                <h3 className="font-bold text-slate-900 mb-4">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase">Name</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedAppointment.patient_data?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase">Email</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedAppointment.patient_data?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase">Phone</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedAppointment.patient_data?.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase">Blood Type</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {selectedAppointment.patient_data?.blood_type}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointment Information */}
              <div className="bg-sky-50 p-6 rounded-xl border-2 border-sky-200">
                <h3 className="font-bold text-slate-900 mb-4">Appointment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase">Date</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedAppointment.appointment_date}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase">Time</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedAppointment.appointment_time}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase">Doctor</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedAppointment.doctor_data?.name || selectedAppointment.doctor_id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase">Specialty</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedAppointment.doctor_data?.specialty || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase">Status</p>
                    <p
                      className={`text-lg font-semibold ${
                        selectedAppointment.status === "confirmed"
                          ? "text-green-700"
                          : selectedAppointment.status === "pending"
                            ? "text-yellow-700"
                            : "text-slate-700"
                      }`}
                    >
                      {selectedAppointment.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                <h3 className="font-bold text-slate-900 mb-4">Visit Details</h3>
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Reason for Visit</p>
                  <p className="text-lg font-semibold text-slate-900 mb-4">{selectedAppointment.reason}</p>
                </div>
                {selectedAppointment.notes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Notes</p>
                    <p className="text-slate-700">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-6 py-3 bg-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-300 transition-all"
                >
                  Close
                </button>
                {selectedAppointment.status === "pending" && (
                  <button
                    onClick={() => {
                      updateAppointmentStatus(selectedAppointment.id, "confirmed")
                      setIsDetailsModalOpen(false)
                    }}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
                  >
                    Confirm Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  )
}
