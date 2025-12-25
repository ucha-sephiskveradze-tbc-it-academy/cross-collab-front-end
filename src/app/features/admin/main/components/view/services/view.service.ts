import { httpResource } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../../../../../../environments/environment.test';
import { ApiGroupedParticipantsResponse } from '../models/participants.model';

@Injectable()
export class ViewService {
  private id = signal<number | null>(null);

  participants = httpResource<ApiGroupedParticipantsResponse>(() => {
    const id = this.id();
    if (id === null) return undefined;

    return {
      url: `${environment.apiUrl}/events/${id}/registrations/grouped`,
      method: 'GET',
    };
  });

  load(id: number) {
    this.id.set(id);
  }
}
