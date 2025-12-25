import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment.test';

export type CreateAgendaPayload = {
  startTime: string;
  duration: string;
  title: string;
  description: string;
  type: string;
  location: string;
  agendaTracks: { title: string; speaker: string; room: string }[];
};

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private http = inject(HttpClient);

  createAgenda(eventId: number, payload: CreateAgendaPayload) {
    return this.http.post(`${environment.apiUrl}/events/${eventId}/create-agenda`, payload);
  }
}
