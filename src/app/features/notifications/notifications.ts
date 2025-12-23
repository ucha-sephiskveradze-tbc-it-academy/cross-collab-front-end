import { Component, computed, effect, signal } from '@angular/core';
import { Footer } from '../../shared/ui/footer/footer';
import { Header } from '../../shared/ui/header/header';
import { MOCK_NOTIFICATIONS } from './data/notifications.mock';
import { Notification } from './models/notification.model';
import { toSignal } from '@angular/core/rxjs-interop';

import { SelectModule } from 'primeng/select';
import { NotificationTab, NotificationTabKey } from './models/notification-tab.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-notifications',
  imports: [Footer, Header, SelectModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications {
  activeTab = signal<NotificationTabKey>('all');

  notificationTabs: readonly NotificationTab[] = [
    { key: 'all', label: 'All', count: 47 },
    { key: 'unread', label: 'Unread', count: 8 },
    { key: 'registrations', label: 'Registrations', count: 23 },
    { key: 'reminders', label: 'Reminders', count: 15 },
    { key: 'updates', label: 'Updates', count: 9 },
  ];

  setActiveTab(key: NotificationTabKey) {
    this.activeTab.set(key);
  }

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

  /* ---------- DEBUG / SIDE EFFECT ---------- */

  constructor() {
    effect(() => {
      console.log('Active tab:', this.activeTab());
      console.log('Sort order:', this.sortSignal());
    });
  }

  /* ---------- EXAMPLE: derived signal ---------- */

  /** This is how you would later sort/filter notifications */
  queryState = computed(() => ({
    tab: this.activeTab(),
    sort: this.sortSignal(),
  }));
}
