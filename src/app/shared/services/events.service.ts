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
      ids.forEach(id => {
        queryParams.append('EventTypeIds', String(id));
      });
    }
    
    // Locations
    const locations = params['Locations'] as string[] | undefined;
    if (locations && locations.length > 0) {
      locations.forEach(loc => {
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
      capacityAvailability.forEach(cap => {
        queryParams.append('CapacityAvailability', cap);
      });
    }
    
    // MyStatuses - exclude CANCELLED by default unless explicitly included
    const myStatuses = params['MyStatuses'];
    if (myStatuses) {
      const statuses = Array.isArray(myStatuses) ? myStatuses : [myStatuses];
      statuses.forEach(status => {
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
      return response.items.map((item: EventResponse) => this.mapEventResponseToItem(item));
    }

    if (Array.isArray(response)) {
      return response.map((item: EventResponse) => this.mapEventResponseToItem(item));
    }

    return [];
  });

  setQueryParams(params: Record<string, string | string[] | number | number[] | boolean>): void {
    this.queryParams.set(params);
    this.refreshTrigger.update((v) => v + 1);
  }

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
    // Map API status values to component status values
    const mapStatus = (status: string): 'REGISTERED' | 'CANCELLED' | 'NONE' | 'WAITLISTED' => {
      if (!status) return 'NONE';
      
      const normalizedStatus = status.toUpperCase().trim();
      
      // Registered statuses
      if (normalizedStatus === 'CONFIRMED' || normalizedStatus === 'REGISTERED') {
        return 'REGISTERED';
      }
      
      // Cancelled statuses
      if (normalizedStatus === 'CANCELLED' || normalizedStatus === 'CANCELED') {
        return 'CANCELLED';
      }
      
      // Waitlisted status
      if (normalizedStatus === 'WAITLISTED') {
        return 'WAITLISTED';
      }
      
      // Any other status (NOT_REGISTERED, etc.) maps to NONE
      return 'NONE';
    };

    // Handle API response format with startsAt/endsAt (primary format)
    if ('startsAt' in response && 'endsAt' in response) {
      return {
        eventId: response.id || response.eventId || 0,
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
        currentUserStatus: mapStatus(response.myStatus || response.currentUserStatus || 'NOT_REGISTERED'),
      };
    }

    // Handle alternative format with startDateTime/endDateTime
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
        currentUserStatus: mapStatus(response.myStatus || response.currentUserStatus || 'NOT_REGISTERED'),
      };
    }

    // Fallback for any other format
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
      currentUserStatus: mapStatus(response.myStatus || response.currentUserStatus || 'NOT_REGISTERED'),
    };
  }
}
