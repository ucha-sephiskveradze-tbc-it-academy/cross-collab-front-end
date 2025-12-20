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
    this.authService.createAccount(dto).subscribe({
      next: () => console.log('Account created'),
      error: (err: unknown) => console.error('Signup failed', err),
    });
  }
}
