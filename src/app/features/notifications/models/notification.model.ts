export type NotificationStatus = 'Pending' | 'Sent' | 'Failed';

export type NotificationType = 'registration' | 'reminder' | 'update' | 'waitlist' | 'completed';
export interface NotificationAction {
  label: string;
  action: 'view' | 'addToCalendar' | 'unregister' | 'leaveWaitlist';
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  timeAgo: string;
  unread: boolean;
  meta?: string[];
  actions: NotificationAction[];
}

export interface QuickFilter {
  key: NotificationFilterKey;
  label: string;
  count: number;
}

export type NotificationFilterKey =
  | 'all'
  | 'unread'
  | 'registrations'
  | 'reminders'
  | 'updates'
  | 'waitlist'
  | 'completed';
