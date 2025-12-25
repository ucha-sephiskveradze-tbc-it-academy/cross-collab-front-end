import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

import { Header } from '../../../shared/ui/header/header';
import { Footer } from '../../../shared/ui/footer/footer';

import { EventService } from '../../../shared/services/events.service';
import { IEventItem } from '../../../shared/ui/event-card/model/event.model';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { Select } from 'primeng/select';
import { Router } from '@angular/router';
import { DeleteEventService } from './services/delete-event.service.ts';
import { EventResponse } from '../../../shared/models/events';
import { mapEventResponseToItem } from '../../../shared/services/utils/event-mapper.util';
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    TableModule,
    ButtonModule,
    ToolbarModule,
    TagModule,
    InputTextModule,
    InputNumberModule,
    InputIconModule,
    IconFieldModule,
    Select,
    Header,
    Footer,
  ],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {
  eventService = inject(EventService);
  private deleteEventService = inject(DeleteEventService);
  private router = inject(Router);

  statusOptions = [
    { label: 'Registered', value: 'CONFIRMED' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  categoryOptions = [
    { label: 'Conference', value: 'Conference' },
    { label: 'Workshop', value: 'Workshop' },
    { label: 'Meetup', value: 'Meetup' },
  ];

  events = signal<IEventItem[]>([]);
  constructor() {
    effect(() => {
      const response = this.eventsResource.value();
      if (!response) return;

      let items: IEventItem[] = [];

      if (
        typeof response === 'object' &&
        'items' in response &&
        Array.isArray((response as any).items)
      ) {
        items = (response as any).items.map((item: EventResponse) => mapEventResponseToItem(item));
      } else if (Array.isArray(response)) {
        items = response.map((item: EventResponse) => mapEventResponseToItem(item));
      }

      this.events.set(items);
    });
  }

  eventsResource = this.eventService.eventsResource;
  selectedEvents: IEventItem[] = [];

  getCapacityPercent(event: any): number {
    if (!event.capacity) return 0;
    return Math.round((event.totalRegistered / event.capacity) * 100);
  }

  getSpotsLeft(event: any): number {
    return event.capacity - event.totalRegistered;
  }

  getEventStatus(event: any): 'Upcoming' | 'Past' {
    const now = new Date();
    const start = new Date(event.startDateTime);

    return now < start ? 'Upcoming' : 'Past';
  }

  viewPage(eventId: number) {
    this.router.navigate(['/admin/main', eventId]);
  }

  openNew() {
    this.router.navigate(['/admin/new']);
  }

  deleteEvent(eventId: number): void {
    if (!eventId) return;

    this.deleteEventService.deleteEvent(eventId).subscribe({
      next: () => {
        this.events.update((list) => list.filter((e) => e.eventId !== eventId));
      },
      error: (err) => {
        // Handle error silently or add proper error handling
      },
    });
  }

  editEvent(eventId: number) {
    this.router.navigate(['/admin/edit', eventId]);
  }

  deleteSelectedEvents() {
    this.selectedEvents = [];
  }
}
