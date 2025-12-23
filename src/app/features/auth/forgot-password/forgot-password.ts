import { Component, inject, signal } from '@angular/core';
import { form, required, email, Field, pattern } from '@angular/forms/signals';
import { ButtonModule } from 'primeng/button';
import { Button } from '../../../shared/ui/button/button';
import { InputTextModule } from 'primeng/inputtext';
import { RouterLink } from '@angular/router';
import { EMAIL_REGEX, noEmojiRegex } from '../../../shared/validations/validator';
import { AuthService } from '../../../core/services/auth.service';
import { take, finalize } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  imports: [InputTextModule, ButtonModule, Field, Button, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private authService = inject(AuthService);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  model = signal({ email: '' });

  form = form(this.model, (schema) => {
    required(schema.email);
    email(schema.email);
    pattern(schema.email, noEmojiRegex, { message: 'No Emojis Allowed!' });
    pattern(schema.email, EMAIL_REGEX, {
      message: 'Please enter a valid email address',
    });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.form().valid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const email = this.model().email;
    console.log('🔑 [FORGOT PASSWORD] Sending reset password link request:', {
      email,
      timestamp: new Date().toISOString(),
    });

    this.authService
      .sendResetPasswordLink(email)
      .pipe(
        take(1),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: (response) => {
          console.log('✅ [FORGOT PASSWORD] Reset link sent successfully:', {
            response,
            message: response.message,
            timestamp: new Date().toISOString(),
          });
          this.successMessage.set(
            response.message || 'Password reset link has been sent to your email. Please check your inbox.'
          );
          this.model.set({ email: '' });
        },
        error: (err) => {
          console.error('❌ [FORGOT PASSWORD] Failed to send reset link:', {
            error: err,
            errorMessage: err.error?.message || err.message,
            status: err.status,
            statusText: err.statusText,
            fullError: err,
            timestamp: new Date().toISOString(),
          });
          const errorMessage =
            err.error?.message || err.message || 'Failed to send reset password link. Please try again later.';
          this.errorMessage.set(errorMessage);
        },
      });
  }
}
