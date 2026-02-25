"use client"

import { useState } from "react"
import { NotificationBell } from "./NotificationBell"

interface NavigationProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    // { id: "doctors", label: "Doctors", icon: "👨‍⚕️" },
    { id: "patients", label: "Patients" },
    { id: "appointments", label: "Appointments" },
    { id: "diagnostics", label: "Diagnostics" },
  ]

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-[100] border-b-2 border-sky-100 font-['Inter',sans-serif]">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10">
        <div className="flex justify-between items-center h-[80px]">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group transition-all"
            onClick={() => onNavigate("dashboard")}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md group-hover:scale-110 transition-transform">
              H
            </div>
            <span
              className="text-2xl font-extrabold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent hidden sm:inline"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              PulseSync Admin
            </span>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex list-none gap-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 ${
                    currentPage === item.id
                      ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg scale-105"
                      : "text-slate-700 hover:bg-sky-50 hover:text-sky-600"
                  }`}
                >
                  {/* <span className="text-lg">{item.icon}</span> */}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Right side - Notification Icon, Profile Icon and Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Notification Icon */}
            <NotificationBell />

            <button
              onClick={() => onNavigate("profile")}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white flex items-center justify-center font-bold hover:shadow-lg transition-all hover:scale-110 hidden md:flex"
            >
              S
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-sky-50 transition-colors"
            >
              <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
                <span
                  className={`block h-0.5 bg-slate-700 rounded transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
                ></span>
                <span
                  className={`block h-0.5 bg-slate-700 rounded transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`}
                ></span>
                <span
                  className={`block h-0.5 bg-slate-700 rounded transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? "max-h-[500px] pb-5" : "max-h-0"
          }`}
        >
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onNavigate(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full px-5 py-4 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center gap-3 ${
                    currentPage === item.id
                      ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg"
                      : "text-slate-700 hover:bg-sky-50 hover:text-sky-600"
                  }`}
                >
                  {/* <span className="text-xl">{item.icon}</span> */}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => {
                  onNavigate("profile")
                  setMobileMenuOpen(false)
                }}
                className={`w-full px-5 py-4 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center gap-3 ${
                  currentPage === "profile"
                    ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg"
                    : "text-slate-700 hover:bg-sky-50 hover:text-sky-600"
                }`}
              >
                <span className="text-xl">👤</span>
                <span>Profile</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
    </nav>
  )
}
