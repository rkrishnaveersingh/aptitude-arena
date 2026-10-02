import React, { useRef, useEffect } from 'react';
import { Bell, CheckCheck, FileText, BookOpen, Clock, Flame, Award, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationItem } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { notifications, unreadNotifCount, markNotificationRead, markAllNotificationsRead } = useApp();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'paper':
        return <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'exam':
        return <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'streak':
        return <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      case 'achievement':
        return <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'reminder':
      default:
        return <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const handleItemClick = (notif: NotificationItem) => {
    markNotificationRead(notif.id);
    if (notif.actionUrl) {
      onNavigate(notif.actionUrl);
      onClose();
    }
  };

  return (
    <div
      ref={drawerRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-semibold text-slate-900 dark:text-white">
            Notifications
          </span>
          {unreadNotifCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-bold text-white bg-indigo-600 rounded-full tabular-nums">
              {unreadNotifCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadNotifCount > 0 && (
            <button
              onClick={() => markAllNotificationsRead()}
              className="text-[11px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No notifications at the moment.
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                notif.read
                  ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-75'
                  : 'bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {notif.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                  {notif.message}
                </p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
