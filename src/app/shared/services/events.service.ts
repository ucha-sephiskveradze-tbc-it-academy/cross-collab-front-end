import { Injectable, inject } from '@angular/core';
import { EventListService } from './event-list.service';
import { EventCreateService } from './event-create.service';
import { EventUpdateService } from './event-update.service';
import { EventByIdService } from './event-by-id.service';
import { CreateEventRequest } from '../models/events';

@Injectable({ providedIn: 'root' })
export class EventService {
  private listService = inject(EventListService);
  private createService = inject(EventCreateService);
  private updateService = inject(EventUpdateService);
  private byIdService = inject(EventByIdService);

  get events() {
    return this.listService.events;
  }

  get eventsResource() {
    return this.listService.eventsResource;
  }

  get createEvent() {
    return this.createService.createEvent;
  }

  get updateEvent() {
    return this.updateService.updateEvent;
  }

  get getEventByIdResource() {
    return this.byIdService.eventResource;
  }

  setQueryParams(params: Record<string, string | string[] | number | number[] | boolean>): void {
    this.listService.setQueryParams(params);
  }

  resetQueryParams(): void {
    this.listService.resetQueryParams();
  }

  refresh(): void {
    this.listService.refresh();
  }

  create(payload: CreateEventRequest): void {
    this.createService.create(payload);
  }

  update(id: number, payload: CreateEventRequest): void {
    this.updateService.update(id, payload);
  }

  getEventById(id: number): void {
    this.byIdService.getEventById(id);
  }
}
