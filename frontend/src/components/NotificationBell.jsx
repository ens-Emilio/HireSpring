import { useState, useEffect, useRef, useCallback } from 'react'
import { useNotifications } from '../contexts/NotificationsContext'
import { BellIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

function formatRelativeTime(date) {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now - then) / 1000)

  if (seconds < 60) return 'agora mesmo'
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600)
    return `há ${hours} hora${hours > 1 ? 's' : ''}`
  }
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400)
    return `há ${days} dia${days > 1 ? 's' : ''}`
  }
  return then.toLocaleDateString('pt-BR')
}

function getIconByType(type) {
  switch (type) {
    case 'success':
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />
    case 'warning':
      return <ExclamationCircleIcon className="w-5 h-5 text-amber-500" />
    case 'error':
      return <XCircleIcon className="w-5 h-5 text-red-500" />
    default:
      return <InformationCircleIcon className="w-5 h-5 text-blue-500" />
  }
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleClose = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleClose()
      }
    }
    function handleEscape(event) {
      if (event.key === 'Escape') handleClose()
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, handleClose])

  const handleNotificationClick = (id) => {
    markAsRead(id)
  }

  const handleMarkAllRead = (e) => {
    e.stopPropagation()
    markAllAsRead()
  }

  const displayCount = unreadCount > 9 ? '9+' : unreadCount

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
        aria-label="Notificações"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <>
            <span
              className="badge absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[1.25rem] h-5 rounded-full flex items-center justify-center font-medium animate-bounce-badge"
              aria-hidden="true"
            >
              {displayCount}
            </span>
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 opacity-75 animate-pulse-ring"
              aria-hidden="true"
            />
          </>
        )}
      </button>

      {isOpen && (
        <div
          className="dropdown absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          role="dialog"
          aria-label="Lista de notificações"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <InformationCircleIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Você está em dia com tudo!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors ${
                    !n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                  onClick={() => handleNotificationClick(n.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(n.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIconByType(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatRelativeTime(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
