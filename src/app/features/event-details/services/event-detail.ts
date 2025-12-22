import { httpResource } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.test';
import { IEventDetails } from '../models/event-details.model';

@Injectable({
  providedIn: 'root',
})
export class EventDetailService {
  private eventId = signal<number | null>(null);

  eventResource = httpResource<IEventDetails[]>(() => {
    const id = this.eventId();
    if (!id) return undefined;

    return {
      url: `${environment.apiUrl}/events?eventId=${id}`,
      method: 'GET',
    };
  });

  loadEvent(id: number) {
    this.eventId.set(id);
  }
}
