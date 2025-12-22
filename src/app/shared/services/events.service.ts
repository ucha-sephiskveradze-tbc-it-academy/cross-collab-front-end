import { Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { IEventItem } from '../ui/event-card/model/event.mode';
import { environment } from '../../../environments/environment.test';

@Injectable({ providedIn: 'root' })
export class EventService {
  events = httpResource<IEventItem[]>(() => ({
    url: `${environment.apiUrl}/events`,
    method: 'GET',
  }));
}
