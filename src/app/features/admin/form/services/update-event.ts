import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment.test';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UpdateEvent {
  private http = inject(HttpClient);

  updateEvent(payload: any): Observable<HttpResponse<any>> {
    return this.http.post(`${environment.apiUrl}/events/update-event`, payload, {
      observe: 'response',
    });
  }
}
