import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.test';

@Injectable({
  providedIn: 'root',
})
export class DeleteEventService {
  private http = inject(HttpClient);

  deleteEvent(eventId: number): Observable<void> {
    const params = new HttpParams().set('id', eventId.toString());
    return this.http.delete<void>(`${environment.apiUrl}/events/delete-event`, { params });
  }
}
