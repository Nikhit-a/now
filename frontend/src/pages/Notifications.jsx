
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Briefcase,
  BookOpen,
  CalendarDays,
  Trophy,
  AlertCircle,
  Info,
  RefreshCw,
  BellRing,
  Inbox,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const FILTERS = ["All", "Unread", "Read"];

const getNotificationIcon = (type) => {
  const normalized = String(type || "").toLowerCase();

  if (normalized.includes("job")) return Briefcase;
  if (normalized.includes("interview")) return BookOpen;
  if (normalized.includes("event") || normalized.includes("drive"))
    return CalendarDays;
  if (normalized.includes("achievement") || normalized.includes("success"))
    return Trophy;
  if (normalized.includes("warning") || normalized.includes("error"))
    return AlertCircle;
  if (normalized.includes("reminder")) return BellRing;
  return Info;
};

const getNotificationColor = (type) => {
  const normalized = String(type || "").toLowerCase();

  if (normalized.includes("job"))
    return "bg-blue-50 text-blue-600";
  if (normalized.includes("interview"))
    return "bg-purple-50 text-purple-600";
  if (normalized.includes("event") || normalized.includes("drive"))
    return "bg-orange-50 text-orange-600";
  if (normalized.includes("achievement") || normalized.includes("success"))
    return "bg-green-50 text-green-600";
  if (normalized.includes("warning") || normalized.includes("error"))
    return "bg-red-50 text-red-600";

  return "bg-gray-100 text-gray-600";
};

const getNotificationId = (notification) =>
  notification._id || notification.id;

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [search, setSearch] = useState("");

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const response = await API.get("/notifications");

      const data =
        response.data?.notifications ||
        response.data?.data ||
        response.data ||
        [];

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Notification loading error:", error);
      toast.error(
        error.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const readCount = notifications.length - unreadCount;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Unread" && !notification.isRead) ||
        (activeFilter === "Read" && notification.isRead);

      const text = search.toLowerCase();

      const matchesSearch =
        !text ||
        notification.title?.toLowerCase().includes(text) ||
        notification.message?.toLowerCase().includes(text);

      return matchesFilter && matchesSearch;
    });
  }, [notifications, activeFilter, search]);

  const markAsRead = async (notification) => {
    const id = getNotificationId(notification);

    if (!id || notification.isRead) return;

    try {
      setActionLoading(String(id));

      await API.patch(`/notifications/${id}/read`);

      setNotifications((previous) =>
        previous.map((item) =>
          getNotificationId(item) === id
            ? { ...item, isRead: true }
            : item
        )
      );

      toast.success("Notification marked as read.");
    } catch (error) {
      console.error("Mark read error:", error);
      toast.error(
        error.response?.data?.message ||
          "Unable to update notification."
      );
    } finally {
      setActionLoading("");
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      toast.success("All notifications are already read.");
      return;
    }

    try {
      setActionLoading("all");

      await API.patch("/notifications/read-all");

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true }))
      );

      toast.success("All notifications marked as read.");
    } catch (error) {
      console.error("Mark all read error:", error);
      toast.error(
        error.response?.data?.message ||
          "Unable to mark all notifications as read."
      );
    } finally {
      setActionLoading("");
    }
  };

  const deleteNotification = async (id) => {
    if (!id) return;

    try {
      setActionLoading(String(id));

      await API.delete(`/notifications/${id}`);

      setNotifications((previous) =>
        previous.filter((item) => getNotificationId(item) !== id)
      );

      toast.success("Notification deleted.");
    } catch (error) {
      console.error("Delete notification error:", error);
      toast.error(
        error.response?.data?.message ||
          "Unable to delete notification."
      );
    } finally {
      setActionLoading("");
    }
  };

  const clearAllNotifications = async () => {
    if (!notifications.length) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete all notifications?"
    );

    if (!confirmed) return;

    try {
      setActionLoading("clear");

      await API.delete("/notifications");

      setNotifications([]);
      toast.success("All notifications cleared.");
    } catch (error) {
      console.error("Clear notifications error:", error);
      toast.error(
        error.response?.data?.message ||
          "Unable to clear notifications."
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification);
    }

    const link = notification.link || notification.actionUrl;

    if (link && typeof link === "string" && link.startsWith("/")) {
      navigate(link);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Recently";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "Recently";

    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-blue-600">
            <Bell size={21} />
            <span className="text-sm font-semibold">
              STAY UPDATED
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Notifications
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Stay updated with your career progress, interviews and opportunities.
          </p>
        </div>

        <button
          onClick={fetchNotifications}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Bell size={21} />}
          label="Total Notifications"
          value={notifications.length}
          color="blue"
        />

        <StatCard
          icon={<BellRing size={21} />}
          label="Unread"
          value={unreadCount}
          color="orange"
        />

        <StatCard
          icon={<CheckCheck size={21} />}
          label="Read"
          value={readCount}
          color="green"
        />
      </div>

      {/* Notification Center */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Your Activity
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your latest notifications.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || actionLoading !== ""}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <CheckCheck size={16} />
              Mark all read
            </button>

            <button
              onClick={clearAllNotifications}
              disabled={!notifications.length || actionLoading !== ""}
              className="flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={16} />
              Clear all
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => {
              const count =
                filter === "All"
                  ? notifications.length
                  : filter === "Unread"
                  ? unreadCount
                  : readCount;

              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    activeFilter === filter
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {filter} ({count})
                </button>
              );
            })}
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications..."
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-blue-500 md:max-w-xs"
          />
        </div>

        {/* Notification List */}
        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <Loader2
              size={32}
              className="animate-spin text-blue-600"
            />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Inbox size={30} className="text-gray-400" />
            </div>

            <h3 className="font-semibold text-gray-800">
              {search
                ? "No matching notifications"
                : activeFilter === "Unread"
                ? "You're all caught up!"
                : "No notifications yet"}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {search
                ? "Try searching with different keywords."
                : "New career updates and reminders will appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => {
              const id = getNotificationId(notification);
              const Icon = getNotificationIcon(notification.type);

              return (
                <div
                  key={id}
                  className={`flex items-start gap-3 p-4 transition hover:bg-gray-50 md:gap-4 md:p-5 ${
                    !notification.isRead ? "bg-blue-50/40" : "bg-white"
                  }`}
                >
                  <div
                    className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getNotificationColor(
                      notification.type
                    )}`}
                  >
                    <Icon size={21} />
                  </div>

                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title || "Notification"}
                      </h3>

                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {notification.message || "You have a new update."}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span>{formatDate(notification.createdAt)}</span>

                      {notification.link && (
                        <span className="flex items-center gap-1 text-blue-600">
                          View details
                          <ExternalLink size={12} />
                        </span>
                      )}
                    </div>
                  </button>

                  <div className="flex shrink-0 items-center gap-1">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification)}
                        disabled={actionLoading === String(id)}
                        title="Mark as read"
                        className="rounded-lg p-2 text-gray-400 hover:bg-green-50 hover:text-green-600 disabled:opacity-50"
                      >
                        <Check size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(id)}
                      disabled={actionLoading === String(id)}
                      title="Delete notification"
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div
          className={`rounded-lg p-2 ${colorClasses[color] || colorClasses.blue}`}
        >
          {icon}
        </div>

        <span className="text-sm text-gray-500">{label}</span>
      </div>

      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default Notifications;
