import { Component, inject, signal } from '@angular/core';
import { Field, form, required, email, minLength, pattern } from '@angular/forms/signals';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from '../../../shared/ui/button/button';
import { CheckboxModule } from 'primeng/checkbox';
import { Router, RouterLink } from '@angular/router';
import { ILoginFormModel } from './models/login-form.model';
import { AuthService } from '../../../core/services/auth.service';
import { take, finalize } from 'rxjs';
import { noEmojiRegex } from '../../../shared/validations/validator';
import { AuthTokenService } from '../../../core/services/auth-token.service';

@Component({
  selector: 'app-sign-in',
  imports: [InputTextModule, CheckboxModule, ButtonModule, Field, Button, RouterLink],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {
  private router = inject(Router);
  private authService = inject(AuthService);
  private authTokenService = inject(AuthTokenService);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  // Signal model for login
  model = signal<ILoginFormModel>({
    email: '',
    password: '',
  });

  // Signal form schema
  loginForm = form(this.model, (schema) => {
    required(schema.email);
    email(schema.email);
    pattern(schema.email, noEmojiRegex, { message: 'No Emojis Allowed!' });

    required(schema.password);
    minLength(schema.password, 6);
    pattern(schema.password, noEmojiRegex, { message: 'No Emojis Allowed!' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.loginForm().valid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.model();

    const loginPayload = { email, password };
    console.log('🔐 [LOGIN] Sending authentication request:', {
      email: loginPayload.email,
      password: '***hidden***',
      timestamp: new Date().toISOString(),
    });

    const credentials = {
      email: this.loginForm.email().value(),
      password: this.loginForm.password().value(),
    };

    this.authService.authenticate(credentials).subscribe({
      next: (res) => {
        // Handle both accessToken and access_token formats
        const token = res?.accessToken || res?.access_token;
        
        if (!token) {
          console.error('❌ No access token in response', res);
          this.errorMessage.set('Invalid response from server. Please try again.');
          this.isSubmitting.set(false);
          return;
        }

        console.log('✅ [LOGIN] Token received, storing...');
        this.authService.setToken(token);
        console.log('💾 [LOGIN] Token stored');

        // Wait a moment for token to be stored, then get role
        setTimeout(() => {
          const role = this.authTokenService.getRole();
          console.log('🔓 [LOGIN] Decoded role:', role);

          if (role === 'Admin') {
            console.log('🚀 [LOGIN] Admin detected, navigating to /admin/main');
            this.router.navigate(['/admin/main']);
          } else {
            console.log('🚀 [LOGIN] Navigating to /dashboard');
            this.router.navigate(['/dashboard']);
          }
          
          this.isSubmitting.set(false);
        }, 100);
      },
      error: (err) => {
        console.error('❌ [LOGIN] Authentication failed:', err);
        this.errorMessage.set(err.error?.message || err.message || 'Invalid email or password. Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }
}
