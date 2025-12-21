"use client"

import { useState } from "react"
import { useNotification } from "../context/NotificationContext"
import { NotificationModal } from "./NotificationModal"

export function NotificationBell() {
  const { unreadCount } = useNotification()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(!isModalOpen)}
        className="relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-100 hover:bg-sky-200 transition-all duration-300 text-sky-600 hover:text-sky-700 text-xl"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      <NotificationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
