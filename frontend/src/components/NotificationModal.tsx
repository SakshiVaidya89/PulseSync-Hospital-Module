"use client"
import { useNotification } from "../context/NotificationContext"
import { useNavigate } from "react-router-dom"

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const { notifications, markAsRead, markAllAsRead, clearNotification, clearNotifications } = useNotification()
 const navigate = useNavigate()

  if (!isOpen) return null

  const getIconAndColor = (type: string) => {
    switch (type) {
      case "warning":
        return { icon: "⚠️", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", textColor: "text-yellow-700" }
      case "error":
        return { icon: "❌", bgColor: "bg-red-50", borderColor: "border-red-200", textColor: "text-red-700" }
      case "success":
        return { icon: "✅", bgColor: "bg-green-50", borderColor: "border-green-200", textColor: "text-green-700" }
      default:
        return { icon: "ℹ️", bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-700" }
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-20 right-5 w-96 max-h-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col border-2 border-sky-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sky-100">
          <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500">
              <span className="text-4xl mb-2">📭</span>
              <p className="text-sm font-medium">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => {
                const { icon, bgColor, borderColor, textColor } = getIconAndColor(notification.type)
                return (
                  <div
                    key={notification.id}
                    onClick={() => {
                      markAsRead(notification.id)
                      // Navigate to appointments page
                      if (notification.appointmentId) {
                        navigate('/appointments')
                        onClose()
                      }
                    }}
                    className={`p-4 cursor-pointer transition-all hover:bg-sky-50 flex items-start justify-between gap-3 ${!notification.read ? "bg-sky-50/50" : ""}`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-xl mt-1">{icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-sm">{notification.title}</h3>
                        <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {!notification.read && <div className="w-2 h-2 bg-sky-500 rounded-full mt-2 flex-shrink-0" />}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        clearNotification(notification.id)
                      }}
                      className="text-slate-400 hover:text-red-600 text-xl font-bold transition-colors flex-shrink-0"
                      title="Clear notification"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="flex gap-2 p-4 border-t border-sky-100 bg-sky-50">
            <button
              onClick={markAllAsRead}
              className="flex-1 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors py-2"
            >
              Mark all as read
            </button>
            <button
              onClick={clearNotifications}
              className="flex-1 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors py-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </>
  )
}
