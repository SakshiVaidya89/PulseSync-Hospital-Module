"use client"

import { createContext, useState, useContext, type ReactNode, useEffect } from "react"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  read: boolean
  timestamp: Date
  appointmentId?: string
  appointmentData?: {
    doctorName?: string
    patientName?: string
    appointmentDate?: string
    appointmentTime?: string
    reason?: string
  }
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "read" | "timestamp">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  fetchAppointmentNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const API_BASE_URL = "http://localhost:5000/api"

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [processedAppointmentIds, setProcessedAppointmentIds] = useState<Set<string>>(new Set())

  const addNotification = (notification: Omit<Notification, "id" | "read" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      timestamp: new Date(),
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const fetchAppointmentNotifications = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/appointments/notifications`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.log("[v0] Failed to fetch notifications")
        return
      }

      const data = await response.json()
      const backendNotifications = data.notifications || []

      backendNotifications.forEach((notif: any) => {
        if (!notif.read && !processedAppointmentIds.has(notif.appointment_id)) {
          addNotification({
            title: notif.message.split("\n")[0] || "New Appointment",
            message: notif.message,
            type: "info",
            appointmentId: notif.appointment_id,
          })
          setProcessedAppointmentIds((prev) => new Set([...prev, notif.appointment_id]))
        }
      })
    } catch (err) {
      console.error("[v0] Error fetching notifications:", err)
    }
  }

  useEffect(() => {
    fetchAppointmentNotifications()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchAppointmentNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        fetchAppointmentNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within NotificationProvider")
  }
  return context
}
