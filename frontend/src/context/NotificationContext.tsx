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
  clearNotifications: () => Promise<void>
  clearNotification: (id: string) => Promise<void>
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

  const clearNotification = async (id: string) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return
      
      // Call backend to clear notification
      const response = await fetch(`${API_BASE_URL}/appointments/notifications/${id}/clear`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      
      if (response.ok) {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id))
      }
    } catch (err) {
      console.error("[v0] Error clearing notification:", err)
    }
  }

  const clearNotifications = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return
      
      // Call backend to clear all notifications
      for (const notif of notifications) {
        await fetch(`${API_BASE_URL}/appointments/notifications/${notif.id}/clear`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      }
      
      setNotifications([])
    } catch (err) {
      console.error("[v0] Error clearing notifications:", err)
    }
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

      // Convert backend notifications to frontend format
      const newNotifications: Notification[] = backendNotifications.map((notif: any) => ({
        id: notif.id,
        title: notif.type === 'success' ? 'Appointment Confirmed' : notif.type === 'warning' ? 'Appointment Cancelled' : 'New Appointment',
        message: notif.message,
        type: notif.type,
        read: notif.read,
        timestamp: new Date(notif.created_at),
        appointmentId: notif.appointment_id,
      }))

      // Replace notifications entirely from backend (cleared ones won't be returned)
      setNotifications(newNotifications)
    } catch (err) {
      console.error("[v0] Error fetching notifications:", err)
    }
  }

  useEffect(() => {
    fetchAppointmentNotifications()
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
        clearNotification,
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
