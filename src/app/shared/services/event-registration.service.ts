import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.test';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventRegistrationService {
  registering = signal(false);
  unregistering = signal(false);
  lastRegisterStatus = signal<number | null>(null);
  lastUnregisterStatus = signal<number | null>(null);
  lastRegisterEventId = signal<number | null>(null);
  lastUnregisterEventId = signal<number | null>(null);

  constructor(private http: HttpClient) {}

  async register(eventId: number): Promise<number> {
    this.registering.set(true);
    try {
      const resp = await firstValueFrom(
        this.http.post(`${environment.apiUrl}/events/${eventId}/registrations`, null, {
          observe: 'response',
          responseType: 'text',
        })
      );
      this.lastRegisterStatus.set(resp.status);
      this.lastRegisterEventId.set(eventId);
      return resp.status;
    } finally {
      this.registering.set(false);
    }
  }

  async unregister(eventId: number): Promise<number> {
    this.unregistering.set(true);
    try {
      const resp = await firstValueFrom(
        this.http.delete(`${environment.apiUrl}/events/${eventId}/registrations`, {
          observe: 'response',
          responseType: 'text',
        })
      );
      this.lastUnregisterStatus.set(resp.status);
      this.lastUnregisterEventId.set(eventId);
      return resp.status;
    } finally {
      this.unregistering.set(false);
    }
  }
}
