import { Component, Input } from '@angular/core';
import { IEventItem } from './model/event.mode';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-card',
  imports: [CommonModule],
  templateUrl: './event-card.html',
  styleUrl: './event-card.scss',
})
export class EventCard {
  @Input({ required: true }) event!: IEventItem;

  get spotsLeft(): number {
    return this.event.capacity - this.event.registeredCount;
  }
}
