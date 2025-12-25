import { Injectable, signal, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { IEventItem } from '../ui/event-card/model/event.model';
import { environment } from '../../../environments/environment.test';
import { PaginatedEventResponse, EventResponse } from '../models/events';
import { mapEventResponseToItem } from './utils/event-mapper.util';
import { buildEventsQueryParams } from './utils/query-builder.util';

@Injectable({ providedIn: 'root' })
export class EventListService {
  private refreshTrigger = signal(0);
  private queryParams = signal<Record<string, string | string[] | number | number[] | boolean>>({});

  eventsResource = httpResource<PaginatedEventResponse>(() => {
    this.refreshTrigger();
    const params = this.queryParams();
    const queryParams = buildEventsQueryParams(params);

    return {
      url: `${environment.apiUrl}/events?${queryParams.toString()}`,
      method: 'GET',
    };
  });

  events = computed<IEventItem[]>(() => {
    const response = this.eventsResource.value();
    if (!response) return [];

    if (
      response &&
      typeof response === 'object' &&
      'items' in response &&
      Array.isArray(response.items)
    ) {
      const items = response.items.map((item: EventResponse) => mapEventResponseToItem(item));
      return items;
    }

    if (Array.isArray(response)) {
      const items = response.map((item: EventResponse) => mapEventResponseToItem(item));
      return items;
    }

    return [];
  });

  setQueryParams(params: Record<string, string | string[] | number | number[] | boolean>): void {
    this.queryParams.set(params);
    this.refreshTrigger.update((v) => v + 1);
  }

  resetQueryParams(): void {
    this.queryParams.set({});
    this.refreshTrigger.update((v) => v + 1);
  }

  refresh(): void {
    this.refreshTrigger.update((v) => v + 1);
  }
}
