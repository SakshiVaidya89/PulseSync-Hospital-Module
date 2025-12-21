"use client"

import { useState, useEffect } from "react"

interface DiagnosticsManagementProps {
  onNavigate: (page: string) => void
}

export default function DiagnosticsManagement({ onNavigate }: DiagnosticsManagementProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("all")

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const tests = [
    {
      id: 1,
      patient: "John Smith",
      test: "Complete Blood Count",
      ordered: "2024-11-03",
      status: "completed",
      result: "Normal",
    },
    { id: 2, patient: "Emma Davis", test: "COVID-19 RT-PCR", ordered: "2024-11-04", status: "pending", result: "-" },
    { id: 3, patient: "Robert Wilson", test: "ECG", ordered: "2024-11-02", status: "completed", result: "Normal" },
    { id: 4, patient: "Lisa Anderson", test: "MRI Brain", ordered: "2024-11-04", status: "in-progress", result: "-" },
    {
      id: 5,
      patient: "Michael Brown",
      test: "X-Ray Chest",
      ordered: "2024-11-01",
      status: "completed",
      result: "Normal",
    },
    { id: 6, patient: "Sarah Lee", test: "Ultrasound Abdomen", ordered: "2024-11-04", status: "pending", result: "-" },
  ]

  const filteredTests = tests.filter((test) => {
    return selectedStatus === "all" || test.status === selectedStatus
  })

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
            🔬 Laboratory Services
          </div>
          <h1
            className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-sky-700 via-cyan-600 to-blue-700 bg-clip-text text-transparent mb-4 leading-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Diagnostics Management
          </h1>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto font-medium">
            Order, track, and securely store diagnostic test results
          </p>
        </div>
      </div>

      {/* Filter */}
      <div
        className={`bg-white p-8 rounded-3xl shadow-xl border-2 border-sky-100/50 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      >
        <label className="block text-sm font-semibold text-slate-700 mb-3">Filter by Status</label>
        <div className="flex gap-3 flex-wrap">
          {["all", "pending", "in-progress", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-5 py-3 rounded-lg font-semibold transition-all ${
                selectedStatus === status
                  ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {status === "all" ? "All Tests" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tests Table */}
      <div
        className={`bg-white rounded-3xl shadow-xl border-2 border-sky-100/50 overflow-hidden transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-sky-50 to-cyan-50 border-b border-sky-200">
                <th className="px-6 py-4 text-left font-bold text-slate-900">Patient</th>
                <th className="px-6 py-4 text-left font-bold text-slate-900">Test Name</th>
                <th className="px-6 py-4 text-left font-bold text-slate-900">Ordered Date</th>
                <th className="px-6 py-4 text-left font-bold text-slate-900">Status</th>
                <th className="px-6 py-4 text-left font-bold text-slate-900">Result</th>
                <th className="px-6 py-4 text-left font-bold text-slate-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((test) => (
                <tr key={test.id} className="border-b border-slate-200 hover:bg-sky-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{test.patient}</td>
                  <td className="px-6 py-4 text-slate-700">{test.test}</td>
                  <td className="px-6 py-4 text-slate-700">{test.ordered}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        test.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : test.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{test.result}</td>
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
