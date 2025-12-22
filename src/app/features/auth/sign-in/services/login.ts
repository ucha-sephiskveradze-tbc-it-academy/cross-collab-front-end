import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ILoginFormModel } from '../models/login-form.model';

@Injectable({
  providedIn: 'root',
})
export class Login {
  private http = inject(HttpClient);

  login(email: string, password: string): Observable<any> {
    return this.http.get<ILoginFormModel[]>(
      `http://localhost:3000/users?email=${email}&password=${password}`
    );
  }
}
