import { Injectable, signal, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment.test';
import { EventResponse } from '../models/events';

@Injectable({ providedIn: 'root' })
export class EventByIdService {
  private eventIdTrigger = signal<number | null>(null);
  private refreshTrigger = signal(0);

  eventResource = httpResource<EventResponse>(() => {
    this.refreshTrigger();
    const id = this.eventIdTrigger();
    
    if (id === null) {
      return undefined;
    }

    return {
      url: `${environment.apiUrl}/events/${id}`,
      method: 'GET',
    };
  });

  event = computed<EventResponse | null>(() => {
    return this.eventResource.value() || null;
  });

  getEventById(id: number): void {
    this.eventIdTrigger.set(id);
    this.refreshTrigger.update((v) => v + 1);
  }
}

