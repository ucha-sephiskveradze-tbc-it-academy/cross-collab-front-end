import { Component, computed, signal } from '@angular/core';
import { Footer } from '../../shared/ui/footer/footer';
import { Header } from '../../shared/ui/header/header';
import { toSignal } from '@angular/core/rxjs-interop';

import { SelectModule } from 'primeng/select';
import { NotificationTab, NotificationTabKey } from './models/notification-tab.model';
import { FormControl } from '@angular/forms';
import { NotificationCard } from './components/notification-card/notification-card';
import { Notification, NotificationFilterKey, QuickFilter } from './models/notification.model';
import { NOTIFICATIONS_MOCK } from './data/notifications.mock';

@Component({
  selector: 'app-notifications',
  imports: [Footer, Header, SelectModule, NotificationCard],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications {
  activeTab = signal<NotificationFilterKey>('all');
  notifications = signal<Notification[]>([
    {
      id: 1,
      title: 'Registration Confirmed',
      message: 'You have successfully registered for January 18, 2025 at 09:00 AM.',
      type: 'registration',
      timeAgo: '2 hours ago',
      unread: true,
      meta: ['Jan 18, 2025 • 09:00 AM', 'Grand Conference Hall'],
      actions: [
        { label: 'View Event Details', action: 'view', variant: 'primary' },
        { label: 'Add to Calendar', action: 'addToCalendar' },
      ],
    },
    {
      id: 2,
      title: 'Event Reminder – 24 Hours',
      message: 'Reminder: starts tomorrow at 2:00 PM.',
      type: 'reminder',
      timeAgo: '3 hours ago',
      unread: true,
      meta: ['Tomorrow • 2:00 PM', 'Training Room B'],
      actions: [
        { label: 'View Event Details', action: 'view', variant: 'primary' },
        { label: 'Unregister', action: 'unregister', variant: 'danger' },
      ],
    },
  ]);

  notificationTabs: readonly NotificationTab[] = [
    { key: 'all', label: 'All', count: 47 },
    { key: 'unread', label: 'Unread', count: 8 },
    { key: 'registrations', label: 'Registrations', count: 23 },
    { key: 'reminders', label: 'Reminders', count: 15 },
    { key: 'updates', label: 'Updates', count: 9 },
  ];

  setActiveTab(key: NotificationFilterKey) {
    this.activeTab.set(key);
  }

  todayLabel = computed(() => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  });

  /* ---------- SORT (Reactive Form → Signal) ---------- */

  sortControl = new FormControl<'recent' | 'oldest'>('recent', {
    nonNullable: true,
  });

  sortOptions: { label: string; value: 'recent' | 'oldest' }[] = [
    { label: 'Most Recent', value: 'recent' },
    { label: 'Oldest First', value: 'oldest' },
  ];

  /** 🔗 Convert FormControl → Signal */
  sortSignal = toSignal(this.sortControl.valueChanges, {
    initialValue: this.sortControl.value,
  });

  quickFilters: QuickFilter[] = [
    { key: 'unread', label: 'Unread', count: 8 },
    { key: 'registrations', label: 'Registrations', count: 23 },
    { key: 'reminders', label: 'Reminders', count: 15 },
    { key: 'updates', label: 'Updates', count: 9 },
    { key: 'waitlist', label: 'Waitlist', count: 2 },
    { key: 'completed', label: 'Event Completed', count: 4 },
  ];

  /** 🔥 Filter notifications by selected quick filter */
  filteredNotifications = computed(() => {
    const tab = this.activeTab();

    return this.notifications().filter((n) => {
      switch (tab) {
        case 'unread':
          return n.unread;
        case 'registrations':
          return n.type === 'registration';
        case 'reminders':
          return n.type === 'reminder';
        case 'updates':
          return n.type === 'update';
        case 'waitlist':
          return n.type === 'waitlist';
        case 'completed':
          return n.type === 'completed';
        default:
          return true;
      }
    });
  });

  /* ---------- DEBUG / SIDE EFFECT ---------- */

  constructor() {
    // Effect removed - no side effects needed for debugging
  }

  markRead(notificationId: number) {
    this.notifications.update((list) =>
      list.map((n) => (n.id === notificationId ? { ...n, unread: false } : n))
    );
  }

  handleAction(event: { notificationId: number; action: string }) {
    // TODO: Implement action handling (route / API / dialog)
  }
  /* ---------- EXAMPLE: derived signal ---------- */

  /** This is how you would later sort/filter notifications */
  queryState = computed(() => ({
    tab: this.activeTab(),
    sort: this.sortSignal(),
  }));
}
