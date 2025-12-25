import { Component, inject, signal } from '@angular/core';
import { Field, form, required, email, minLength, pattern } from '@angular/forms/signals';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from '../../../shared/ui/button/button';
import { CheckboxModule } from 'primeng/checkbox';
import { Router, RouterLink } from '@angular/router';
import { ILoginFormModel } from './models/login-form.model';
import { AuthService } from '../../../core/services/auth.service';
import { noEmojiRegex } from '../../../shared/validations/validator';
import { AuthTokenService } from '../../../core/services/auth-token.service';

/**
 * Sign-in component handling user authentication.
 * Validates credentials and redirects based on user role.
 */
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

  model = signal<ILoginFormModel>({
    email: '',
    password: '',
  });

  loginForm = form(this.model, (schema) => {
    required(schema.email);
    email(schema.email);
    pattern(schema.email, noEmojiRegex, { message: 'No Emojis Allowed!' });

    required(schema.password);
    minLength(schema.password, 6);
    pattern(schema.password, noEmojiRegex, { message: 'No Emojis Allowed!' });
  });

  /**
   * Handles form submission and user authentication.
   * Stores token and redirects based on user role.
   */
  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.loginForm().valid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const credentials = {
      email: this.loginForm.email().value(),
      password: this.loginForm.password().value(),
    };

    this.authService.authenticate(credentials).subscribe({
      next: (res) => {
        // Handle both accessToken (camelCase) and token formats
        const token = res?.accessToken || res?.token;

        if (!token) {
          this.errorMessage.set('Invalid response from server. Please try again.');
          this.isSubmitting.set(false);
          return;
        }

        this.authService.setToken(token);

        // Store user info - backend returns name and id at root level
        const userData: any = {};
        if (res.name) {
          userData.name = res.name;
        }
        if (res.id) {
          userData.id = res.id;
        }
        if (res.roles) {
          userData.roles = res.roles;
        }
        if (res.user) {
          // If user object exists, merge it
          Object.assign(userData, res.user);
        }
        
        if (Object.keys(userData).length > 0) {
          this.authService.setUser(userData);
        }

        // Small delay to ensure token is stored before reading
        setTimeout(() => {
          const role = this.authTokenService.getRole();

          // Navigate based on role
          if (role === 'Admin') {
            this.router.navigate(['/admin/main']);
          } else {
            this.router.navigate(['/dashboard']);
          }

          this.isSubmitting.set(false);
        }, 100);
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || err.message || 'Invalid email or password. Please try again.'
        );
        this.isSubmitting.set(false);
      },
    });
  }
}
