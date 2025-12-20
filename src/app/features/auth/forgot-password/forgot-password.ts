import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { form, required, email, Field } from '@angular/forms/signals';
import { ButtonModule } from 'primeng/button';
import { Button } from '../../../shared/ui/button/button';
import { InputTextModule } from 'primeng/inputtext';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, InputTextModule, ButtonModule, Field, Button, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  isSubmitting = signal(false);

  model = signal({ email: '' });

  form = form(this.model, (schema) => {
    required(schema.email);
    email(schema.email);
  });

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.form().valid()) return;

    this.isSubmitting.set(true);
    console.log('Reset link sent to:', this.model().email);

    setTimeout(() => {
      this.isSubmitting.set(false);
    }, 500);
    this.model.set({ email: '' });
  }
}
