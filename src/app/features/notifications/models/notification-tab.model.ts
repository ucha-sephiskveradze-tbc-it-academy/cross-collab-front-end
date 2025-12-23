export type NotificationTabKey = 'all' | 'unread' | 'registrations' | 'reminders' | 'updates';

export interface NotificationTab {
  key: NotificationTabKey;
  label: string;
  count: number;
}
