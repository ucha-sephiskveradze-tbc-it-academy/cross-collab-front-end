export type NotificationStatus = 'Pending' | 'Sent' | 'Failed';

export type NotificationType = 'Registration' | 'Reminder' | 'Update';

export interface Notification {
  id: number;
  userId: number;
  eventId: number;
  notificationType: NotificationType;
  sentAt: string | null; // ISO datetime
  status: NotificationStatus;
  message: string;
}
