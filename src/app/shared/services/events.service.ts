import { Injectable, inject, signal, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { EventListService } from './event-list.service';
import { EventCreateService } from './event-create.service';
import { EventUpdateService } from './event-update.service';
import { IEventItem } from '../ui/event-card/model/event.model';
import { CreateEventRequest, PaginatedEventResponse, EventResponse } from '../models/events';
import { environment } from '../../../environments/environment.test';
import { mapEventResponseToItem } from './utils/event-mapper.util';

/**
 * Facade service that combines event list, create, and update services
 * for backward compatibility and convenience
 */
@Injectable({ providedIn: 'root' })
export class EventService {
  private listService = inject(EventListService);
  private createService = inject(EventCreateService);
  private updateService = inject(EventUpdateService);
  
  private refreshTrigger = signal(0);
  private createTrigger = signal(0);
  private updateTrigger = signal(0);
  private queryParams = signal<Record<string, string | string[] | number | number[] | boolean>>({});

  eventsResource = httpResource<PaginatedEventResponse>(() => {
    this.refreshTrigger();
    const params = this.queryParams();

    // Build query string
    const queryParams = new URLSearchParams();

    // SortBy - default to START_DATE
    const sortBy = params['SortBy'] as string | undefined;
    queryParams.set('SortBy', sortBy || 'START_DATE');

    // SortDirection
    if (params['SortDirection']) {
      queryParams.set('SortDirection', String(params['SortDirection']));
    }

    // Search
    if (params['Search']) {
      queryParams.set('Search', String(params['Search']));
    }

    // EventTypeIds (categories)
    const eventTypeIds = params['EventTypeIds'];
    if (eventTypeIds) {
      const ids = Array.isArray(eventTypeIds) ? eventTypeIds : [eventTypeIds];
      ids.forEach((id) => {
        queryParams.append('EventTypeIds', String(id));
      });
    }

    // Locations
    const locations = params['Locations'] as string[] | undefined;
    if (locations && locations.length > 0) {
      locations.forEach((loc) => {
        queryParams.append('Locations', loc);
      });
    }

    // From (date-time)
    if (params['From']) {
      queryParams.set('From', String(params['From']));
    }

    // To (date-time)
    if (params['To']) {
      queryParams.set('To', String(params['To']));
    }

    // CapacityAvailability
    const capacityAvailability = params['CapacityAvailability'] as string[] | undefined;
    if (capacityAvailability && capacityAvailability.length > 0) {
      capacityAvailability.forEach((cap) => {
        queryParams.append('CapacityAvailability', cap);
      });
    }

    // MyStatuses - exclude CANCELLED by default unless explicitly included
    const myStatuses = params['MyStatuses'];
    if (myStatuses) {
      const statuses = Array.isArray(myStatuses) ? myStatuses : [myStatuses];
      statuses.forEach((status) => {
        queryParams.append('MyStatuses', String(status));
      });
    } else {
      // Default: exclude CANCELLED
      queryParams.append('MyStatuses', 'NOT_REGISTERED');
      queryParams.append('MyStatuses', 'CONFIRMED');
      queryParams.append('MyStatuses', 'WAITLISTED');
    }

    // IsActive
    if (params['IsActive'] !== undefined) {
      queryParams.set('IsActive', String(params['IsActive']));
    }

    // Page (default to 1 if not specified, API requires minimum 1)
    const page = params['Page'] !== undefined ? Number(params['Page']) : 1;
    queryParams.set('Page', String(Math.max(1, page))); // Ensure at least page 1

    // PageSize (default to 6 if not specified)
    const pageSize = params['PageSize'] !== undefined ? Number(params['PageSize']) : 6;
    queryParams.set('PageSize', String(pageSize));

    return {
      url: `${environment.apiUrl}/events?${queryParams.toString()}`,
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

  private eventIdTrigger = signal<number | null>(null);

  getEventByIdResource = httpResource<EventResponse>(() => {
    const id = this.eventIdTrigger();
    if (id === null) {
      return undefined;
    }

    return {
      url: `${environment.apiUrl}/events/${id}`,
      method: 'GET',
    };
  });

  getEventById(id: number): void {
    this.eventIdTrigger.set(id);
  }

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
      return response.items.map((item: EventResponse) => mapEventResponseToItem(item));
    }

    if (Array.isArray(response)) {
      return response.map((item: EventResponse) => mapEventResponseToItem(item));
    }

    return [];
  });

  setQueryParams(params: Record<string, string | string[] | number | number[] | boolean>): void {
    this.queryParams.set(params);
    this.refreshTrigger.update((v: number) => v + 1);
  }

  refresh(): void {
    this.refreshTrigger.update((v: number) => v + 1);
  }

  /**
   * Reset query params to defaults (page 1, no filters)
   * Useful when navigating to dashboard or other views that should show all events from page 1
   */
  resetQueryParams(): void {
    this.queryParams.set({});
    this.refreshTrigger.update((v: number) => v + 1);
  }

  create(payload: CreateEventRequest): void {
    this.createPayload.set(payload);
    this.createTrigger.update((v: number) => v + 1);
  }

  update(id: number, payload: CreateEventRequest): void {
    this.updatePayload.set({ id, payload });
    this.updateTrigger.update((v: number) => v + 1);
  }
}
