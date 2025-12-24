import { Injectable, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment.test';
import { EventResponse, CreateEventRequest } from '../models/events';

@Injectable({ providedIn: 'root' })
export class EventCreateService {
  private createTrigger = signal(0);
  private createPayload = signal<CreateEventRequest | null>(null);

  createEvent = httpResource<EventResponse>(() => {
    this.createTrigger();
    const payload = this.createPayload();
    if (!payload) return undefined;

    return {
      url: `${environment.apiUrl}/events`,
      method: 'POST',
      body: payload,
    };
  });

  create(payload: CreateEventRequest): void {
    this.createPayload.set(payload);
    this.createTrigger.update((v) => v + 1);
  }
}
