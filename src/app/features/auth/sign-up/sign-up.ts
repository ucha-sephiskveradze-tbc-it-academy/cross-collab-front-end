import { Component, inject, signal } from '@angular/core';
import { Button } from '../../../shared/ui/button/button';
import { form, required, email, minLength, pattern, Field, validate } from '@angular/forms/signals';
import { SignupFormModel } from './models/signup-form.model';
import { mapToDto } from './mapper/signup.mapper';
import { AuthService } from '../../../core/services/auth.service';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputOtpModule } from 'primeng/inputotp';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { OtpService } from './services/otp.service';
import { Departments } from './models/departments';
import { noEmojiRegex } from '../../../shared/validations/validator';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [Button, Field, CheckboxModule, FloatLabelModule, InputOtpModule, RouterLink],
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.scss'],
})
export class SignUp {
  private authService = inject(AuthService);
  private destroyed$ = new Subject<void>();
  private otpService = inject(OtpService);
  private router = inject(Router);
  sentOtp = signal<string | null>(null);

  departments = Departments;

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
    required(schema.firstName, { message: 'First name is required' });
    pattern(schema.firstName, noEmojiRegex, {
      message: 'First name must not contain emojis or special characters',
    });

    required(schema.lastName, { message: 'Last name is required' });
    pattern(schema.lastName, noEmojiRegex, {
      message: 'Last name must not contain emojis or special characters',
    });

    required(schema.email, { message: 'Email is required' });
    pattern(schema.email, noEmojiRegex, { message: 'Emojis are restricted' });
    email(schema.email, { message: 'Please enter a valid email address' });

    required(schema.phone, { message: 'Phone number is required' });
    validate(schema.phone, ({ value }) => {
      const phone = value().trim();
      // Format: +995577966977 (starts with +, then 10-15 digits, no spaces)
      const regex = /^\+[0-9]{10,15}$/;
      if (!regex.test(phone)) {
        return {
          kind: 'invalidPhone',
          message: 'Phone number must start with country code (e.g., +995123456789)',
        };
      }
      return null;
    });

    minLength(schema.otp, 6, { message: 'OTP must be 6 digits' });

    required(schema.department, { message: 'Department is required' });

    required(schema.password, { message: 'Password is required' });
    pattern(schema.password, noEmojiRegex, { message: 'No Emojis allowed in Password' });
    minLength(schema.password, 8, { message: 'Password must be at least 8 characters' });

    pattern(schema.password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
      message: 'Password must contain uppercase, lowercase, and a number',
    });

    required(schema.confirmPassword, { message: 'Please confirm your password' });

    required(schema.termsAccepted);

    validate(schema.confirmPassword, ({ value, valueOf }) => {
      const confirmPassword = value();
      const password = valueOf(schema.password);
      if (confirmPassword !== password) {
        return {
          kind: 'passwordMismatch',
          message: 'Passwords do not match',
        };
      }
      return null;
    });
  });

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.createAccountForm().valid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const dto = mapToDto(this.createAccountModel());

    this.authService
      .register({
        userName: dto.userName,
        email: dto.email,
        password: dto.password,
        department: dto.department,
        phoneNumber: dto.phoneNumber,
        oneTimePassword: dto.oneTimePassword,
      })
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: (response) => {
          this.router.navigate(['/login']);
        },
        error: (err) => {
          // Extract error message from various possible formats
          let errorMessage = 'Failed to create account. Please try again later.';
          if (err.error) {
            if (err.error.message) {
              errorMessage = err.error.message;
            } else if (err.error.errors) {
              // Handle validation errors object
              const errors = err.error.errors;
              const errorMessages = Object.keys(errors).map((key) =>
                Array.isArray(errors[key]) ? errors[key].join(', ') : errors[key]
              );
              errorMessage = errorMessages.join('; ') || errorMessage;
            } else if (typeof err.error === 'string') {
              errorMessage = err.error;
            }
          } else if (err.message) {
            errorMessage = err.message;
          }

          this.errorMessage.set(errorMessage);
        },
      });
  }

  sendOtp() {
    const phone = this.createAccountForm.phone(); // get phone field value
    if (!phone || phone.invalid()) {
      this.errorMessage.set('Please enter a valid phone number first');
      return;
    }

    // Get value from field, fallback to model signal
    let phoneNumber = phone.value();
    if (!phoneNumber || phoneNumber.trim() === '') {
      phoneNumber = this.createAccountModel().phone;
    }

    if (!phoneNumber || phoneNumber.trim() === '') {
      this.errorMessage.set('Please enter a valid phone number first');
      return;
    }

    this.errorMessage.set(null);
    this.otpService.sendOtp(phoneNumber.trim()).subscribe({
      next: () => {
        // start your timer after sending
        this.startTimer();
        this.errorMessage.set(null);
      },
      error: (err) => {
        // Check for CORS errors (status 0 typically indicates CORS/network issues)
        if (err.status === 0 || err.statusText === 'Unknown Error') {
          this.errorMessage.set(
            'Unable to connect to the server. This may be a CORS configuration issue. Please contact support or try again later.'
          );
          return;
        }

        // Handle backend validation errors
        const errorMessage =
          err.error?.errors?.phoneNumber?.[0] ||
          err.error?.message ||
          err.error?.title ||
          err.message ||
          'Failed to send OTP. Please try again later.';
        this.errorMessage.set(errorMessage);
      },
    });
  }

  startTimer() {
    // Disable resend
    this.isResendDisabled.set(true);

    let remaining = 5 * 60 - 1; // 5 minutes in seconds

    // Immediately show initial value
    this.updateTimerText(remaining);
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
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
