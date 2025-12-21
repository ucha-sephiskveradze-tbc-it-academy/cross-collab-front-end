import { Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { IEventItem } from '../../shares/ui/event-card/model/event.mode';

@Injectable({ providedIn: 'root' })
export class EventService {
  events = httpResource<IEventItem[]>(() => ({
    url: 'http://localhost:3000/events',
    method: 'GET',
  }));
}
