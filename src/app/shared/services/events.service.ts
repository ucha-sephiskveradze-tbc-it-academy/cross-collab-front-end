import { Injectable, signal, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { IEventItem } from '../ui/event-card/model/event.model';
import { environment } from '../../../environments/environment.test';
import { PaginatedEventResponse, EventResponse, CreateEventRequest } from '../models/events';

@Injectable({ providedIn: 'root' })
export class EventService {
  private refreshTrigger = signal(0);
  private createTrigger = signal(0);
  private updateTrigger = signal(0);

  eventsResource = httpResource<PaginatedEventResponse>(() => {
    this.refreshTrigger();

    return {
      url: `${environment.apiUrl}/events`,
      method: 'GET',
    };
  });

  private createPayload = signal<CreateEventRequest | null>(null);

  createEvent = httpResource<EventResponse>(() => {
    this.createTrigger();
    const payload = this.createPayload();

    if (!payload) {
      return undefined;
    }

    return {
      url: `${environment.apiUrl}/events`,
      method: 'POST',
      body: payload,
    };
  });

  private updatePayload = signal<{ id: number; payload: CreateEventRequest } | null>(null);

  updateEvent = httpResource<EventResponse>(() => {
    const trigger = this.updatePayload();
    if (!trigger) {
      return undefined;
    }

    return {
      url: `${environment.apiUrl}/events/${trigger.id}`,
      method: 'PUT',
      body: trigger.payload,
    };
  });

  events = computed<IEventItem[]>(() => {
    const response = this.eventsResource.value();

    if (!response) {
      return [];
    }

    if (
      response &&
      typeof response === 'object' &&
      'items' in response &&
      Array.isArray(response.items)
    ) {
      return response.items.map((item: EventResponse) => this.mapEventResponseToItem(item));
    }

    if (Array.isArray(response)) {
      return response.map((item: EventResponse) => this.mapEventResponseToItem(item));
    }

    return [];
  });

  refresh(): void {
    this.refreshTrigger.update((v) => v + 1);
  }

  create(payload: CreateEventRequest): void {
    this.createPayload.set(payload);
    this.createTrigger.update((v) => v + 1);
  }

  update(id: number, payload: CreateEventRequest): void {
    this.updatePayload.set({ id, payload });
    this.updateTrigger.update((v) => v + 1);
  }

  private mapEventResponseToItem(response: EventResponse | any): IEventItem {
    if ('startsAt' in response && 'endsAt' in response) {
      return {
        eventId: response.id,
        title: response.title || '',
        description: response.description || '',
        startDateTime: response.startsAt,
        endDateTime: response.endsAt,
        location: typeof response.location === 'string' ? response.location : 'Online',
        category: {
          categoryId: response.eventTypeId || 0,
          categoryName: response.eventTypeName || 'Unknown',
        },
        capacity: response.capacity || 0,
        totalRegistered: response.totalRegistered || 0,
        currentUserStatus: response.myStatus || 'NONE',
      };
    }

    if ('startDateTime' in response && 'endDateTime' in response) {
      let locationStr = '';
      if (typeof response.location === 'string') {
        locationStr = response.location;
      } else if (response.location && typeof response.location === 'object') {
        if (
          response.location.locationType === 'Virtual' ||
          response.location.locationType === 'Online'
        ) {
          locationStr = 'Online';
        } else if (response.location.address?.venueName) {
          locationStr = response.location.address.venueName;
        } else {
          locationStr = 'Location TBD';
        }
      }

      let categoryId = 0;
      let categoryName = 'Unknown';

      if (response.category && typeof response.category === 'object') {
        categoryId = response.category.categoryId || 0;
        categoryName = response.category.categoryName || 'Unknown';
      } else if (response.eventTypeId !== undefined) {
        categoryId = response.eventTypeId;
        categoryName = response.eventTypeName || 'Event';
      }

      return {
        eventId:
          response.eventId ||
          (typeof response.id === 'string' ? parseInt(response.id) : response.id) ||
          0,
        title: response.title || '',
        description: response.description || '',
        startDateTime: response.startDateTime,
        endDateTime: response.endDateTime,
        location: locationStr,
        category: {
          categoryId,
          categoryName,
        },
        capacity: response.capacity || 0,
        totalRegistered: response.totalRegistered || 0,
        currentUserStatus: response.currentUserStatus || 'NONE',
      };
    }

    return {
      eventId: response.id || response.eventId || 0,
      title: response.title || '',
      description: response.description || '',
      startDateTime: response.startDateTime || response.startsAt || '',
      endDateTime: response.endDateTime || response.endsAt || '',
      location: typeof response.location === 'string' ? response.location : 'Unknown',
      category: {
        categoryId: response.category?.categoryId || response.eventTypeId || 0,
        categoryName: response.category?.categoryName || response.eventTypeName || 'Unknown',
      },
      capacity: response.capacity || 0,
      totalRegistered: response.totalRegistered || 0,
      currentUserStatus: response.currentUserStatus || response.myStatus || 'NONE',
    };
  }
}
