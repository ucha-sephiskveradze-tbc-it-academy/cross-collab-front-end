import { Component, inject, Input } from '@angular/core';
import { IEventItem } from './model/event.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Button } from '../../../shared/ui/button/button';

@Component({
  selector: 'app-event-card',
  imports: [CommonModule, Button],
  templateUrl: './event-card.html',
  styleUrl: './event-card.scss',
})
export class EventCard {
  private router = inject(Router);

  @Input({ required: true }) event!: IEventItem;

  get spotsLeft(): number {
    return this.event.capacity - this.event.totalRegistered;
  }

  get statusLabel(): string {
    switch (this.event.currentUserStatus) {
      case 'REGISTERED':
        return 'Registered';
      case 'WAITLISTED':
        return 'Waitlisted';
      case 'CANCELLED':
        return 'Cancelled';
      case 'NONE':
        return 'Not Registered';
      default:
        return 'Not Registered';
    }
  }

  get statusClass(): string {
    switch (this.event.currentUserStatus) {
      case 'REGISTERED':
        return 'registered';
      case 'WAITLISTED':
        return 'waitlisted';
      case 'CANCELLED':
        return 'cancelled';
      case 'NONE':
        return 'not-registered';
      default:
        return 'not-registered';
    }
  }

  goToDetails() {
    this.router.navigate(['/events', this.event.eventId]);
  }
}
