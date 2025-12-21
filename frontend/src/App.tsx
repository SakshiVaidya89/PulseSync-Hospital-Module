"use client"

import { useState, useEffect } from "react"
import Navigation from "./components/Navigation"
import Dashboard from "./pages/Dashboard"
// import DoctorManagement from "./pages/DoctorManagement"
import PatientRecords from "./pages/PatientRecords"
import AppointmentManagement from "./pages/AppointmentManagement"
import DiagnosticsManagement from "./pages/DiagnosticsManagement"
import HospitalStaffProfile from "./pages/HospitalStaffProfile"
import HospitalCompleteProfile from "./pages/HospitalCompleteProfile"
import AvailabilitySlots from "./pages/AvailabilitySlots"
import { NotificationProvider } from "./context/NotificationContext"
import "./App.css"

export default function HospitalAdmin() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [isAuthenticating, setIsAuthenticating] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tokenFromUrl = params.get("token")
    const roleFromUrl = params.get("role")
    const userIdFromUrl = params.get("user_id")
    const profileCompleteFromUrl = params.get("profile_complete")
    const isLoginFromUrl = params.get("is_login")

    if (tokenFromUrl) {
      // Store in localStorage for future use
      localStorage.setItem("auth_token", tokenFromUrl)
      localStorage.setItem("user_role", roleFromUrl || "hospital")
      localStorage.setItem("user_id", userIdFromUrl || "")
      localStorage.setItem("profile_complete", profileCompleteFromUrl || "false")

      console.log("[v0] Hospital App received data from URL params:", {
        roleFromUrl,
        profileCompleteFromUrl,
        isLoginFromUrl,
      })

      if (profileCompleteFromUrl !== "true" && isLoginFromUrl !== "true") {
        console.log("[v0] Hospital profile not complete, showing complete-profile page")
        setCurrentPage("complete-profile")
      } else {
        console.log("[v0] Hospital profile complete or user is logging in, showing dashboard")
        setCurrentPage("dashboard")
      }
      setIsAuthenticating(false)
    } else {
      // No token in URL, check localStorage
      const authToken = localStorage.getItem("auth_token")
      const userRole = localStorage.getItem("user_role")
      const profileComplete = localStorage.getItem("profile_complete")

      console.log("[v0] Hospital App checking auth:", { authToken, userRole, profileComplete })

      if (!authToken || userRole !== "hospital") {
        console.log("[v0] Hospital auth check failed, redirecting to auth")
        window.location.href = "http://localhost:5173"
        return
      }

      if (profileComplete === "true") {
        console.log("[v0] Hospital profile complete, showing dashboard")
        setCurrentPage("dashboard")
      } else {
        console.log("[v0] Hospital profile not complete, showing complete-profile page")
        setCurrentPage("complete-profile")
      }

      console.log("[v0] Hospital auth check passed")
      setIsAuthenticating(false)
    }
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case "complete-profile":
        return <HospitalCompleteProfile onNavigate={setCurrentPage} />
      case "dashboard":
        return <Dashboard onNavigate={setCurrentPage} />
      // case "doctors":
      //   return <DoctorManagement onNavigate={setCurrentPage} />
      case "patients":
        return <PatientRecords onNavigate={setCurrentPage} />
      case "appointments":
        return <AppointmentManagement onNavigate={setCurrentPage} />
      case "availability":
        return <AvailabilitySlots onNavigate={setCurrentPage} />
      case "diagnostics":
        return <DiagnosticsManagement onNavigate={setCurrentPage} />
      case "profile":
        return <HospitalStaffProfile onNavigate={setCurrentPage} />
      default:
        return <Dashboard onNavigate={setCurrentPage} />
    }
  }

  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <NotificationProvider>
      <div className="app">
        <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="main-content">{renderPage()}</main>
      </div>
    </NotificationProvider>
  )
}
