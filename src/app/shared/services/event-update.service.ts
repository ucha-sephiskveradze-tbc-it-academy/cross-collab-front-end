import { Injectable, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment.test';
import { EventResponse, CreateEventRequest } from '../models/events';

@Injectable({ providedIn: 'root' })
export class EventUpdateService {
  private updateTrigger = signal(0);
  private updatePayload = signal<{ id: number; payload: CreateEventRequest } | null>(null);

  updateEvent = httpResource<EventResponse>(() => {
    const trigger = this.updatePayload();
    if (!trigger) return undefined;

    return {
      url: `${environment.apiUrl}/events/${trigger.id}`,
      method: 'PUT',
      body: trigger.payload,
    };
  });

  update(id: number, payload: CreateEventRequest): void {
    this.updatePayload.set({ id, payload });
    this.updateTrigger.update((v) => v + 1);
  }
}
