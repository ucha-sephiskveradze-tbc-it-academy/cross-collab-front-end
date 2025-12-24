import { Injectable, inject } from '@angular/core';
import { EventListService } from './event-list.service';
import { EventCreateService } from './event-create.service';
import { EventUpdateService } from './event-update.service';
import { IEventItem } from '../ui/event-card/model/event.model';
import { CreateEventRequest } from '../models/events';
import { computed } from '@angular/core';

/**
 * Facade service that combines event list, create, and update services
 * for backward compatibility and convenience
 */
@Injectable({ providedIn: 'root' })
export class EventService {
  private listService = inject(EventListService);
  private createService = inject(EventCreateService);
  private updateService = inject(EventUpdateService);

  // Expose list service properties
  eventsResource = this.listService.eventsResource;
  events = this.listService.events;

  // Expose create service properties
  createEvent = this.createService.createEvent;

  // Expose update service properties
  updateEvent = this.updateService.updateEvent;

  // Expose methods
  refresh(): void {
    this.listService.refresh();
  }

  create(payload: CreateEventRequest): void {
    this.createService.create(payload);
  }

  update(id: number, payload: CreateEventRequest): void {
    this.updateService.update(id, payload);
  }
}
