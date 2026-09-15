// Notification service

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
}

const notifications: Notification[] = [];

export const addNotification = (
  title: string,
  message: string,
  type: Notification['type'] = 'info'
): Notification => {
  const notification: Notification = {
    id: Math.random().toString(36).slice(2),
    title,
    message,
    type,
    timestamp: Date.now(),
    read: false,
  };

  notifications.unshift(notification);
  return notification;
};

export const markRead = (id: string) => {
  const notification = notifications.find(n => n.id === id);
  if (notification) notification.read = true;
};

export const getNotifications = () => [...notifications];
export const getUnread = () => notifications.filter(n => !n.read);
export const clearNotifications = () => notifications.length = 0;
