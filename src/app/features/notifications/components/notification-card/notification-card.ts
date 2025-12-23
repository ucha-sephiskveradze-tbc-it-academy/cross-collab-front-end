import { Component, computed, EventEmitter, Input, Output } from '@angular/core';
import { Notification } from '../../models/notification.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-card',
  imports: [CommonModule],
  templateUrl: './notification-card.html',
  styleUrl: './notification-card.scss',
})
export class NotificationCard {
  @Input({ required: true }) notification!: Notification;

  @Output() markAsRead = new EventEmitter<number>();
  @Output() actionClick = new EventEmitter<{
    notificationId: number;
    action: string;
  }>();

  icon = computed(() => {
    switch (this.notification.type) {
      case 'registration':
        return 'pi-check';
      case 'reminder':
        return 'pi-bell';
      case 'update':
        return 'pi-info-circle';
      case 'waitlist':
        return 'pi-clock';
      case 'completed':
        return 'pi-star';
      default:
        return 'pi-info';
    }
  });

  onAction(action: string) {
    this.actionClick.emit({
      notificationId: this.notification.id,
      action,
    });
  }

  onMarkRead() {
    this.markAsRead.emit(this.notification.id);
  }
}
