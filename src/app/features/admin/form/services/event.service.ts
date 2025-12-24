import { Injectable, signal, inject } from '@angular/core';
import { httpResource, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.test';
import { CreateEventRequest } from '../model/create-event.model';
import { EventResponse } from '../model/event-response.model';

/**
 * Service for creating and managing events via backend API
 * Uses HttpClient for POST/PUT, httpResource (signals) for GET
 */
@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);

  // Signal for fetching a single event by ID (GET request - uses signals)
  private getEventByIdRequest = signal<number | null>(null);
  
  getEventById = httpResource<EventResponse>(() => {
    const id = this.getEventByIdRequest();
    if (!id) return undefined;

    return {
      url: `${environment.apiUrl}/events/${id}`,
      method: 'GET',
    };
  });

  /**
   * Creates a new event (POST request - uses HttpClient)
   */
  create(event: CreateEventRequest): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/events`, event, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Updates an existing event (PUT request - uses HttpClient)
   */
  update(id: number, event: CreateEventRequest): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/events/${id}`, event, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Triggers fetching an event by ID (GET request - uses signals)
   */
  fetchById(id: number): void {
    this.getEventByIdRequest.set(id);
  }
}
