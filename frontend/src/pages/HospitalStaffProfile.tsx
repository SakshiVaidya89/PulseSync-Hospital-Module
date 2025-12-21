"use client"

import { useState, useEffect } from "react"

interface HospitalStaffProfileProps {
  onNavigate: (page: string) => void
}

const API_BASE_URL = "http://localhost:5000/api"

export default function HospitalStaffProfile({ onNavigate }: HospitalStaffProfileProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("details")
  const [isEditing, setIsEditing] = useState(false)
  const [staffData, setStaffData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    licenseNumber: "",
    address: "",
    staffPosition: "",
    hospitalEmail: "",
  })
  const [editData, setEditData] = useState(staffData)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) {
          setError("No authentication token found")
          setLoading(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/auth/get-hospital-profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          console.log("[v0] Profile fetch failed, using localStorage data")
          const storedData = localStorage.getItem("hospitalProfileData")
          if (storedData) {
            const parsed = JSON.parse(storedData)
            setStaffData({
              name: parsed.name || "",
              email: parsed.email || "",
              phone: parsed.hospitalPhone || "",
              department: parsed.department || "",
              licenseNumber: parsed.licenseNumber || "",
              address: parsed.address || "",
              staffPosition: parsed.staffPosition || "",
              hospitalEmail: parsed.hospitalEmail || "",
            })
            setEditData({
              name: parsed.name || "",
              email: parsed.email || "",
              phone: parsed.hospitalPhone || "",
              department: parsed.department || "",
              licenseNumber: parsed.licenseNumber || "",
              address: parsed.address || "",
              staffPosition: parsed.staffPosition || "",
              hospitalEmail: parsed.hospitalEmail || "",
            })
          }
          setLoading(false)
          return
        }

        const data = await response.json()
        const profileData = {
          name: data.full_name || "",
          email: data.email || "",
          phone: data.hospital_phone || "",
          department: data.department || "",
          licenseNumber: data.license_number || "",
          address: data.address || "",
          staffPosition: data.staff_position || "",
          hospitalEmail: data.hospital_email || "",
        }
        setStaffData(profileData)
        setEditData(profileData)
      } catch (err) {
        console.log("[v0] Error fetching profile:", err)
        setError("Failed to fetch profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  const workHistory = [
    { id: 1, activity: "Consultation", date: "2023-01-01", status: "Completed" },
    { id: 2, activity: "Surgery", date: "2023-02-15", status: "Pending" },
  ]

  const patientInteractions = [
    { id: 1, date: "2023-01-01", patient: "John Doe", type: "Check-up", duration: "1 hour", status: "Completed" },
    { id: 2, date: "2023-02-15", patient: "Jane Smith", type: "Follow-up", duration: "30 minutes", status: "Pending" },
  ]

  const diagnosticActivities = [
    { id: 1, test: "MRI", patient: "John Doe", date: "2023-01-01", result: "Normal" },
    { id: 2, test: "Blood Test", patient: "Jane Smith", date: "2023-02-15", result: "Abnormal" },
  ]

  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/auth/update-hospital-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          registration_number: editData.licenseNumber,
          department: editData.department,
          license_number: editData.licenseNumber,
          address: editData.address,
          staff_position: editData.staffPosition,
          hospital_phone: editData.phone,
          hospital_email: editData.hospitalEmail,
        }),
      })

      if (response.ok) {
        setStaffData(editData)
        setIsEditing(false)
        localStorage.setItem("hospitalProfileData", JSON.stringify(editData))
      } else {
        setError("Failed to update profile")
      }
    } catch (err) {
      console.log("[v0] Error updating profile:", err)
      setError("Connection error while updating profile")
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_role")
    localStorage.removeItem("user_id")
    localStorage.removeItem("profile_complete")
    localStorage.removeItem("hospitalProfileData")
    window.location.href = "http://localhost:5173"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 pt-8 pb-12">
      <div className="max-w-4xl mx-auto px-5 md:px-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-cyan-500 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl font-bold">
              {staffData.name ? staffData.name.charAt(0) : "H"}
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {staffData.name || "Hospital Staff"}
              </h1>
              <p className="text-sky-100">{staffData.email}</p>
              <p className="text-sky-100 text-sm mt-1">
                {staffData.department || "N/A"} • {staffData.staffPosition || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation with Edit Button */}
        <div className="flex gap-3 mb-8 border-b-2 border-sky-200 flex-wrap justify-between items-center">
          <div className="flex gap-3 flex-wrap">
            {["details", "work", "patients", "diagnostics"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold rounded-t-lg transition-all ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white"
                    : "text-slate-600 hover:text-sky-600"
                }`}
              >
                {tab === "details" && "Staff Details"}
                {tab === "work" && "Work History"}
                {tab === "patients" && "Patients"}
                {tab === "diagnostics" && "Diagnostics"}
              </button>
            ))}
          </div>
          {activeTab === "details" && (
            <button
              onClick={() => (isEditing ? handleEditSave() : setIsEditing(true))}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                isEditing
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                  : "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:scale-105"
              }`}
            >
              {isEditing ? "Save" : "Edit"}
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          {/* Staff Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Professional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Name", key: "name" },
                  { label: "Email", key: "email" },
                  { label: "Department", key: "department" },
                  { label: "Position", key: "staffPosition" },
                  { label: "License Number", key: "licenseNumber" },
                  { label: "Phone", key: "phone" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-sm font-semibold text-slate-600">{field.label}</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData[field.key as keyof typeof editData]}
                        onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })}
                        className="w-full border-2 border-sky-200 rounded-lg px-3 py-2 text-lg mt-1 focus:outline-none focus:border-sky-500"
                      />
                    ) : (
                      <p className="text-lg text-slate-800 mt-1">
                        {staffData[field.key as keyof typeof staffData] || "N/A"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    className="w-full border-2 border-sky-200 rounded-lg px-3 py-2 text-lg mt-1 focus:outline-none focus:border-sky-500"
                  />
                ) : (
                  <p className="text-lg text-slate-800 mt-1">{staffData.address || "N/A"}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Hospital Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.hospitalEmail}
                    onChange={(e) => setEditData({ ...editData, hospitalEmail: e.target.value })}
                    className="w-full border-2 border-sky-200 rounded-lg px-3 py-2 text-lg mt-1 focus:outline-none focus:border-sky-500"
                  />
                ) : (
                  <p className="text-lg text-slate-800 mt-1">{staffData.hospitalEmail || "N/A"}</p>
                )}
              </div>
            </div>
          )}

          {/* Work History Tab */}
          {activeTab === "work" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Work History
              </h2>
              <div className="space-y-4">
                {workHistory.map((item) => (
                  <div
                    key={item.id}
                    className="border-l-4 border-sky-500 pl-4 py-2 hover:bg-sky-50 rounded p-4 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-800">{item.activity}</p>
                        <p className="text-sm text-slate-600 mt-1">{item.date}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patient Interactions Tab */}
          {activeTab === "patients" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Patient Interactions
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-sky-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Patient</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Duration</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100">
                    {patientInteractions.map((interaction) => (
                      <tr key={interaction.id} className="hover:bg-sky-50">
                        <td className="px-4 py-3 text-slate-800">{interaction.date}</td>
                        <td className="px-4 py-3 text-slate-800">{interaction.patient}</td>
                        <td className="px-4 py-3 text-slate-800">{interaction.type}</td>
                        <td className="px-4 py-3 text-slate-800">{interaction.duration}</td>
                        <td className="px-4 py-3">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                            {interaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Diagnostic Activities Tab */}
          {activeTab === "diagnostics" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Diagnostic Activities
              </h2>
              <div className="space-y-4">
                {diagnosticActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{activity.test}</p>
                        <p className="text-sm text-slate-600 mt-1">Patient: {activity.patient}</p>
                        <p className="text-sm text-slate-600">{activity.date}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          activity.result === "Normal" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {activity.result}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSignOut}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
