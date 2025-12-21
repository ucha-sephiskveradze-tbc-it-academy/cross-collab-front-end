import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Field, form, required, email, minLength } from '@angular/forms/signals';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from '../../../shared/ui/button/button';
import { CheckboxModule } from 'primeng/checkbox';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  imports: [CommonModule, InputTextModule, CheckboxModule, ButtonModule, Field, Button, RouterLink],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {
  private route = inject(Router);

  isSubmitting = signal(false);

  // Signal model for login
  model = signal({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Signal form schema
  loginForm = form(this.model, (schema) => {
    required(schema.email);
    email(schema.email);
    required(schema.password);
    minLength(schema.password, 6);
    // rememberMe is optional
  });

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.loginForm().valid()) return;

    this.isSubmitting.set(true);

    const payload = this.model();

    console.log('Login payload:', payload);

    // Simulate async login
    setTimeout(() => {
      this.isSubmitting.set(false);
      console.log('Signed in successfully');
    }, 500);
    this.route.navigate(['dashboard']);
  }
}
