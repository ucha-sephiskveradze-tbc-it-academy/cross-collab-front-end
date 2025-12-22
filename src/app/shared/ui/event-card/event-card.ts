import { Component, inject, Input } from '@angular/core';
import { IEventItem } from './model/event.mode';
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
    return this.event.capacity - this.event.registeredCount;
  }

  goToDetails(id: number) {
    this.router.navigate(['/events', id]);
  }
}
