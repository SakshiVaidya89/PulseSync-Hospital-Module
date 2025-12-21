"use client"

import { useState, useEffect } from "react"
import DoctorCard from "../components/DoctorCard"

interface DoctorManagementProps {
  onNavigate: (page: string) => void
}

export default function DoctorManagement({ onNavigate }: DoctorManagementProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      rating: 4.8,
      patients: 245,
      avatar: "SJ",
      status: "available" as const,
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Neurology",
      rating: 4.9,
      patients: 189,
      avatar: "MC",
      status: "busy" as const,
    },
    {
      id: 3,
      name: "Dr. Emily Brown",
      specialty: "Orthopedics",
      rating: 4.7,
      patients: 156,
      avatar: "EB",
      status: "available" as const,
    },
    {
      id: 4,
      name: "Dr. James Lee",
      specialty: "Gastroenterology",
      rating: 4.6,
      patients: 203,
      avatar: "JL",
      status: "offline" as const,
    },
    {
      id: 5,
      name: "Dr. Lisa Wang",
      specialty: "Pediatrics",
      rating: 4.9,
      patients: 178,
      avatar: "LW",
      status: "available" as const,
    },
    {
      id: 6,
      name: "Dr. Robert Martinez",
      specialty: "Oncology",
      rating: 4.8,
      patients: 134,
      avatar: "RM",
      status: "available" as const,
    },
  ]

  const specialties = ["all", "Cardiology", "Neurology", "Orthopedics", "Gastroenterology", "Pediatrics", "Oncology"]

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty === "all" || doctor.specialty === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  return (
    <div className="flex flex-col gap-8 w-full bg-gradient-to-b from-sky-50 via-white to-cyan-50 px-5 md:px-10 py-12 font-['Inter',sans-serif]">
      {/* Header Section */}
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
            👨‍⚕️ Healthcare Professionals
          </div>
          <h1
            className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-sky-700 via-cyan-600 to-blue-700 bg-clip-text text-transparent mb-4 leading-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Doctor Management
          </h1>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto font-medium">
            Securely manage doctor profiles, credentials, and schedules
          </p>
        </div>
      </div>

      {/* Controls */}
      <div
        className={`bg-white p-8 rounded-3xl shadow-xl shadow-sky-100/50 border-2 border-sky-100/50 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      >
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            className="flex-1 p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 hover:border-sky-300 bg-slate-50 focus:bg-white placeholder-slate-400"
            placeholder="Search doctors by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 hover:border-sky-300 cursor-pointer bg-slate-50 focus:bg-white"
          >
            {specialties.map((spec) => (
              <option key={spec} value={spec}>
                {spec === "all" ? "All Specialties" : spec}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-8 py-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all whitespace-nowrap"
          >
            Add Doctor
          </button>
        </div>

        <p className="text-sm text-slate-600">
          Found <span className="text-sky-600 font-bold">{filteredDoctors.length}</span> doctor
          {filteredDoctors.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Add Doctor Form */}
      {showForm && (
        <div
          className={`bg-white p-8 rounded-3xl shadow-xl border-2 border-sky-200 transition-all duration-300 ${showForm ? "opacity-100" : "opacity-0"}`}
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Doctor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Full Name"
              className="p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
            <select className="p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100">
              <option>Select Specialty</option>
              {specialties
                .filter((s) => s !== "all")
                .map((spec) => (
                  <option key={spec}>{spec}</option>
                ))}
            </select>
            <input
              type="email"
              placeholder="Email Address"
              className="p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              className="p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </div>
          <div className="flex gap-4 mt-6">
            <button className="px-8 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
              Save Doctor
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-8 py-3 bg-slate-200 text-slate-900 rounded-xl font-semibold hover:bg-slate-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor, index) => (
          <div
            key={doctor.id}
            className={`transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            style={{ transitionDelay: `${200 + index * 100}ms` }}
          >
            <DoctorCard {...doctor} />
          </div>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  )
}
