import { Injectable, signal, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { IEventItem } from '../ui/event-card/model/event.model';
import { environment } from '../../../environments/environment.test';
import { PaginatedEventResponse, EventResponse } from '../models/events';
import { mapEventResponseToItem } from './utils/event-mapper.util';

@Injectable({ providedIn: 'root' })
export class EventListService {
  private refreshTrigger = signal(0);
  private queryParams = signal<Record<string, string | string[]>>({});

  eventsResource = httpResource<PaginatedEventResponse>(() => {
    this.refreshTrigger();
    const params = this.queryParams();
    
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.set('SortBy', 'START_DATE');
    
    // Exclude CANCELLED by default unless explicitly included
    const myStatuses = params['MyStatuses'] as string[] | undefined;
    if (myStatuses && myStatuses.length > 0) {
      // If user explicitly selected statuses, use them
      myStatuses.forEach(status => {
        queryParams.append('MyStatuses', status);
      });
    } else {
      // Default: exclude CANCELLED
      queryParams.append('MyStatuses', 'NOT_REGISTERED');
      queryParams.append('MyStatuses', 'CONFIRMED');
      queryParams.append('MyStatuses', 'WAITLISTED');
    }
    
    // Add other query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'MyStatuses' && value) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, String(v)));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
    
    return {
      url: `${environment.apiUrl}/events?${queryParams.toString()}`,
      method: 'GET',
    };
  });

  events = computed<IEventItem[]>(() => {
    const response = this.eventsResource.value();
    if (!response) return [];

    if (response && typeof response === 'object' && 'items' in response && Array.isArray(response.items)) {
      return response.items.map((item: EventResponse) => mapEventResponseToItem(item));
    }

    if (Array.isArray(response)) {
      return response.map((item: EventResponse) => mapEventResponseToItem(item));
    }

    return [];
  });

  setQueryParams(params: Record<string, string | string[]>): void {
    this.queryParams.set(params);
    this.refreshTrigger.update((v) => v + 1);
  }

  refresh(): void {
    this.refreshTrigger.update((v) => v + 1);
  }
}
