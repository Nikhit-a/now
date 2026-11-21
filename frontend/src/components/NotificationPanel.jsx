import { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle2, Info, AlertTriangle, X, Trash2 } from "lucide-react";

/* ---------- sample / seed notifications ---------- */
const SEED = [
  {
    id: "n1",
    type: "info",
    title: "Welcome to CareerInfinity!",
    message: "Complete your profile to get personalised career recommendations.",
    time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
  },
  {
    id: "n2",
    type: "success",
    title: "Profile updated",
    message: "Your skills and education have been saved successfully.",
    time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    read: false,
  },
  {
    id: "n3",
    type: "warning",
    title: "Resume not uploaded",
    message: "Upload your resume so we can analyze your skills with AI.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    read: false,
  },
  {
    id: "n4",
    type: "info",
    title: "New assessment available",
    message: "A JavaScript skill assessment has been added. Test yourself!",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
];

const LS_KEY = "ci_notifications";

function loadNotifications() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return SEED;
}

function saveNotifications(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

/* ---------- helpers ---------- */
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function typeIcon(type) {
  switch (type) {
    case "success":
      return <CheckCircle2 size={16} className="notif-icon notif-icon-success" />;
    case "warning":
      return <AlertTriangle size={16} className="notif-icon notif-icon-warning" />;
    default:
      return <Info size={16} className="notif-icon notif-icon-info" />;
  }
}

/* ---------- component ---------- */
export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(loadNotifications);
  const panelRef = useRef(null);

  // Persist on change
  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const removeOne = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const clearAll = () => setNotifications([]);

  return (
    <div className="notif-wrapper" ref={panelRef}>
      <button
        className="notification-button"
        title="Notifications"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={20} />
        {unread > 0 && <span className="notification-dot" />}
      </button>

      {open && (
        <div className="notif-panel">
          {/* Header */}
          <div className="notif-header">
            <h4>Notifications {unread > 0 && <span className="notif-badge">{unread}</span>}</h4>
            <div className="notif-header-actions">
              {unread > 0 && (
                <button onClick={markAllRead} title="Mark all as read">
                  <CheckCircle2 size={14} /> Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} title="Clear all notifications">
                  <Trash2 size={14} /> Clear all
                </button>
              )}
              <button onClick={() => setOpen(false)} className="notif-close" title="Close">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell size={28} />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${n.read ? "notif-read" : "notif-unread"}`}
                  onClick={() => markRead(n.id)}
                >
                  {typeIcon(n.type)}
                  <div className="notif-body">
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                    <span className="notif-time">{timeAgo(n.time)}</span>
                  </div>
                  <button
                    className="notif-remove"
                    title="Dismiss"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOne(n.id);
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
