import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Button } from '../../../shared/ui/button/button';
import { form, required, email, minLength, pattern, Field, validate } from '@angular/forms/signals';
import { SignupFormModel } from './models/signup-form.model';
import { mapToDto } from './mapper/signup.mapper';
import { AuthService } from './services/auth.service';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputOtpModule } from 'primeng/inputotp';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { tap } from 'rxjs';
import { OtpService } from './services/otp.service';
import { Departments } from './models/departments';

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
    required(schema.lastName, { message: 'Last name is required' });

    required(schema.email, { message: 'Email is required' });
    email(schema.email, { message: 'Please enter a valid email address' });

    required(schema.phone, { message: 'Phone number is required' });

    minLength(schema.otp, 6, { message: 'OTP must be 6 digits' });
    // validate(schema.otp, ({ value }) => {
    //   const enteredOtp = value();
    //   const sentOtp = this.sentOtp(); // signal holding last sent OTP
    //   if (!sentOtp) {
    //     return {
    //       kind: 'otpNotSent',
    //       message: 'Please request an OTP first',
    //     };
    //   }
    //   if (enteredOtp !== sentOtp) {
    //     return {
    //       kind: 'otpMismatch',
    //       message: 'OTP does not match the code sent',
    //     };
    //   }
    //   return null;
    // });

    required(schema.department, { message: 'Department is required' });

    required(schema.password, { message: 'Password is required' });
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
  click: any;

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.createAccountForm().valid()) return;

    const dto = mapToDto(this.createAccountModel());
    this.authService
      .createAccount(dto)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.router.navigate(['/login']));
  }

  sendOtp() {
    const phone = this.createAccountForm.phone(); // get phone field value
    if (!phone) {
      alert('Please enter your phone number first');
      return;
    }

    this.otpService.sendOtp(phone.value()).subscribe({
      next: () => {
        // start your timer after sending
        this.startTimer();
      },
      error: () => {
        alert('Failed to send OTP');
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

  // test() {
  //   console.log(
  //     'First Name:',
  //     this.createAccountForm.firstName().value(),
  //     this.createAccountForm.firstName().valid(),
  //     this.createAccountForm.firstName().errors()
  //   );
  //   console.log(
  //     'Last Name:',
  //     this.createAccountForm.lastName().value(),
  //     this.createAccountForm.lastName().valid(),
  //     this.createAccountForm.lastName().errors()
  //   );
  //   console.log(
  //     'Email:',
  //     this.createAccountForm.email().value(),
  //     this.createAccountForm.email().valid(),
  //     this.createAccountForm.email().errors()
  //   );
  //   console.log(
  //     'Phone:',
  //     this.createAccountForm.phone().value(),
  //     this.createAccountForm.phone().valid(),
  //     this.createAccountForm.phone().errors()
  //   );
  //   console.log(
  //     'OTP:',
  //     this.createAccountForm.otp().value(),
  //     this.createAccountForm.otp().valid(),
  //     this.createAccountForm.otp().errors()
  //   );
  //   console.log(
  //     'Department:',
  //     this.createAccountForm.department().value(),
  //     this.createAccountForm.department().valid(),
  //     this.createAccountForm.department().errors()
  //   );
  //   console.log(
  //     'Password:',
  //     this.createAccountForm.password().value(),
  //     this.createAccountForm.password().valid(),
  //     this.createAccountForm.password().errors()
  //   );
  //   console.log(
  //     'Confirm Password:',
  //     this.createAccountForm.confirmPassword().value(),
  //     this.createAccountForm.confirmPassword().valid(),
  //     this.createAccountForm.confirmPassword().errors()
  //   );
  //   console.log(
  //     'Terms Accepted:',
  //     this.createAccountForm.termsAccepted().value(),
  //     this.createAccountForm.termsAccepted().valid(),
  //     this.createAccountForm.termsAccepted().errors()
  //   );
  // }
}
