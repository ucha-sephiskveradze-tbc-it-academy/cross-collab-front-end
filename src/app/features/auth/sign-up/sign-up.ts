import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Button } from '../../../shared/ui/button/button';
import { form, required, email, minLength, pattern, Field } from '@angular/forms/signals';
import { SignupFormModel } from './models/signup-form.model';
import { mapToDto } from './mapper/signup.mapper';
import { AuthService } from './services/auth.service';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputOtpModule } from 'primeng/inputotp';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { tap } from 'rxjs';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    Button,
    Field,
    CheckboxModule,
    FloatLabelModule,
    InputOtpModule,
    RouterLink,
  ],
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.scss'],
})
export class SignUp {
  private authService = inject(AuthService);
  private destroyed$ = new Subject<void>();

  timerText = signal('');
  isResendDisabled = signal(false);
  private countdownInterval: any;

  createAccountModel = signal<SignupFormModel>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    otp: '',
    department: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  createAccountForm = form(this.createAccountModel, (schema) => {
    required(schema.firstName);
    required(schema.lastName);
    required(schema.email);
    email(schema.email);
    required(schema.phone);
    minLength(schema.otp, 6);
    required(schema.department);
    required(schema.password);
    minLength(schema.password, 8);
    pattern(schema.password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/);
    required(schema.confirmPassword);
    required(schema.termsAccepted);
  });

  isSubmitting = signal(false);

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.createAccountForm().valid()) return;

    const dto = mapToDto(this.createAccountModel());
    this.authService.createAccount(dto).pipe(takeUntil(this.destroyed$)).subscribe();
  }

  startTimer() {
    // Disable resend
    this.isResendDisabled.set(true);

    let remaining = 5 * 60 - 1; // 5 minutes in seconds

    // Immediately show initial value
    this.updateTimerText(remaining);

    // Clear any previous interval
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    // Start countdown
    this.countdownInterval = setInterval(() => {
      remaining--;

      if (remaining <= 0) {
        clearInterval(this.countdownInterval);
        this.timerText.set('');
        this.isResendDisabled.set(false); // enable resend again
      } else {
        this.updateTimerText(remaining);
      }
    }, 1000);
  }

  private updateTimerText(seconds: number) {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    this.timerText.set(`${m}:${s}`);
  }
  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
