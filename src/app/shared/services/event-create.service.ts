import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment.test';
import { EventResponse, CreateEventRequest } from '../models/events';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventCreateService {
  private http = inject(HttpClient);

  createEvent(payload: CreateEventRequest): Observable<HttpResponse<EventResponse>> {
    return this.http.post<EventResponse>(`${environment.apiUrl}/events/create-event`, payload, {
      observe: 'response',
    });
  }
}
