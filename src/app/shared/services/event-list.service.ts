import { Injectable, signal, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { IEventItem } from '../ui/event-card/model/event.model';
import { environment } from '../../../environments/environment.test';
import { PaginatedEventResponse, EventResponse } from '../models/events';
import { mapEventResponseToItem } from './utils/event-mapper.util';

@Injectable({ providedIn: 'root' })
export class EventListService {
  private refreshTrigger = signal(0);

  eventsResource = httpResource<PaginatedEventResponse>(() => {
    this.refreshTrigger();
    return {
      url: `${environment.apiUrl}/events?SortBy=START_DATE`,
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

  refresh(): void {
    this.refreshTrigger.update((v) => v + 1);
  }
}
