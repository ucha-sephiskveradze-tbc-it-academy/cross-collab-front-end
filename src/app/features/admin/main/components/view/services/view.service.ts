import { httpResource } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../../../../../../environments/environment.test';
import { IEventDetails } from '../../../../../event-details/models/event-details.model';

@Injectable()
export class ViewService {
  private id = signal<number | null>(null);

  event = httpResource<IEventDetails>(() => {
    const id = this.id();
    if (id === null) return undefined;

    return {
      url: `${environment.apiUrl}/events/${id}`,
      method: 'GET',
    };
  });

  load(id: number) {
    this.id.set(id);
  }
}
