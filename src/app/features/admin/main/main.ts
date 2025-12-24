import { Component, inject } from '@angular/core';
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
  private router = inject(Router);

  statusOptions = [
    { label: 'Registered', value: 'REGISTERED' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  categoryOptions = [
    { label: 'Conference', value: 'Conference' },
    { label: 'Workshop', value: 'Workshop' },
    { label: 'Meetup', value: 'Meetup' },
  ];

  events = this.eventService.events;
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

  viewPage(event: any) {
    this.router.navigate(['/admin/main', event.id]);
  }

  openNew() {
    this.router.navigate(['/admin/new']);
  }

  editEvent(event: IEventItem) {
    this.router.navigate(['/admin/edit', event.eventId]);
  }

  deleteEvent(event: IEventItem) {
    this.selectedEvents = this.selectedEvents.filter((e) => e !== event);
  }

  deleteSelectedEvents() {
    this.selectedEvents = [];
  }
}
