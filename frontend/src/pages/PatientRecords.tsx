"use client"

import { useState, useEffect } from "react"

interface PatientRecordsProps {
  onNavigate: (page: string) => void
}

export default function PatientRecords({ onNavigate }: PatientRecordsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const patients = [
    {
      id: 1,
      name: "John Smith",
      age: 45,
      bloodType: "O+",
      lastVisit: "2024-11-03",
      status: "active",
      conditions: ["Hypertension", "Diabetes"],
    },
    {
      id: 2,
      name: "Emma Davis",
      age: 32,
      bloodType: "A+",
      lastVisit: "2024-11-04",
      status: "active",
      conditions: ["Asthma"],
    },
    {
      id: 3,
      name: "Robert Wilson",
      age: 58,
      bloodType: "B+",
      lastVisit: "2024-10-28",
      status: "discharged",
      conditions: ["Heart Disease", "Cholesterol"],
    },
    {
      id: 4,
      name: "Lisa Anderson",
      age: 38,
      bloodType: "AB-",
      lastVisit: "2024-11-02",
      status: "active",
      conditions: [],
    },
    {
      id: 5,
      name: "Michael Brown",
      age: 51,
      bloodType: "O-",
      lastVisit: "2024-11-01",
      status: "active",
      conditions: ["Arthritis"],
    },
  ]

  const filteredPatients = patients.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

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
            📋 Electronic Health Records
          </div>
          <h1
            className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-sky-700 via-cyan-600 to-blue-700 bg-clip-text text-transparent mb-4 leading-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Patient Records
          </h1>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto font-medium">
            Efficiently create, update, and secure comprehensive electronic health records
          </p>
        </div>
      </div>

      {/* Search */}
      <div
        className={`bg-white p-8 rounded-3xl shadow-xl border-2 border-sky-100/50 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      >
        <input
          type="text"
          className="w-full p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 hover:border-sky-300 placeholder-slate-400"
          placeholder="Search patients by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <p className="text-sm text-slate-600 mt-4">
          Found <span className="text-sky-600 font-bold">{filteredPatients.length}</span> patient
          {filteredPatients.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div
        className={`bg-white rounded-3xl shadow-xl border-2 border-sky-100/50 overflow-hidden transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-sky-50 to-cyan-50 border-b border-sky-200">
                <th className="px-6 py-4 text-left font-bold text-slate-900">Name</th>
                <th className="px-6 py-4 text-left font-bold text-slate-900">Age</th>
                <th className="px-6 py-4 text-left font-bold text-slate-900">Blood Type</th>
                <th className="px-6 py-4 text-left font-bold text-slate-900">Last Visit</th>
                <th className="px-6 py-4 text-left font-bold text-slate-900">Status</th>
                <th className="px-6 py-4 text-left font-bold text-slate-900">Conditions</th>
                <th className="px-6 py-4 text-left font-bold text-slate-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-slate-200 hover:bg-sky-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{patient.name}</td>
                  <td className="px-6 py-4 text-slate-700">{patient.age}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-lg text-sm font-semibold">
                      {patient.bloodType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{patient.lastVisit}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        patient.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {patient.conditions.length > 0 ? patient.conditions.join(", ") : "No conditions"}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-sky-600 hover:text-sky-700 font-semibold text-sm hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  )
}
