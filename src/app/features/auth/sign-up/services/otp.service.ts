import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OtpService {
  private generatedOtp: string | null = null;

  sendOtp(phone: string): Observable<void> {
    // simulate server generating OTP
    this.generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Mock OTP:', this.generatedOtp); // for training
    return of(void 0).pipe(delay(1000)); // simulate network delay
  }

  validateOtp(enteredOtp: string): boolean {
    return enteredOtp === this.generatedOtp;
  }
}
