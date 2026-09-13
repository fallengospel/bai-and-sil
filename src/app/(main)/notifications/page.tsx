"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import PushNotificationManager from "@/components/ui/PushNotificationManager";
import { timeAgo } from "@/lib/helpers";
import { FiBell, FiMessageSquare, FiHeart, FiDollarSign, FiCheckCircle } from "react-icons/fi";

interface Notification {
  id: string;
  type: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

const iconMap: Record<string, React.ReactNode> = {
  message: <FiMessageSquare className="w-4 h-4" />,
  favorite: <FiHeart className="w-4 h-4" />,
  offer: <FiDollarSign className="w-4 h-4" />,
  default: <FiBell className="w-4 h-4" />,
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setNotifications(data.notifications || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await fetch("/api/notifications", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading notifications..." className="py-16" />;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            loading={markingAll}
            leftIcon={<FiCheckCircle className="w-4 h-4" />}
          >
            Mark all read
          </Button>
        )}
      </div>

      <div className="mb-6">
        <PushNotificationManager />
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<FiBell className="w-12 h-12" />}
          title="All caught up!"
          description="No notifications yet. Go find some deals."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              href={notif.link}
              className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                notif.read
                  ? "bg-white border-gray-100"
                  : "bg-blue-50 border-blue-100"
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  notif.read ? "bg-gray-100 text-gray-500" : "bg-[#7BA8D0]/10 text-[#7BA8D0]"
                }`}
              >
                {iconMap[notif.type] || iconMap.default}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notif.read ? "text-gray-600" : "text-gray-900 font-medium"}`}>
                  {notif.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 bg-[#7BA8D0] rounded-full flex-shrink-0 mt-2" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
