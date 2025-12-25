import { Component, computed, Input } from '@angular/core';
import { IEventDetails } from '../../models/event-details.model';
import { Button } from '../../../../shared/ui/button/button';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-event-sidebar',
  imports: [Button, DatePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Input({ required: true }) event!: IEventDetails;

  onRegister() {
    // TODO: Implement event registration when backend is ready
    // this.eventDetailsService.register(this.event.eventId)
  }

  onContactOrganizer() {
    // TODO: Implement contact organizer functionality
  }

  getDuration(): string {
    const start = new Date(this.event.startDateTime);
    const end = new Date(this.event.endDateTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours === 0) {
      return `${diffMinutes} minutes`;
    } else if (diffMinutes === 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${diffMinutes} minute${
        diffMinutes > 1 ? 's' : ''
      }`;
    }
  }

  getStatusLabel(): string {
    switch (this.event.currentUserStatus) {
      case 'CONFIRMED':
        return 'Registered';
      case 'WAITLISTED':
        return 'Waitlisted';
      case 'NOT_REGISTERED':
        return 'Not Registered';
      case 'NONE':
      default:
        return 'Not Registered';
    }
  }

  getRegistrationStatus(): string {
    const now = new Date();
    const registrationEnd = new Date(this.event.registrationEnd);
    return registrationEnd > now ? 'Open' : 'Closed';
  }

  getRegistrationStatusClass(): string {
    const now = new Date();
    const registrationEnd = new Date(this.event.registrationEnd);
    return registrationEnd > now ? 'status-open' : 'status-closed';
  }

  getOrganizerInitials(): string {
    if (!this.event.organizer) return '';
    return this.event.organizer.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getFunkyAvatar(name: string): string {
    // Human-like profile picture
    const seed = name.toLowerCase().replace(/\s+/g, '');
    // Using "personas" style for human avatar
    return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  }
}
