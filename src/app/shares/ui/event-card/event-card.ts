import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-event-card',
  imports: [],
  templateUrl: './event-card.html',
  styleUrl: './event-card.scss',
})
export class EventCard {
  @Input({ required: true }) event!: {
    id: number;
    title: string;
    date: string;
    time: string;
    location: string;
    category: string;
    description: string;
    status: string;
    registeredCount: number;
    capacity: number;
  };

  get spotsLeft(): number {
    return this.event.capacity - this.event.registeredCount;
  }
}
