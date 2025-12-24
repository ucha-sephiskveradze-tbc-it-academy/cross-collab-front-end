import { Component, inject, signal, OnInit } from '@angular/core';
import { Field, form, required, minLength, pattern } from '@angular/forms/signals';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from '../../../shared/ui/button/button';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { noEmojiRegex } from '../../../shared/validations/validator';

/**
 * Reset password component displayed when user clicks the reset link from email.
 * Extracts token from URL query parameters and allows user to set a new password.
 */
@Component({
  selector: 'app-reset-password',
  imports: [InputTextModule, ButtonModule, Field, Button, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  resetToken = signal<string | null>(null);

  model = signal({
    password: '',
    confirmPassword: '',
  });

  resetForm = form(this.model, (schema) => {
    required(schema.password, { message: 'Password is required' });
    minLength(schema.password, 6, { message: 'Password must be at least 6 characters' });
    pattern(schema.password, noEmojiRegex, { message: 'No Emojis Allowed!' });

    required(schema.confirmPassword, { message: 'Please confirm your password' });
  });

  ngOnInit(): void {
    // Extract token from URL query parameters
    this.route.queryParams.subscribe((params) => {
      const token = params['token'] || params['resetToken'];
      if (token) {
        this.resetToken.set(token);
      } else {
        this.errorMessage.set('Invalid or missing reset token. Please request a new password reset link.');
      }
    });
  }

  /**
   * Handles form submission and password reset.
   * Validates password match and calls the reset password API.
   */
  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.resetForm().valid() || this.isSubmitting() || !this.resetToken()) return;

    const { password, confirmPassword } = this.model();

    // Validate password match
    if (password !== confirmPassword) {
      this.errorMessage.set('Passwords do not match. Please try again.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.resetPassword(this.resetToken()!, password).subscribe({
      next: (response) => {
        this.successMessage.set(
          response.message || 'Password has been reset successfully. You can now sign in with your new password.'
        );
        this.model.set({ password: '', confirmPassword: '' });

        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || err.message || 'Failed to reset password. The link may have expired. Please request a new one.'
        );
        this.isSubmitting.set(false);
      },
    });
  }
}




