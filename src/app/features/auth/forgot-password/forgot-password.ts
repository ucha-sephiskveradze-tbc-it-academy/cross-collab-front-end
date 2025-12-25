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

  /**
   * Handles form submission and sends password reset link.
   * Includes clientUri to specify where the user will be redirected after clicking the link.
   */
  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.form().valid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const email = this.model().email;
    // Construct the client URI where user will be redirected after clicking reset link
    const clientUri = `${window.location.origin}/reset-password`;

    this.authService
      .sendResetPasswordLink(email, clientUri)
      .pipe(
        take(1),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: (response) => {
          this.successMessage.set(
            response.message || 'Password reset link has been sent to your email. Please check your inbox.'
          );
          this.model.set({ email: '' });
        },
        error: (err) => {
          const errorMessage =
            err.error?.message || err.message || 'Failed to send reset password link. Please try again later.';
          this.errorMessage.set(errorMessage);
        },
      });
  }
}
