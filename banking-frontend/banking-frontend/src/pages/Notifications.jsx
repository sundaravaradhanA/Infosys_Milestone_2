import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Loader2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  XCircle,
  BellOff
} from "lucide-react";

function Notifications() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);  // 30s poll
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://127.0.0.1:8000/alerts/?user_id=1", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/alerts/${alertId}/mark-read?user_id=1`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setAlerts(alerts.map(alert => 
          alert.id === alertId ? { ...alert, is_read: true } : alert
        ));
      }
    } catch (err) {
      console.error("Failed to mark alert as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://127.0.0.1:8000/alerts/mark-all-read?user_id=1", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setAlerts(alerts.map(alert => ({ ...alert, is_read: true })));
      }
    } catch (err) {
      console.error("Failed to mark all alerts as read:", err);
    }
  };

  const handleDelete = async (alertId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/alerts/${alertId}?user_id=1`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setAlerts(alerts.filter(alert => alert.id !== alertId));
      }
    } catch (err) {
      console.error("Failed to delete alert:", err);
    }
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "budget_exceeded":
        return <AlertTriangle className="w-5 h-5" />;
      case "warning":
        return <AlertCircle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      case "info":
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getAlertTypeStyles = (type, isRead) => {
    if (isRead) {
      return {
        bg: "bg-dark-50",
        border: "border-dark-200",
        iconBg: "bg-dark-200",
        iconColor: "text-dark-500",
        titleColor: "text-dark-700",
        textColor: "text-dark-500"
      };
    }
    
    switch (type) {
      case "budget_exceeded":
        return {
          bg: "bg-danger-50",
          border: "border-danger-200",
          iconBg: "bg-danger-100",
          iconColor: "text-danger-600",
          titleColor: "text-danger-800",
          textColor: "text-danger-700"
        };
      case "warning":
        return {
          bg: "bg-warning-50",
          border: "border-warning-200",
          iconBg: "bg-warning-100",
          iconColor: "text-warning-600",
          titleColor: "text-warning-800",
          textColor: "text-warning-700"
        };
      case "error":
        return {
          bg: "bg-danger-50",
          border: "border-danger-200",
          iconBg: "bg-danger-100",
          iconColor: "text-danger-600",
          titleColor: "text-danger-800",
          textColor: "text-danger-700"
        };
      case "info":
      default:
        return {
          bg: "bg-brand-50",
          border: "border-brand-200",
          iconBg: "bg-brand-100",
          iconColor: "text-brand-600",
          titleColor: "text-brand-800",
          textColor: "text-brand-700"
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-dark-800">Notifications</h2>
              {unreadCount > 0 ? (
                <p className="text-dark-500 text-sm">
                  You have <span className="font-semibold text-brand-600">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              ) : (
                <p className="text-dark-500 text-sm">All caught up!</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn-secondary flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="card overflow-hidden">
        {alerts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-100 flex items-center justify-center">
              <BellOff className="w-10 h-10 text-dark-400" />
            </div>
            <h3 className="text-lg font-semibold text-dark-700 mb-2">No notifications yet</h3>
            <p className="text-dark-500 text-sm max-w-sm mx-auto">
              You're all caught up! We'll notify you when there's something new.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-100">
            {alerts.map((alert, index) => {
              const styles = getAlertTypeStyles(alert.alert_type, alert.is_read);
              return (
                <div
                  key={alert.id}
                  className={`p-5 transition-all duration-200 hover:bg-dark-50 ${styles.bg} ${!alert.is_read ? 'border-l-4' : ''}`}
                  style={{ 
                    borderLeftColor: !alert.is_read ? (alert.alert_type === 'budget_exceeded' || alert.alert_type === 'error' ? '#EF4444' : alert.alert_type === 'warning' ? '#F59E0B' : '#0EA5E9') : 'transparent',
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles.iconBg} ${styles.iconColor} flex-shrink-0`}>
                      {getAlertIcon(alert.alert_type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${styles.titleColor}`}>
                          {alert.title}
                        </h3>
                        {!alert.is_read && (
                          <span className="px-2 py-0.5 bg-brand-500 text-white text-xs rounded-full font-medium">
                            New
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${styles.textColor} mb-2`}>
                        {alert.message}
                      </p>
                      <p className="text-xs text-dark-400">
                        {formatDate(alert.created_at)}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!alert.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="p-2 rounded-lg bg-dark-100 text-dark-600 hover:bg-dark-200 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="p-2 rounded-lg bg-dark-100 text-dark-600 hover:bg-danger-100 hover:text-danger-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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

export default Notifications;

