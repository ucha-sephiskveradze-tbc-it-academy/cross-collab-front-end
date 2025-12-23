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

@Component({
  selector: 'app-sign-in',
  imports: [InputTextModule, CheckboxModule, ButtonModule, Field, Button, RouterLink],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {
  private route = inject(Router);
  private authService = inject(AuthService);

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

    this.authService
      .authenticate(loginPayload)
      .pipe(
        take(1), // auto-unsubscribe
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: (response) => {
          console.log('✅ [LOGIN] Authentication successful:', {
            hasToken: !!response.access_token,
            hasUser: !!response.user,
            user: response.user,
            timestamp: new Date().toISOString(),
          });

          if (response.access_token) {
            console.log('💾 [LOGIN] Storing token and user data');
            this.authService.setToken(response.access_token);
            if (response.user) {
              this.authService.setUser(response.user);
              console.log('👤 [LOGIN] User stored:', response.user);
            }
            console.log('🚀 [LOGIN] Navigating to dashboard');
            this.route.navigate(['dashboard']);
          } else {
            console.warn('⚠️ [LOGIN] No access token in response:', response);
            this.errorMessage.set('Invalid response from server. Please try again.');
          }
        },
        error: (err) => {
          console.error('❌ [LOGIN] Authentication failed:', {
            error: err,
            errorMessage: err.error?.message || err.message,
            status: err.status,
            statusText: err.statusText,
            fullError: err,
            timestamp: new Date().toISOString(),
          });
          const errorMessage =
            err.error?.message || err.message || 'Unable to connect to the server. Please check your connection and try again.';
          this.errorMessage.set(errorMessage);
        },
      });
  }
}
